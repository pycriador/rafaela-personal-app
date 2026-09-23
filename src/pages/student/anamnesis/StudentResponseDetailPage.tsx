import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { formResponseService } from '../../../services/anamnesis/formResponseService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionRepository } from '../../../repositories/formVersionRepository';
import { FormResponseViewer } from '../../../components/forms/FormResponseViewer';
import { Form, FormVersion, FormField, FormResponse } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export const StudentResponseDetailPage: React.FC = () => {
  const { responseId } = useParams<{ responseId: string }>();
  const navigate = useNavigate();
  const { studentProfile } = useAuth();

  const [response, setResponse] = useState<FormResponse | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [version, setVersion] = useState<FormVersion | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResponseData() {
      if (!responseId) return;

      try {
        const resp = await formResponseService.getResponseById(responseId);
        if (!resp) {
          navigate('/student/anamnesis');
          return;
        }

        const [f, v, flds] = await Promise.all([
          formService.getFormById(resp.formId),
          formVersionRepository.getById(resp.formVersionId),
          formVersionRepository.getFieldsByVersionId(resp.formVersionId),
        ]);

        setResponse(resp);
        setForm(f);
        setVersion(v);
        setFields(flds);
      } catch (err) {
        console.error('Erro ao carregar detalhes da resposta do aluno:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResponseData();
  }, [responseId, navigate]);

  if (loading || !response) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando visualização das respostas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/student/anamnesis')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          Voltar para Minhas Anamneses
        </Button>
      </div>

      <FormResponseViewer
        response={response}
        form={form}
        version={version}
        fields={fields}
        student={studentProfile}
      />
    </div>
  );
};
