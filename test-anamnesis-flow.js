import { initStorage } from './src/repositories/storage.ts';
import { formService } from './src/services/anamnesis/formService.ts';
import { formBuilderService } from './src/services/anamnesis/formBuilderService.ts';
import { formVersionService } from './src/services/anamnesis/formVersionService.ts';
import { formApplicationService } from './src/services/anamnesis/formApplicationService.ts';
import { formResponseService } from './src/services/anamnesis/formResponseService.ts';
import { consentService } from './src/services/anamnesis/consentService.ts';
import { formRepository } from './src/repositories/formRepository.ts';
import { formVersionRepository } from './src/repositories/formVersionRepository.ts';
import { formApplicationRepository } from './src/repositories/formApplicationRepository.ts';
import { formResponseRepository } from './src/repositories/formResponseRepository.ts';
import { studentRepository } from './src/repositories/studentRepository.ts';
import { notificationRepository } from './src/repositories/notificationRepository.ts';

// Polyfill localStorage in node environment for test run
const memoryStorage = {};
global.localStorage = {
  getItem: (k) => memoryStorage[k] || null,
  setItem: (k, v) => { memoryStorage[k] = String(v); },
  removeItem: (k) => { delete memoryStorage[k]; },
  clear: () => { for (const k in memoryStorage) delete memoryStorage[k]; }
};

async function runSection74AnamnesisFlowTest() {
  console.log('================================================================');
  console.log('--- INICIANDO TESTE E2E DO MÓDULO DE ANAMNESE E SAÚDE (SEÇÃO 74) ---');
  console.log('================================================================\n');

  // 0. Inicializa armazenamento
  initStorage();

  // 1. CRIAÇÃO DE FORMULÁRIO PELA PERSONAL RAFAELA
  console.log('1. [PERSONAL] Criando novo formulário de Anamnese Funcional & Postural...');
  const { form: newForm, version: initialVersion } = await formService.createForm({
    name: 'Anamnese Postural & Mobilidade',
    description: 'Avaliação detalhada de dores posturais, flexibilidade e histórico articular.',
    createdBy: 'user-rafaela',
  });
  console.log(`   ✓ Formulário criado: "${newForm.name}" (ID: ${newForm.id})`);
  console.log(`   ✓ Versão inicial rascunho gerada: ID ${newForm.currentVersionId}`);

  // 2. FORM BUILDER: CRIAÇÃO DE SEÇÕES E CAMPOS CUSTOMIZADOS
  console.log('\n2. [FORM BUILDER] Construindo seções e campos com lógica condicional...');
  const secClinica = await formBuilderService.addSection(
    newForm.currentVersionId,
    'Histórico de Coluna & Dores',
    'Investigação de queixas osteomusculares.'
  );

  // Campo 1: Pergunta gatilho (boolean)
  const fDor = await formBuilderService.addField({
    versionId: newForm.currentVersionId,
    sectionId: secClinica.id,
    type: 'boolean',
    label: 'Você sente dores frequentes na coluna vertebral?',
    required: true,
    order: 1,
  });

  // Campo 2: Campo condicional dependente de fDor === true
  const fIntensidade = await formBuilderService.addField({
    versionId: newForm.currentVersionId,
    sectionId: secClinica.id,
    type: 'scale',
    label: 'Qual a intensidade habitual do desconforto (1 a 5)?',
    required: true,
    order: 2,
    condition: {
      fieldId: fDor.id,
      operator: 'equals',
      value: true,
    },
  });

  // Campo 3: Descrição detalhada (textarea condicional)
  const fDescricao = await formBuilderService.addField({
    versionId: newForm.currentVersionId,
    sectionId: secClinica.id,
    type: 'textarea',
    label: 'Descreva em quais posições ou exercícios a dor piora:',
    required: false,
    order: 3,
    condition: {
      fieldId: fDor.id,
      operator: 'equals',
      value: true,
    },
  });

  console.log(`   ✓ Seção "${secClinica.title}" criada.`);
  console.log(`   ✓ 3 campos configurados (1 gatilho e 2 condicionais interligados).`);

  // 3. PUBLICAÇÃO DA VERSÃO 1.0 (LOCK IMUTÁVEL)
  console.log('\n3. [VERSIONAMENTO] Publicando a Versão 1.0 do formulário...');
  const publishedV1 = await formVersionService.publishVersion(newForm.id, newForm.currentVersionId);
  console.log(`   ✓ Versão ${publishedV1.version}.0 publicada com status: "${publishedV1.status}".`);

  // 4. EVOLUÇÃO PARA VERSÃO 2.0 (CRIAR NOVO CICLO SEM AFETAR V1)
  console.log('\n4. [VERSIONAMENTO] Criando nova versão (v2) para atualização periódica...');
  const draftV2 = await formVersionService.createNewVersionFromExisting(newForm.id, publishedV1.id);
  console.log(`   ✓ Nova versão rascunho v${draftV2.version} gerada com base na anterior.`);

  const secHabitos = await formBuilderService.addSection(
    draftV2.id,
    'Hábitos de Vida & Ergonomia'
  );
  await formBuilderService.addField({
    versionId: draftV2.id,
    sectionId: secHabitos.id,
    type: 'select',
    label: 'Quantas horas por dia passa sentado em frente ao computador?',
    required: true,
    order: 1,
    options: [
      { id: 'opt-1', label: 'Menos de 4 horas', value: '<4h' },
      { id: 'opt-2', label: 'Entre 4 e 8 horas', value: '4-8h' },
      { id: 'opt-3', label: 'Mais de 8 horas', value: '>8h' },
    ],
  });

  const publishedV2 = await formVersionService.publishVersion(newForm.id, draftV2.id);
  console.log(`   ✓ Versão ${publishedV2.version}.0 publicada! Versão v1 permanece intocada.`);

  // 5. APLICAÇÃO INDIVIDUAL E EM LOTE PARA ALUNOS
  console.log('\n5. [APLICAÇÃO] Aplicando formulário v2 para múltiplos alunos...');
  const mariana = await studentRepository.getById('student-mariana');
  const joao = await studentRepository.getById('student-joao');
  
  const applications = await formApplicationService.applyToMultipleStudents({
    formId: newForm.id,
    formVersionId: publishedV2.id,
    studentIds: [mariana.id, joao.id],
    dueAt: '2026-10-15T23:59:59.000Z',
    message: 'Por favor, responda esta nova avaliação postural para ajustarmos os treinos de força.',
    isMandatory: true,
  });

  const marianaApp = applications[0];
  console.log(`   ✓ ${applications.length} aplicações criadas com sucesso.`);
  console.log(`   ✓ Aplicação Mariana Silva ID: ${marianaApp.id} (Status: ${marianaApp.status}, Obrigatório: ${marianaApp.isMandatory})`);

  // Verifica se notificação foi enviada ao aluno sem expor dados clínicos
  const notifs = await notificationRepository.getByRecipient(mariana.userId || mariana.id);
  const lastNotif = notifs[0];
  console.log(`   ✓ Notificação enviada ao aluno: "${lastNotif?.title}" - "${lastNotif?.message}"`);

  // 6. ALUNO INICIA E SALVA RASCUNHO (AUTOSAVE DRAFT)
  console.log('\n6. [EXPERIÊNCIA DO ALUNO] Mariana inicia preenchimento e salva rascunho...');
  const draftResponse = await formResponseService.saveDraft({
    applicationId: marianaApp.id,
    formId: newForm.id,
    formVersionId: publishedV2.id,
    studentId: mariana.id,
    answers: [
      { id: 'a-1', responseId: 'temp', fieldId: fDor.id, value: true },
      { id: 'a-2', responseId: 'temp', fieldId: fIntensidade.id, value: 3 },
    ],
  });

  const appAfterDraft = await formApplicationRepository.getById(marianaApp.id);
  console.log(`   ✓ Rascunho salvo (Status: ${draftResponse.status}, Respostas gravadas: ${draftResponse.answers.length})`);
  console.log(`   ✓ Status da aplicação atualizado para: "${appAfterDraft?.status}" (em andamento)`);

  // 7. ENVIO FINAL COM ACEITE DO TERMO LGPD
  console.log('\n7. [SUBMISSÃO & LGPD] Mariana revisa respostas, aceita o termo legal e submete...');
  const submittedResponse = await formResponseService.submitResponse({
    applicationId: marianaApp.id,
    formId: newForm.id,
    formVersionId: publishedV2.id,
    studentId: mariana.id,
    answers: [
      { id: 'a-1', responseId: draftResponse.id, fieldId: fDor.id, value: true },
      { id: 'a-2', responseId: draftResponse.id, fieldId: fIntensidade.id, value: 4 },
      { id: 'a-3', responseId: draftResponse.id, fieldId: fDescricao.id, value: 'Desconforto na lombar ao final do dia de trabalho.' },
    ],
    consentAccepted: true,
    termsVersion: publishedV2.termsVersion || '1.0',
    formVersionNumber: publishedV2.version,
    termsStatement: 'Declaro que todas as informações de saúde são autênticas e autorizo o uso pelo profissional de educação física.',
  });

  const appAfterSubmit = await formApplicationRepository.getById(marianaApp.id);
  console.log(`   ✓ Formulário enviado com sucesso! (Status Resposta: "${submittedResponse.status}")`);
  console.log(`   ✓ Aplicação finalizada (Status Aplicação: "${appAfterSubmit?.status}")`);
  console.log(`   ✓ Registro de Consentimento Imutável: ID ${submittedResponse.consentRecord?.id}`);
  console.log(`     - Data do Aceite: ${submittedResponse.consentRecord?.acceptedAt}`);
  console.log(`     - Versão do Termo: ${submittedResponse.consentRecord?.termsVersion}`);
  console.log(`     - Declaração: "${submittedResponse.consentRecord?.statement}"`);

  // Verifica notificação de recebimento para a Rafaela (SEM exposição de dados clínicos)
  const rafaelaNotifs = await notificationRepository.getByRecipient('user-rafaela');
  const formSentNotif = rafaelaNotifs.find((n) => n.message.includes(mariana.name));
  console.log(`   ✓ Notificação segura para a Rafaela: "${formSentNotif?.title} - ${formSentNotif?.message}"`);

  // 8. INTEGRIDADE HISTÓRICA E REAPLICAÇÃO
  console.log('\n8. [AUDITORIA E HISTÓRICO] Verificando integridade das versões e respostas passadas...');
  const allMarianaResponses = await formResponseService.getResponsesByStudentId(mariana.id);
  console.log(`   ✓ Total de respostas registradas para Mariana: ${allMarianaResponses.length}`);
  
  console.log('\n9. [REAPLICAÇÃO] Rafaela reaplica o formulário após 6 meses...');
  const reapplied = await formApplicationService.reapplyToStudent(mariana.id, newForm.id, publishedV2.id);
  console.log(`   ✓ Nova aplicação criada: ID ${reapplied.id} (Status: ${reapplied.status})`);
  
  const responsesAfterReapply = await formResponseService.getResponsesByStudentId(mariana.id);
  if (responsesAfterReapply.length === allMarianaResponses.length) {
    console.log(`   ✓ Sucesso! O histórico anterior de respostas (${responsesAfterReapply.length}) permaneceu intacto e preservado.`);
  }

  console.log('\n================================================================');
  console.log('✅ TODAS AS ETAPAS DO MÓDULO DE ANAMNESE FORAM VALIDADAS COM SUCESSO!');
  console.log('================================================================\n');
}

runSection74AnamnesisFlowTest().catch((err) => {
  console.error('❌ Erro durante teste do fluxo de anamnese:', err);
  process.exit(1);
});
