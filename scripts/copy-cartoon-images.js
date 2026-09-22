const fs = require('fs');
const path = require('path');
const { exercises } = require('@bryllim/workout-guide');

const targetDir = path.join(__dirname, '../public/exercises');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Mapping of our exercise IDs to workout-guide slugs
const mapping = {
  'exercise-peito-01': 'machine-chest-press',
  'exercise-peito-02': 'bench-press',
  'exercise-peito-03': 'incline-dumbbell-press',
  'exercise-peito-04': 'cable-fly',
  'exercise-peito-05': 'push-up',

  'exercise-costas-01': 'lat-pulldown',
  'exercise-costas-02': 'machine-row',
  'exercise-costas-03': 'barbell-row',
  'exercise-costas-04': 'one-arm-dumbbell-row',
  'exercise-costas-05': 'pull-up',

  'exercise-pernas-01': 'leg-press',
  'exercise-pernas-02': 'barbell-squat',
  'exercise-pernas-03': 'goblet-squat',
  'exercise-pernas-04': 'leg-extension',
  'exercise-pernas-05': 'lying-leg-curl',
  'exercise-pernas-06': 'romanian-deadlift',
  'exercise-pernas-07': 'dumbbell-lunge',

  'exercise-ombros-01': 'seated-overhead-press',
  'exercise-ombros-02': 'seated-dumbbell-press',
  'exercise-ombros-03': 'lateral-raise',
  'exercise-ombros-04': 'front-raise',

  'exercise-biceps-01': 'barbell-curl',
  'exercise-biceps-02': 'dumbbell-bicep-curl',
  'exercise-biceps-03': 'hammer-curl',

  'exercise-triceps-01': 'tricep-pushdown',
  'exercise-triceps-02': 'overhead-tricep-extension',
  'exercise-triceps-03': 'skull-crusher',

  'exercise-core-01': 'plank',
  'exercise-core-02': 'crunch',
  'exercise-core-03': 'hanging-leg-raise',
  'exercise-core-04': 'dead-bug',
};

const allSlugs = new Set(exercises.map(e => e.slug));

let copiedCount = 0;
for (const [exId, preferredSlug] of Object.entries(mapping)) {
  let slugToUse = preferredSlug;
  if (!allSlugs.has(slugToUse)) {
    // try to find close match
    const found = exercises.find(e => e.slug.includes(preferredSlug.split('-')[0]));
    if (found) {
      slugToUse = found.slug;
    }
  }

  const sourceFile = path.join(__dirname, '../node_modules/@bryllim/workout-guide/assets', slugToUse, 'frame-1.png');
  const destFile = path.join(targetDir, `${exId}.png`);

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    copiedCount++;
    console.log(`Copied ${slugToUse} -> ${exId}.png`);
  } else {
    console.warn(`File not found for ${slugToUse}: ${sourceFile}`);
  }
}

console.log(`\nSuccessfully copied ${copiedCount} cartoon exercise illustrations to public/exercises/!`);
