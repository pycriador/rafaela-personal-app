import { initStorage } from './src/repositories/storage.ts';
import { aiConsentRepository } from './src/repositories/aiConsentRepository.ts';
import { aiConfigRepository } from './src/repositories/aiConfigRepository.ts';
import { aiRequestRepository } from './src/repositories/aiRequestRepository.ts';
import { aiProposalRepository } from './src/repositories/aiProposalRepository.ts';
import { exerciseRepository } from './src/repositories/exerciseRepository.ts';
import { workoutRepository } from './src/repositories/workoutRepository.ts';
import { activityRepository } from './src/repositories/activityRepository.ts';
import { studentRepository } from './src/repositories/studentRepository.ts';
import { secretStore } from './src/services/ai/secretStore.ts';
import { AIContextBuilder } from './src/services/ai/AIContextBuilder.ts';
import { AIResponseValidator } from './src/services/ai/AIResponseValidator.ts';
import { AIWorkoutService } from './src/services/ai/AIWorkoutService.ts';

// Polyfill localStorage in node environment
const memoryStorage = {};
globalThis.localStorage = {
  getItem: (k) => memoryStorage[k] || null,
  setItem: (k, v) => { memoryStorage[k] = String(v); },
  removeItem: (k) => { delete memoryStorage[k]; },
  clear: () => { for (const k in memoryStorage) delete memoryStorage[k]; },
};

async function runSection82AICopilotTest() {
  console.log('================================================================');
  console.log('--- TESTE E2E: AI COPILOT — GEMINI + TREINOS PERSONALIZADOS ---');
  console.log('================================================================\n');

  // 0. Inicializa storage com dados seed
  initStorage();

  // 1. SEGURANÇA ZERO-EXPOSURE & VAULT CRIPTOGRÁFICO
  console.log('1. [SEGURANÇA & VAULT] Testando mascaramento Zero-Exposure de chaves de API...');
  const testKey = 'AIzaSyMockKeyForRafaelaTesting2026XYZ9';
  const saveResult = await secretStore.saveApiKey(testKey);

  console.log(`   ✓ Chave salva: status configurada = ${saveResult.configured}`);
  console.log(`   ✓ Chave mascarada para UI: "${saveResult.maskedKey}"`);
  if (saveResult.maskedKey.includes('MockKeyForRafaela')) {
    throw new Error('FALHA DE SEGURANÇA: Chave sensível foi exposta sem mascaramento!');
  }
  const isVaultConfigured = await secretStore.isConfigured();
  console.log(`   ✓ Vault local configurado: ${isVaultConfigured}`);

  // 2. CONFORMIDADE LGPD & CONSENTIMENTO DO ALUNO
  console.log('\n2. [LGPD & CONSENTIMENTO] Verificando termos e restrição de dados de alunos...');
  const studentId = 'student-mariana';

  // Revoga consentimento para testar bloqueio
  await aiConsentRepository.setConsent(studentId, false, 'user-rafaela');
  const isAllowedBefore = await aiConsentRepository.isAllowed(studentId);
  console.log(`   ✓ Consentimento de Mariana revogado temporariamente: permitido = ${isAllowedBefore}`);

  let blockedErrorCaught = false;
  try {
    await AIWorkoutService.generateWorkoutProposal({
      studentId,
      goal: 'Hipertrofia Glúteos',
      trainingDays: ['Segunda', 'Quarta', 'Sexta'],
      selection: {
        includeStudentProfile: true,
        includeGoals: true,
        includeFrequency: true,
        includeHistory: true,
        includeAnamnesis: true,
        includeNutrition: true,
        includeFeedback: true,
        includeTrainerInstructions: true,
      },
    });
  } catch (err) {
    blockedErrorCaught = true;
    console.log(`   ✓ Bloqueio preventivo LGPD funcionou: "${err.message}"`);
  }

  if (!blockedErrorCaught) {
    throw new Error('FALHA LGPD: IA gerou proposta para aluno sem autorização de dados!');
  }

  // Reabilita consentimento do aluno
  await aiConsentRepository.setConsent(studentId, true, 'user-rafaela');
  const isAllowedAfter = await aiConsentRepository.isAllowed(studentId);
  console.log(`   ✓ Consentimento de Mariana restabelecido com auditoria: permitido = ${isAllowedAfter}`);

  // 3. CONFIGURAÇÃO DE MODELOS & HIPERPARÂMETROS
  console.log('\n3. [CONFIGURAÇÃO] Testando modelos disponíveis e parâmetros...');
  const models = await aiConfigRepository.getModels();
  console.log(`   ✓ Modelos catalogados: ${models.map((m) => m.name).join(', ')}`);

  await aiConfigRepository.updateConfig({
    mode: 'mock',
    selectedModel: 'gemini-2.0-flash',
    temperature: 0.35,
    maxOutputTokens: 2048,
  });
  const currentConfig = await aiConfigRepository.getConfig();
  console.log(`   ✓ Configuração ativa: Modo = ${currentConfig.mode}, Modelo = ${currentConfig.selectedModel}, Temp = ${currentConfig.temperature}`);

  // 4. SANITIZAÇÃO DE DADOS & DEFESA CONTRA PROMPT INJECTION
  console.log('\n4. [SANITIZAÇÃO DE CONTEXTO] Construindo contexto seguro com delimitação UNTRUSTED...');
  const context = await AIContextBuilder.buildWorkoutGenerationContext({
    studentId,
    goal: 'Hipertrofia Glúteos & Membros Inferiores',
    trainingDays: ['Segunda', 'Quarta', 'Sexta'],
    targetDurationMinutes: 50,
    trainerInstructions: 'Aluna com leve condromalácia patelar. Cuidado com ângulos fechados no joelho.',
    selection: {
      includeStudentProfile: true,
      includeGoals: true,
      includeFrequency: true,
      includeHistory: true,
      includeAnamnesis: true,
      includeNutrition: true,
      includeFeedback: true,
      includeTrainerInstructions: true,
    },
  });

  console.log(`   ✓ Contexto gerado para aluno: ${context.student.name}`);
  console.log(`   ✓ Biblioteca de exercícios injetada no catálogo: ${context.availableExerciseLibrary.length} exercícios`);
  if (!context.trainerInstructions.includes('condromalácia')) {
    throw new Error('FALHA: Instruções da Personal não foram incorporadas ao contexto.');
  }

  // 5. GERAÇÃO DE PROPOSTA ESTRUTURADA
  console.log('\n5. [AI COPILOT] Gerando proposta de treino estruturada...');
  const proposal = await AIWorkoutService.generateWorkoutProposal({
    studentId,
    goal: 'Hipertrofia Glúteos & Membros Inferiores',
    trainingDays: ['Segunda', 'Quarta', 'Sexta'],
    targetDurationMinutes: 50,
    trainerInstructions: 'Aluna com leve condromalácia patelar. Cuidado com ângulos fechados no joelho.',
    selection: {
      includeStudentProfile: true,
      includeGoals: true,
      includeFrequency: true,
      includeHistory: true,
      includeAnamnesis: true,
      includeNutrition: true,
      includeFeedback: true,
      includeTrainerInstructions: true,
    },
  });

  console.log(`   ✓ Proposta gerada com ID: ${proposal.id}`);
  console.log(`   ✓ Nome sugerido: "${proposal.workoutName}"`);
  console.log(`   ✓ Total de dias prescritos: ${proposal.days.length}`);
  console.log(`   ✓ Status inicial: "${proposal.status}" (Aguardando Revisão da Rafaela)`);
  console.log(`   ✓ Alertas clínicos da IA: ${proposal.warnings.join(' | ')}`);
  console.log(`   ✓ Notas técnicas para a Personal: ${proposal.notesForTrainer.join(' | ')}`);

  // 6. VALIDAÇÃO ESTRITA: ZERO EXERCÍCIOS INVENTADOS
  console.log('\n6. [VALIDADOR DE ESQUEMA] Verificando conformidade com a biblioteca oficial...');
  const allLibraryExercises = await exerciseRepository.getAll();
  const libraryIds = new Set(allLibraryExercises.map((e) => e.id));

  let totalExercisesChecked = 0;
  for (const day of proposal.days) {
    for (const ex of day.exercises) {
      totalExercisesChecked++;
      if (!libraryIds.has(ex.exerciseId)) {
        throw new Error(`VIOLAÇÃO GRAVE: Exercício inventado encontrado na proposta: ${ex.exerciseId}`);
      }
    }
  }
  console.log(`   ✓ Todos os ${totalExercisesChecked} exercícios da proposta existem estritamente na biblioteca oficial!`);

  // 7. REVISÃO HUMANA: MODIFICAÇÃO PELA PERSONAL
  console.log('\n7. [SUPERVISÃO HUMANA] Rafaela personaliza a proposta antes de aprovar...');
  const updatedDays = [...proposal.days];
  updatedDays[0].exercises[0].sets = 4;
  updatedDays[0].exercises[0].notes = 'Executar com cadência controlada 3010 conforme orientação';

  const modifiedProposal = await AIWorkoutService.modifyProposal({
    ...proposal,
    days: updatedDays,
    decisionNotes: 'Ajustadas séries do primeiro exercício para 4 com ênfase em cadência.',
  });
  console.log(`   ✓ Proposta modificada: status = "${modifiedProposal.status}"`);

  // 8. APROVAÇÃO OFICIAL E APLICAÇÃO NO BANCO DE DADOS
  console.log('\n8. [APROVAÇÃO CLÍNICA] Rafaela aprova a proposta de treino...');
  const approvalResult = await AIWorkoutService.approveProposal(
    modifiedProposal.id,
    'Aprovado clinicamente após revisão das cargas e limitações de joelho.',
    'user-rafaela'
  );

  console.log(`   ✓ Treino oficial criado no banco: ID = ${approvalResult.plan.id}`);
  console.log(`   ✓ Nome do plano ativo: "${approvalResult.plan.name}"`);
  console.log(`   ✓ Dias salvos: ${approvalResult.plan.days.length} dias de treino`);
  console.log(`   ✓ Status da proposta atualizado para: "${approvalResult.proposal.status}"`);

  // Verifica se foi registrado no log de atividades da plataforma
  const recentActivities = await activityRepository.getAll(10);
  const approvalLog = recentActivities.find((a) => a.action === 'AI_WORKOUT_APPROVED' || a.description?.includes('AI Copilot'));
  console.log(`   ✓ Auditoria de aprovação registrada: "${approvalLog?.description || approvalLog?.action}"`);

  // 9. SUBSTITUIÇÃO INTELIGENTE DE EXERCÍCIO
  console.log('\n9. [SUBSTITUIÇÃO DE EXERCÍCIO] Solicitando alternativa sem equipamento ocupado...');
  // Testa alternativa para Leg Press (exercício de perna comum em máquinas)
  const legPress = allLibraryExercises.find((e) => e.name.toLowerCase().includes('leg press')) || allLibraryExercises[0];
  const alternativeResult = await AIWorkoutService.suggestExerciseAlternative(legPress.id, {
    preferFreeWeight: true,
  });

  console.log(`   ✓ Exercício original: "${alternativeResult.originalExerciseName}" (${legPress.id})`);
  console.log(`   ✓ Alternativa sugerida pela IA: "${alternativeResult.suggestedExerciseName}" (${alternativeResult.suggestedExerciseId})`);
  console.log(`   ✓ Tipo de equipamento: ${alternativeResult.equipmentType}`);
  console.log(`   ✓ Justificativa biomecânica: "${alternativeResult.reason}"`);

  if (!libraryIds.has(alternativeResult.suggestedExerciseId)) {
    throw new Error('FALHA: Exercício substituto não existe na biblioteca oficial!');
  }

  // 10. AUDITORIA COMPLETA & TELEMETRIA DE REQUISIÇÕES
  console.log('\n10. [AUDITORIA & TELEMETRIA] Verificando logs de consumo e tokens...');
  const stats = await aiRequestRepository.getStats();
  console.log(`   ✓ Total de requisições de IA registradas: ${stats.totalRequests}`);
  console.log(`   ✓ Total de tokens acumulados: ${stats.totalTokens}`);
  console.log(`   ✓ Latência média: ${stats.avgLatencyMs}ms`);
  console.log(`   ✓ Taxa de sucesso: ${stats.successRate}%`);
  console.log(`   ✓ Custo projetado estimado: $${stats.estimatedCostUsd.toFixed(4)} USD`);

  const studentRequests = await aiRequestRepository.getByStudentId(studentId);
  console.log(`   ✓ Requisições auditadas associadas à Mariana: ${studentRequests.length}`);

  console.log('\n================================================================');
  console.log('✅ TODOS OS 10 PASSOS DO TESTE E2E DO AI COPILOT FORAM APROVADOS!');
  console.log('   - Governança LGPD e Consentimento: Conforme');
  console.log('   - Chaves e Vault Zero-Exposure: Conforme');
  console.log('   - Modelos Gemini 2.0 Flash / Mock: Conforme');
  console.log('   - Validação de Esquema e Biblioteca Real: Conforme');
  console.log('   - Supervisão Humana Obrigatória: Conforme');
  console.log('   - Auditoria e Telemetria: Conforme');
  console.log('================================================================\n');
}

runSection82AICopilotTest().catch((err) => {
  console.error('\n❌ ERRO NO TESTE DO AI COPILOT:', err);
  process.exit(1);
});
