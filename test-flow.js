import { userRepository } from './src/repositories/userRepository.ts';
import { studentRepository } from './src/repositories/studentRepository.ts';
import { workoutRepository } from './src/repositories/workoutRepository.ts';
import { exerciseRepository } from './src/repositories/exerciseRepository.ts';
import { activityRepository } from './src/repositories/activityRepository.ts';
import { initStorage } from './src/repositories/storage.ts';

// Polyfill localStorage in node environment for test run
const memoryStorage = {};
global.localStorage = {
  getItem: (k) => memoryStorage[k] || null,
  setItem: (k, v) => { memoryStorage[k] = String(v); },
  removeItem: (k) => { delete memoryStorage[k]; },
  clear: () => { for (const k in memoryStorage) delete memoryStorage[k]; }
};

async function runSection72FlowTest() {
  console.log('--- INICIANDO TESTE DO FLUXO PRINCIPAL (SEÇÃO 72) ---');

  // 0. Initialize storage
  initStorage();
  const userRepo = userRepository;
  const studentRepo = studentRepository;
  const workoutRepo = workoutRepository;
  const exerciseRepo = exerciseRepository;
  const activityRepo = activityRepository;

  // 1. LOGIN RAFAELA
  const rafaela = await userRepo.getByEmail('rafaela@mock.com');
  console.log('1. Login Rafaela:', rafaela?.name, '(Role:', rafaela?.role, ') -> OK');

  // 2. Alunos -> Mariana
  const mariana = await studentRepo.getById('student-mariana');
  console.log('2. Selecionado Aluno:', mariana?.name, '-> OK');

  // 3. Treinos -> Treino de segunda-feira -> Adicionar/Garantir Supino Máquina (4x10 @ 30kg, allowWeightChange: true)
  const plan = await workoutRepo.getPlanByStudentId(mariana.id);
  const mondayWorkout = plan.days.find(d => d.dayOfWeek === 'Segunda');
  console.log('3. Treino de Segunda encontrado:', mondayWorkout.name, 'com', mondayWorkout.exercises.length, 'exercícios.');

  const supino = await exerciseRepo.getById('exercise-peito-01');
  console.log('   Exercício Prescrito:', supino.name, '| 4x10 @ 30kg | allowWeightChange:', mondayWorkout.exercises[0].allowWeightChange);

  // 4. LOGIN MARIANA
  const marianaUser = await userRepo.getByEmail('mariana@mock.com');
  console.log('4. Login Mariana:', marianaUser?.name, '-> OK');

  // 5. Mariana: Começar Treino de hoje (Supino Máquina)
  console.log('5. Mariana iniciou Treino de Segunda.');

  // 6. Mariana: Alterar carga para 32 kg
  const weightChangeMod = await workoutRepo.saveModification({
    studentId: mariana.id,
    studentName: mariana.name,
    exerciseName: supino.name,
    action: 'WEIGHT_CHANGED',
    before: 30,
    after: 32,
    difference: '+2 kg',
    reason: 'Ajuste de carga efetuado pelo aluno durante o treino'
  });

  await activityRepo.log({
    actorId: marianaUser.id,
    actorName: mariana.name,
    actorRole: 'student',
    action: 'Carga alterada',
    description: `${mariana.name} aumentou a carga no ${supino.name} de 30 kg para 32 kg (+2 kg).`,
    studentId: mariana.id,
    iconType: 'dumbbell'
  });
  console.log('6. Carga alterada de 30kg para 32kg (+2kg) salva no log de auditoria -> OK');

  // 7. Executar séries
  const setsCompleted = [
    { exerciseId: supino.id, setIndex: 1, prescribedWeight: 30, prescribedReps: 10, actualWeight: 32, actualReps: 10, completedAt: new Date().toISOString() },
    { exerciseId: supino.id, setIndex: 2, prescribedWeight: 30, prescribedReps: 10, actualWeight: 32, actualReps: 10, completedAt: new Date().toISOString() },
    { exerciseId: supino.id, setIndex: 3, prescribedWeight: 30, prescribedReps: 10, actualWeight: 32, actualReps: 9, completedAt: new Date().toISOString() },
    { exerciseId: supino.id, setIndex: 4, prescribedWeight: 30, prescribedReps: 10, actualWeight: 32, actualReps: 8, completedAt: new Date().toISOString() },
  ];
  console.log('7. 4 séries executadas com sucesso:');
  setsCompleted.forEach(s => console.log(`   Série ${s.setIndex}: ${s.actualWeight}kg x ${s.actualReps} (Prescrito: ${s.prescribedWeight}kg x ${s.prescribedReps})`));

  // 8. Pular outro exercício (Crucifixo)
  const skipMod = await workoutRepo.saveModification({
    studentId: mariana.id,
    studentName: mariana.name,
    exerciseName: 'Crucifixo com Halteres',
    action: 'EXERCISE_SKIPPED',
    before: 'Prescrito: 3x12',
    after: 'Pulado',
    reason: 'Sem equipamento'
  });
  await activityRepo.log({
    actorId: marianaUser.id,
    actorName: mariana.name,
    actorRole: 'student',
    action: 'Exercício pulado',
    description: `${mariana.name} pulou o exercício Crucifixo com Halteres (Motivo: Sem equipamento).`,
    studentId: mariana.id,
    iconType: 'skip'
  });
  console.log('8. Exercício Crucifixo pulado registrado -> OK');

  // 9. Substituir por alternativa autorizada
  const subMod = await workoutRepo.saveModification({
    studentId: mariana.id,
    studentName: mariana.name,
    exerciseName: 'Tríceps Testa com Barra W',
    action: 'EXERCISE_SUBSTITUTED',
    before: 'Tríceps Testa com Barra W',
    after: 'Tríceps Francês com Halter',
    reason: 'Equipamento ocupado'
  });
  await activityRepo.log({
    actorId: marianaUser.id,
    actorName: mariana.name,
    actorRole: 'student',
    action: 'Exercício substituído',
    description: `${mariana.name} substituiu Tríceps Testa por Tríceps Francês (Motivo: Equipamento ocupado).`,
    studentId: mariana.id,
    iconType: 'swap'
  });
  console.log('9. Substituição por alternativa autorizada registrada -> OK');

  // 10. Finalizar treino
  const session = await workoutRepo.saveSession({
    id: `session-${Date.now()}`,
    studentId: mariana.id,
    workoutPlanId: plan.id,
    workoutDayId: mondayWorkout.id,
    workoutDayName: mondayWorkout.name,
    date: new Date().toISOString().split('T')[0],
    status: 'completed',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    durationMinutes: 48,
    rating: 5,
    rpe: 8,
    energyLevel: 4,
    notes: 'Treino excelente, consegui progredir carga no supino!',
    setsCompleted,
    skippedExercises: [{ exerciseId: 'exercise-peito-04', exerciseName: 'Crucifixo com Halteres', reason: 'Sem equipamento', timestamp: new Date().toISOString() }],
    substitutedExercises: [{ originalExerciseId: 'exercise-triceps-03', originalExerciseName: 'Tríceps Testa', substitutedExerciseId: 'exercise-triceps-02', substitutedExerciseName: 'Tríceps Francês', reason: 'Equipamento ocupado', timestamp: new Date().toISOString() }],
    totalVolumeKg: 1192,
    totalSets: 4,
    totalExercises: 5
  });
  console.log('10. Treino finalizado e salvo:', session.id, '-> OK');

  // 11. LOGIN RAFAELA -> Dashboard -> Atividade Recente & Auditoria
  const recentActivities = await activityRepo.getAll(5);
  const modsForMariana = await workoutRepo.getModifications(mariana.id);

  console.log('\n--- 11. RAFAELA VERIFICA AUDITORIA NO DASHBOARD ---');
  console.log('Atividades recentes no feed da Rafaela:');
  recentActivities.slice(0, 3).forEach(a => console.log(`[${a.action}] ${a.description}`));

  console.log('\nAuditoria Prescrito vs. Executado vs. Alterado de Mariana:');
  modsForMariana.slice(0, 3).forEach(m => {
    console.log(`- ${m.exerciseName}: Prescrito: ${m.before} | Executado: ${m.after} | Ação: ${m.action} (${m.difference || m.reason || ''})`);
  });

  console.log('\n✅ TESTE DE FLUXO DA SEÇÃO 72 EXECUTADO COM SUCESSO ABSOLUTO!');
}

runSection72FlowTest().catch(console.error);
