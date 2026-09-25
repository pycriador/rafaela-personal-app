import { Form, FormVersion, AnamnesisStats } from '../../types';
import { formRepository } from '../../repositories/formRepository';
import { formVersionRepository } from '../../repositories/formVersionRepository';
import { formApplicationRepository } from '../../repositories/formApplicationRepository';
import { formResponseRepository } from '../../repositories/formResponseRepository';
import { activityRepository } from '../../repositories/activityRepository';

export const formService = {
  async getForms(): Promise<Form[]> {
    return formRepository.getAll();
  },

  async getFormById(id: string): Promise<Form | null> {
    return formRepository.getById(id);
  },

  async createForm(data: { name: string; description: string; createdBy?: string }): Promise<{ form: Form; version: FormVersion }> {
    const formId = `form-${Date.now()}`;
    const versionId = `ver-${Date.now()}-v1`;

    const initialVersion: FormVersion = {
      id: versionId,
      formId,
      version: 1,
      status: 'draft',
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          versionId,
          title: 'Dados Gerais',
          description: 'Seção inicial de perguntas',
          order: 1,
        },
      ],
      termsVersion: '1.0',
      createdAt: new Date().toISOString(),
    };

    await formVersionRepository.save(initialVersion);

    const newForm: Form = {
      id: formId,
      name: data.name,
      description: data.description,
      status: 'draft',
      currentVersionId: versionId,
      createdBy: data.createdBy || 'user-rafaela',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedForm = await formRepository.save(newForm);

    await activityRepository.log({
      actorId: data.createdBy || 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Formulário criado',
      description: `Rafaela criou o formulário "${newForm.name}".`,
      iconType: 'edit',
    });

    return { form: savedForm, version: initialVersion };
  },

  async updateForm(id: string, data: Partial<Pick<Form, 'name' | 'description' | 'status'>>): Promise<Form | null> {
    const form = await formRepository.getById(id);
    if (!form) return null;

    const updated = await formRepository.save({
      ...form,
      ...data,
      updatedAt: new Date().toISOString(),
    });

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Formulário alterado',
      description: `Rafaela alterou os dados do formulário "${updated.name}".`,
      iconType: 'edit',
    });

    return updated;
  },

  async archiveForm(id: string): Promise<Form | null> {
    const form = await formRepository.getById(id);
    if (!form) return null;

    const archived = await formRepository.archive(id);

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Formulário arquivado',
      description: `Rafaela arquivou o formulário "${form.name}". O histórico de respostas foi preservado.`,
      iconType: 'skip',
    });

    return archived;
  },

  async deleteForm(id: string): Promise<boolean> {
    const form = await formRepository.getById(id);
    const success = await formRepository.delete(id);
    if (success && form) {
      await activityRepository.log({
        actorId: 'user-rafaela',
        actorName: 'Rafaela Personal',
        actorRole: 'personal',
        action: 'Formulário excluído',
        description: `Rafaela excluiu o formulário "${form.name}".`,
        iconType: 'skip',
      });
    }
    return success;
  },

  async getStats(): Promise<AnamnesisStats> {
    const [forms, applications, responses] = await Promise.all([
      formRepository.getAll(),
      formApplicationRepository.getAll(),
      formResponseRepository.getAll(),
    ]);

    const activeForms = forms.filter((f) => f.status === 'active').length;
    const pendingApps = applications.filter((a) => a.status === 'pending').length;
    const submittedResps = responses.filter((r) => r.status === 'submitted' || r.status === 'reviewed').length;

    const now = new Date();
    const expiredApps = applications.filter((a) => {
      if (a.status === 'pending' && a.dueAt) {
        return new Date(a.dueAt) < now;
      }
      return a.status === 'expired';
    }).length;

    return {
      activeFormsCount: activeForms,
      pendingApplicationsCount: pendingApps,
      submittedResponsesCount: submittedResps,
      expiredApplicationsCount: expiredApps,
    };
  },
};
