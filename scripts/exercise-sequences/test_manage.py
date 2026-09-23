"""Regression checks for backup and overwrite protection (temporary files only)."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image, ImageDraw
import manage


class SafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        locations = dict(BACKUP=root/'backup', SOURCE=root/'backup/exercises',
                         STAGE=root/'stage', PACKAGE=root/'stage/exercises', PUBLIC=root/'public')
        self.overrides = patch.multiple(manage, **locations)
        self.overrides.start()
        self.addCleanup(self.overrides.stop)
        records, staged = [], {}
        for i in (1, 2, 3):
            rel = f'frames/example/frame-{i}.png'
            for parent in (manage.SOURCE, manage.PUBLIC, manage.PACKAGE):
                path = parent/rel
                path.parent.mkdir(parents=True, exist_ok=True)
                im = Image.new('RGBA', (512, 512), (255, 255, 255, 0))
                ImageDraw.Draw(im).line((90+i*8, 100, 200, 300), fill='white', width=3)
                if parent == manage.PACKAGE:
                    im.putpixel((100, 150+i), (255, 255, 255, 128))
                im.save(path)
            # Exercise PowerShell's Windows path/case manifest representation.
            records.append({'path': rel.replace('/', '\\'), 'sha256': manage.digest(manage.SOURCE/rel).upper()})
            staged[rel] = manage.digest(manage.PACKAGE/rel)
        (manage.BACKUP/'manifest.json').write_text(json.dumps(records))
        (manage.STAGE/'package-manifest.json').write_text(json.dumps(staged))
        report = manage.STAGE/'candidate/example/report.json'
        report.parent.mkdir(parents=True)
        report.write_text(json.dumps({'mode': 'stabilized-original-poses', 'camera_matrices': []}))

    def test_apply_idempotence_and_exact_restore(self):
        with contextlib.redirect_stdout(io.StringIO()):
            manage.install()
            manage.install()
            report = json.loads((manage.STAGE/'apply-report.json').read_text())
            self.assertEqual(report['changed'], 0)
            manage.install(restore=True)
        self.assertTrue(all(manage.digest(manage.PUBLIC/rel) == sha for rel, sha in manage.manifest().items()))

    def test_user_edit_blocks_entire_batch_before_first_write(self):
        first = manage.PUBLIC/'frames/example/frame-1.png'
        original = first.read_bytes()
        (manage.PUBLIC/'frames/example/frame-3.png').write_bytes(b'user edit')
        with contextlib.redirect_stdout(io.StringIO()), self.assertRaisesRegex(RuntimeError, 'edited since backup'):
            manage.install()
        self.assertEqual(first.read_bytes(), original)

    def test_corrupt_backup_blocks_restore(self):
        (manage.SOURCE/'frames/example/frame-3.png').write_bytes(b'corruption')
        with self.assertRaisesRegex(RuntimeError, 'Backup hash mismatch'):
            manage.install(restore=True)

    def test_corrupt_package_blocks_apply(self):
        path = manage.PACKAGE/'frames/example/frame-3.png'
        im = Image.open(path).copy()
        im.putpixel((120, 120), (255, 255, 255, 255))
        im.save(path)
        with contextlib.redirect_stdout(io.StringIO()), self.assertRaisesRegex(RuntimeError, 'Validation failed'):
            manage.install()


if __name__ == '__main__':
    unittest.main()
