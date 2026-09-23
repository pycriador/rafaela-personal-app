import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { FormResponseViewer } from '../../../components/forms/FormResponseViewer';
import { formResponseService } from '../../../services/anamnesis/formResponseService';
import { formService } from '../../../services/anamnesis/formService';
import { formVersionService } from '../../../services/anamnesis/formVersionService';
import { studentRepository } from '../../../repositories/studentRepository';
import { FormResponse, Form, FormVersion, FormField, Student } from '../../../types';

export const ResponseViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [response, setResponse] = useState<FormResponse | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [version, setVersion] = useState<FormVersion | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const resp = await formResponseService.getResponseById(id);
        if (!resp) {
          navigate('/personal/anamnesis');
          return;
        }
        setResponse(resp);

        const [f, v, st, fList] = await Promise.all([
          formService.getFormById(resp.formId),
          formVersionService.getVersionById(resp.formVersionId),
          studentRepository.getById(resp.studentId),
          formVersionService.getFieldsForVersion(resp.formVersionId),
        ]);

        setForm(f);
        setVersion(v);
        setStudent(st);
        setFields(fList);
      } catch (err) {
        console.error('Erro ao carregar resposta:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, navigate]);

  if (loading || !response) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Carregando resposta da anamnese...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="text-xs"
        >
          Voltar
        </Button>
      </div>

      <FormResponseViewer
        response={response}
        form={form}
        version={version}
        fields={fields}
        student={student}
      />
    </div>
  );
};
