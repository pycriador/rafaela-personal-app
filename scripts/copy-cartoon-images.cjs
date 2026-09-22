const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../public/exercises');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Precise mapping of our exercise IDs to workout-guide slugs
const preciseMapping = {
  // Peito
  'exercise-peito-01': 'machine-chest-press',
  'exercise-peito-02': 'bench-press',
  'exercise-peito-03': 'incline-dumbbell-press',
  'exercise-peito-04': 'cable-fly',
  'exercise-peito-05': 'push-up',

  // Costas
  'exercise-costas-01': 'lat-pulldown',
  'exercise-costas-02': 'machine-row',
  'exercise-costas-03': 'barbell-row',
  'exercise-costas-04': 'one-arm-dumbbell-row',
  'exercise-costas-05': 'pull-up',

  // Pernas
  'exercise-pernas-01': 'leg-press',
  'exercise-pernas-02': 'squat',
  'exercise-pernas-03': 'goblet-squat',
  'exercise-pernas-04': 'leg-extension',
  'exercise-pernas-05': 'lying-leg-curl',
  'exercise-pernas-06': 'romanian-deadlift',
  'exercise-pernas-07': 'forward-lunge',

  // Ombros
  'exercise-ombros-01': 'overhead-press',
  'exercise-ombros-02': 'seated-dumbbell-press',
  'exercise-ombros-03': 'lateral-raise',
  'exercise-ombros-04': 'front-raise',

  // Bíceps
  'exercise-biceps-01': 'bicep-curl',
  'exercise-biceps-02': 'incline-dumbbell-curl',
  'exercise-biceps-03': 'hammer-curl',

  // Tríceps
  'exercise-triceps-01': 'tricep-pushdown',
  'exercise-triceps-02': 'overhead-tricep-extension',
  'exercise-triceps-03': 'skull-crusher',

  // Core
  'exercise-core-01': 'plank',
  'exercise-core-02': 'crunch',
  'exercise-core-03': 'hanging-leg-raise',
  'exercise-core-04': 'dead-bug',
};

let count = 0;
for (const [exId, slug] of Object.entries(preciseMapping)) {
  const sourceFile = path.join(__dirname, '../node_modules/@bryllim/workout-guide/assets', slug, 'frame-1.png');
  const destFile = path.join(targetDir, `${exId}.png`);

  if (fs.existsSync(sourceFile)) {
    fs.copyFileSync(sourceFile, destFile);
    count++;
    console.log(`✓ ${exId} (${slug}) -> copied successfully.`);
  } else {
    console.error(`✗ Not found: ${sourceFile}`);
  }
}

console.log(`\nDone! All ${count} cartoon exercise illustrations copied to public/exercises/`);
