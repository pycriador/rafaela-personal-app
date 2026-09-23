import { ConsentRecord } from '../../types';

export const initialConsents: ConsentRecord[] = [
  {
    id: 'consent-mariana-v1',
    responseId: 'resp-mariana-v1',
    studentId: 'student-mariana',
    accepted: true,
    acceptedAt: '2026-08-03T18:45:10.000Z',
    termsVersion: '1.0',
    formVersion: 1,
    statement: 'Declaro que as informações fornecidas nesta anamnese são verdadeiras e completas, autorizando o seu armazenamento seguro para fins exclusivos de prescrição e acompanhamento físico na plataforma Rafaela Personal App.',
  },
  {
    id: 'consent-mariana-v2',
    responseId: 'resp-mariana-v2',
    studentId: 'student-mariana',
    accepted: true,
    acceptedAt: '2026-09-16T20:30:15.000Z',
    termsVersion: '2.0',
    formVersion: 2,
    statement: 'Declaro que as informações fornecidas são autênticas e atualizadas nesta segunda versão.',
  },
  {
    id: 'consent-ana-v1',
    responseId: 'resp-ana-eval',
    studentId: 'student-ana',
    accepted: true,
    acceptedAt: '2026-09-12T14:10:00.000Z',
    termsVersion: '1.0',
    formVersion: 1,
    statement: 'Confirmo a veracidade dos dados de percepção de esforço fornecidos.',
  },
  {
    id: 'consent-joao-init',
    responseId: 'resp-joao-init',
    studentId: 'student-joao',
    accepted: true,
    acceptedAt: '2026-08-10T14:25:00.000Z',
    termsVersion: '1.0',
    formVersion: 1,
    statement: 'Declaro que as informações fornecidas nesta anamnese inicial são verdadeiras e completas.',
  },
];
