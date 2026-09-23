import { FormSection, FormField } from '../../types';
import { formVersionRepository } from '../../repositories/formVersionRepository';

export const formBuilderService = {
  async addSection(versionId: string, title: string, description?: string): Promise<FormSection> {
    const version = await formVersionRepository.getById(versionId);
    if (!version) throw new Error('Versão não encontrada');

    const newSection: FormSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      versionId,
      title,
      description,
      order: (version.sections?.length || 0) + 1,
    };

    version.sections = [...(version.sections || []), newSection];
    await formVersionRepository.save(version);
    return newSection;
  },

  async updateSection(versionId: string, sectionId: string, data: Partial<Pick<FormSection, 'title' | 'description' | 'order'>>): Promise<FormSection> {
    const version = await formVersionRepository.getById(versionId);
    if (!version) throw new Error('Versão não encontrada');

    const index = version.sections.findIndex((s) => s.id === sectionId);
    if (index < 0) throw new Error('Seção não encontrada');

    version.sections[index] = { ...version.sections[index], ...data };
    await formVersionRepository.save(version);
    return version.sections[index];
  },

  async removeSection(versionId: string, sectionId: string): Promise<void> {
    const version = await formVersionRepository.getById(versionId);
    if (!version) throw new Error('Versão não encontrada');

    version.sections = version.sections.filter((s) => s.id !== sectionId);
    await formVersionRepository.save(version);

    // Desativa campos da seção removida
    const fields = await formVersionRepository.getFieldsByVersionId(versionId);
    const sectionFields = fields.filter((f) => f.sectionId === sectionId);
    for (const f of sectionFields) {
      await formVersionRepository.deleteField(f.id);
    }
  },

  async addField(fieldData: Omit<FormField, 'id'>): Promise<FormField> {
    const fieldId = `f-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newField: FormField = {
      ...fieldData,
      id: fieldId,
      active: true,
    };

    return formVersionRepository.saveField(newField);
  },

  async updateField(field: FormField): Promise<FormField> {
    return formVersionRepository.saveField(field);
  },

  async removeField(fieldId: string): Promise<void> {
    await formVersionRepository.deleteField(fieldId);
  },

  async reorderFields(versionId: string, orderedFieldIds: string[]): Promise<void> {
    const fields = await formVersionRepository.getFieldsByVersionId(versionId);
    const updated = fields.map((f) => {
      const idx = orderedFieldIds.indexOf(f.id);
      return idx >= 0 ? { ...f, order: idx + 1 } : f;
    });
    await formVersionRepository.saveFieldsBatch(updated);
  },
};
