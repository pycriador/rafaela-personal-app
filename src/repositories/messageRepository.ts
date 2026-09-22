import { StudentMessage } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const initialStudentMessages: StudentMessage[] = [
  {
    id: 'msg-1',
    studentId: 'student-mariana',
    senderId: 'student-mariana',
    senderName: 'Mariana Silva',
    senderRole: 'student',
    content: 'Oi Rafaela! Consegui subir a carga no Supino Máquina hoje para 32kg (+2kg). Senti um estímulo muito bom e sem dor no ombro!',
    category: 'weight_change',
    metadata: {
      exerciseName: 'Supino Máquina',
      weightBefore: 30,
      weightAfter: 32,
    },
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    read: true,
  },
  {
    id: 'msg-2',
    studentId: 'student-mariana',
    senderId: 'user-rafaela',
    senderName: 'Rafaela Personal',
    senderRole: 'personal',
    content: 'Sensacional Mariana! Vi aqui no painel a sua alteração. A cadência e a postura continuaram corretas? Na próxima semana podemos manter 32kg e focar em 10 reps cravadas em todas as 4 séries!',
    category: 'assessment',
    timestamp: new Date(Date.now() - 3600 * 1000 * 22).toISOString(),
    read: true,
  },
  {
    id: 'msg-3',
    studentId: 'student-mariana',
    senderId: 'student-mariana',
    senderName: 'Mariana Silva',
    senderRole: 'student',
    content: 'Sim! Desci controlando em 2 segundos e descansei 60s certinho. Também precisei trocar o Tríceps Testa pelo Tríceps Francês porque o banco estava ocupado, mas executei com 8kg com boa pegada.',
    category: 'exercise_change',
    metadata: {
      exerciseName: 'Tríceps Francês com Halter',
    },
    timestamp: new Date(Date.now() - 3600 * 1000 * 18).toISOString(),
    read: true,
  },
  {
    id: 'msg-4',
    studentId: 'student-mariana',
    senderId: 'user-rafaela',
    senderName: 'Rafaela Personal',
    senderRole: 'personal',
    content: 'Perfeita a substituição! O Tríceps Francês é exatamente a alternativa recomendada na sua ficha. Continue firme com essa constância!',
    category: 'motivation',
    timestamp: new Date(Date.now() - 3600 * 1000 * 15).toISOString(),
    read: true,
  },
];

export interface IMessageRepository {
  getMessagesByStudentId(studentId: string): Promise<StudentMessage[]>;
  sendMessage(message: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage>;
  markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void>;
  deleteMessage(id: string): Promise<boolean>;
}

export class SupabaseMessageRepository implements IMessageRepository {
  async getMessagesByStudentId(studentId: string): Promise<StudentMessage[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_messages')
          .select('*')
          .eq('student_id', studentId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: StudentMessage[] = data.map((d: any) => ({
            id: d.id,
            studentId: d.student_id,
            senderId: d.sender_id,
            senderName: d.sender_name,
            senderRole: d.sender_role,
            content: d.content,
            category: d.category,
            metadata: d.metadata,
            timestamp: d.created_at || d.timestamp,
            read: d.read ?? true,
          }));
          return mapped;
        }
      } catch (err) {
        // fallback
      }
    }

    const all = getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, initialStudentMessages);
    return all
      .filter((m) => m.studentId === studentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(msgData: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage> {
    const newMessage: StudentMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase.from('student_messages').insert({
          id: newMessage.id,
          student_id: newMessage.studentId,
          sender_id: newMessage.senderId,
          sender_name: newMessage.senderName,
          sender_role: newMessage.senderRole,
          content: newMessage.content,
          category: newMessage.category,
          metadata: newMessage.metadata,
          read: newMessage.read,
          created_at: newMessage.timestamp,
        });
      } catch (err) {
        console.error('Supabase send message error:', err);
      }
    }

    const all = getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, initialStudentMessages);
    all.push(newMessage);
    setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);

    return newMessage;
  }

  async markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void> {
    const all = getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, initialStudentMessages);
    let modified = false;

    all.forEach((m) => {
      if (m.studentId === studentId && m.senderRole !== readerRole && !m.read) {
        m.read = true;
        modified = true;
      }
    });

    if (modified) {
      setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    const all = getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, initialStudentMessages);
    const filtered = all.filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.STUDENT_MESSAGES, filtered);
    return true;
  }
}

export const messageRepository = new SupabaseMessageRepository();
