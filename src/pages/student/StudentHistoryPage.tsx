import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workoutRepository } from '../../repositories/workoutRepository';
import { WorkoutSession, WorkoutModification } from '../../types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Dumbbell, History, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export const StudentHistoryPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [modifications, setModifications] = useState<WorkoutModification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) return;
      const [sess, mods] = await Promise.all([
        workoutRepository.getSessions(studentProfile.id),
        workoutRepository.getModifications(studentProfile.id),
      ]);
      setSessions(sess);
      setModifications(mods);
      setLoading(false);
    }
    load();
  }, [studentProfile]);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Histórico de Treinos
        </h1>
        <p className="text-xs text-slate-500 dark:text-dark-muted mt-0.5">
          Todas as suas sessões executadas, cargas levantadas e alterações registradas
        </p>
      </div>

      {sessions.length === 0 ? (
        <Card className="py-12 text-center text-xs text-slate-400">
          Nenhum treino realizado até o momento. Comece seu primeiro treino hoje!
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((s) => (
            <Card key={s.id} className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-dark-border/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {s.workoutDayName}
                    </h3>
                    <Badge variant={s.status === 'completed' ? 'success' : 'warning'} size="sm">
                      {s.status === 'completed' ? 'Concluído' : 'Incompleto'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {new Date(s.date).toLocaleDateString()} • {s.durationMinutes || 45} minutos
                  </p>
                </div>

                {s.rating && (
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-500">
                      {s.rating === 1 && '😫 Difícil'}
                      {s.rating === 2 && '😣 Pesado'}
                      {s.rating === 3 && '😐 Normal'}
                      {s.rating === 4 && '💪 Muito bom'}
                      {s.rating === 5 && '🚀 Excelente'}
                    </span>
                    {s.rpe && <span className="text-[10px] text-slate-400 block">RPE {s.rpe}/10</span>}
                  </div>
                )}
              </div>

              {/* Metric badges */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-dark-cardElevated/50 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">SÉRIES</span>
                  <strong className="text-slate-900 dark:text-white">{s.totalSets}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">VOLUME TOTAL</span>
                  <strong className="text-emerald-500">{s.totalVolumeKg} kg</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PULADOS</span>
                  <strong className={s.skippedExercises.length > 0 ? 'text-rose-500' : 'text-slate-500'}>
                    {s.skippedExercises.length}
                  </strong>
                </div>
              </div>

              {/* Skipped or Substituted details */}
              {s.skippedExercises.length > 0 && (
                <div className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg">
                  Exercício pulado: <strong>{s.skippedExercises[0].exerciseName}</strong> ({s.skippedExercises[0].reason})
                </div>
              )}

              {s.substitutedExercises.length > 0 && (
                <div className="text-xs text-cyan-500 bg-cyan-500/10 p-2 rounded-lg">
                  Substituição: de {s.substitutedExercises[0].originalExerciseName} para <strong>{s.substitutedExercises[0].substitutedExerciseName}</strong>
                </div>
              )}

              {s.notes && (
                <p className="text-xs italic text-slate-600 dark:text-dark-muted">
                  &ldquo;{s.notes}&rdquo;
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
