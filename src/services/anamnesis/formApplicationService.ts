import { FormApplication } from '../../types';
import { formApplicationRepository } from '../../repositories/formApplicationRepository';
import { formRepository } from '../../repositories/formRepository';
import { studentRepository } from '../../repositories/studentRepository';
import { notificationRepository } from '../../repositories/notificationRepository';
import { activityRepository } from '../../repositories/activityRepository';

export interface ApplyFormInput {
  formId: string;
  formVersionId: string;
  studentId: string;
  dueAt?: string | null;
  message?: string;
  notes?: string;
  isMandatory?: boolean;
}

export const formApplicationService = {
  async getAllApplications(): Promise<FormApplication[]> {
    return formApplicationRepository.getAll();
  },

  async getApplicationsByStudentId(studentId: string): Promise<FormApplication[]> {
    return formApplicationRepository.getByStudentId(studentId);
  },

  async getApplicationById(id: string): Promise<FormApplication | null> {
    return formApplicationRepository.getById(id);
  },

  async applyToStudent(input: ApplyFormInput): Promise<FormApplication> {
    const form = await formRepository.getById(input.formId);
    const student = await studentRepository.getById(input.studentId);

    const application: FormApplication = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      formId: input.formId,
      formVersionId: input.formVersionId,
      studentId: input.studentId,
      status: 'pending',
      assignedBy: 'user-rafaela',
      assignedAt: new Date().toISOString(),
      dueAt: input.dueAt || null,
      message: input.message,
      notes: input.notes,
      isMandatory: input.isMandatory ?? true,
    };

    const saved = await formApplicationRepository.save(application);

    // Notificação ao aluno (respeitando privacidade: NENHUM dado médico sensível)
    if (student) {
      await notificationRepository.create({
        recipientId: student.userId || student.id,
        recipientRole: 'student',
        title: 'Nova Anamnese Disponível',
        message: `A treinadora Rafaela disponibilizou o formulário "${form?.name || 'Anamnese'}" para você preencher.`,
        type: 'info',
        link: `/student/anamnesis/fill/${saved.id}`,
      });
    }

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Formulário aplicado',
      description: `Rafaela aplicou o formulário "${form?.name || 'Formulário'}" para ${student?.name || 'Aluno'}.`,
      studentId: student?.id,
      iconType: 'check',
    });

    return saved;
  },

  async applyToMultipleStudents(data: {
    formId: string;
    formVersionId: string;
    studentIds: string[];
    dueAt?: string | null;
    message?: string;
    isMandatory?: boolean;
  }): Promise<FormApplication[]> {
    const results: FormApplication[] = [];
    for (const studentId of data.studentIds) {
      const app = await this.applyToStudent({
        formId: data.formId,
        formVersionId: data.formVersionId,
        studentId,
        dueAt: data.dueAt,
        message: data.message,
        isMandatory: data.isMandatory,
      });
      results.push(app);
    }
    return results;
  },

  async reapplyToStudent(studentId: string, formId: string, formVersionId?: string): Promise<FormApplication> {
    const form = await formRepository.getById(formId);
    if (!form) throw new Error('Formulário não encontrado');

    const targetVersionId = formVersionId || form.currentVersionId;

    return this.applyToStudent({
      formId,
      formVersionId: targetVersionId,
      studentId,
      message: `Reaplicação periódica do formulário "${form.name}".`,
      isMandatory: true,
    });
  },

  async cancelApplication(applicationId: string): Promise<FormApplication | null> {
    const app = await formApplicationRepository.cancel(applicationId);
    if (app) {
      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Aplicação cancelada',
        description: `Rafaela cancelou a aplicação de formulário pendente.`,
        iconType: 'skip',
      });
    }
    return app;
  },
};
