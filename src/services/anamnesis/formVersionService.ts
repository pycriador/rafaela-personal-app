import { FormVersion, FormField } from '../../types';
import { formVersionRepository } from '../../repositories/formVersionRepository';
import { formRepository } from '../../repositories/formRepository';
import { activityRepository } from '../../repositories/activityRepository';

export const formVersionService = {
  async getVersionsByFormId(formId: string): Promise<FormVersion[]> {
    return formVersionRepository.getByFormId(formId);
  },

  async getVersionById(versionId: string): Promise<FormVersion | null> {
    return formVersionRepository.getById(versionId);
  },

  async getFieldsForVersion(versionId: string): Promise<FormField[]> {
    return formVersionRepository.getFieldsByVersionId(versionId);
  },

  async publishVersion(formId: string, versionId: string): Promise<FormVersion> {
    const version = await formVersionRepository.getById(versionId);
    if (!version) throw new Error('Versão não encontrada');

    version.status = 'published';
    version.publishedAt = new Date().toISOString();
    await formVersionRepository.save(version);

    const form = await formRepository.getById(formId);
    if (form) {
      form.currentVersionId = versionId;
      form.status = 'active';
      form.updatedAt = new Date().toISOString();
      await formRepository.save(form);
    }

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Versão de formulário publicada',
      description: `Rafaela publicou a versão v${version.version} do formulário "${form?.name || 'Formulário'}".`,
      iconType: 'check',
    });

    return version;
  },

  /**
   * Cria uma nova versão (ex: v2) a partir de uma versão existente,
   * clonando de forma imutável as seções e os campos para que a versão anterior nunca seja modificada.
   */
  async createNewVersionFromExisting(formId: string, baseVersionId: string): Promise<FormVersion> {
    const baseVersion = await formVersionRepository.getById(baseVersionId);
    if (!baseVersion) throw new Error('Versão base não encontrada');

    const form = await formRepository.getById(formId);
    if (!form) throw new Error('Formulário não encontrado');

    const versions = await formVersionRepository.getByFormId(formId);
    const maxVersionNumber = Math.max(...versions.map((v) => v.version), 1);
    const newVersionNumber = maxVersionNumber + 1;

    const newVersionId = `ver-${Date.now()}-v${newVersionNumber}`;

    // Clona as seções gerando novos IDs para a nova versão
    const sectionIdMap = new Map<string, string>();
    const clonedSections = (baseVersion.sections || []).map((sec) => {
      const newSecId = `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      sectionIdMap.set(sec.id, newSecId);
      return {
        ...sec,
        id: newSecId,
        versionId: newVersionId,
      };
    });

    const newVersion: FormVersion = {
      id: newVersionId,
      formId,
      version: newVersionNumber,
      status: 'draft',
      sections: clonedSections,
      termsVersion: `${newVersionNumber}.0`,
      createdAt: new Date().toISOString(),
    };

    await formVersionRepository.save(newVersion);

    // Clona os campos da versão anterior vinculando aos novos IDs de seção
    const baseFields = await formVersionRepository.getFieldsByVersionId(baseVersionId);
    const clonedFields: FormField[] = baseFields.map((field) => {
      const newFieldId = `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const targetSectionId = sectionIdMap.get(field.sectionId) || clonedSections[0]?.id || field.sectionId;
      return {
        ...field,
        id: newFieldId,
        versionId: newVersionId,
        sectionId: targetSectionId,
      };
    });

    if (clonedFields.length > 0) {
      await formVersionRepository.saveFieldsBatch(clonedFields);
    }

    // Atualiza o formulário para apontar para a nova versão
    form.currentVersionId = newVersionId;
    form.updatedAt = new Date().toISOString();
    await formRepository.save(form);

    await activityRepository.log({
      actorId: 'user-rafaela',
      actorName: 'Rafaela Personal',
      actorRole: 'personal',
      action: 'Nova versão criada',
      description: `Rafaela iniciou a edição da versão v${newVersionNumber} do formulário "${form.name}".`,
      iconType: 'edit',
    });

    return newVersion;
  },
};
