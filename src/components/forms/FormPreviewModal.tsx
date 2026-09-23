import React from 'react';
import { Form, FormVersion, FormField } from '../../types';
import { Modal } from '../ui/Modal';
import { FormRenderer } from './FormRenderer';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: Form;
  version: FormVersion;
  fields: FormField[];
}

export const FormPreviewModal: React.FC<FormPreviewModalProps> = ({
  isOpen,
  onClose,
  form,
  version,
  fields,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Pré-visualização: ${form.name}`}
      description="Esta é a visão interativa exata que o aluno terá ao responder o formulário."
      size="lg"
    >
      <div className="py-2 max-h-[75vh] overflow-y-auto pr-1">
        <FormRenderer
          version={version}
          fields={fields}
          readonly={false}
          onSubmit={async () => {
            alert('Modo pré-visualização: Envio simulado com sucesso!');
            onClose();
          }}
        />
      </div>
    </Modal>
  );
};
