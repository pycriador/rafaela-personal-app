import { StudentMessage, MessageCategory } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const initialStudentMessages: StudentMessage[] = [];

const LEGACY_MOCK_IDS = new Set([
  'msg-1',
  'msg-2',
  'msg-3',
  'msg-4',
  'msg-joao-1',
  'msg-joao-2',
  'msg-joao-3',
]);

function cleanRealMessages(messages: StudentMessage[]): StudentMessage[] {
  return (messages || []).filter(
    (m) => !LEGACY_MOCK_IDS.has(m.id) && !m.id.startsWith('msg-joao-')
  );
}

function normalizeStudentKey(id: string): string {
  return id.replace(/^(student-|user-)/, '');
}

function matchesStudentId(target: string, query: string): boolean {
  if (target === query) return true;
  return normalizeStudentKey(target) === normalizeStudentKey(query);
}

export interface IMessageRepository {
  getMessagesByStudentId(studentId: string): Promise<StudentMessage[]>;
  sendMessage(message: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage>;
  markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void>;
  deleteMessage(id: string): Promise<boolean>;
}

export class SupabaseMessageRepository implements IMessageRepository {
  async getMessagesByStudentId(studentId: string): Promise<StudentMessage[]> {
    const altId = studentId.startsWith('user-')
      ? studentId.replace('user-', 'student-')
      : studentId.startsWith('student-')
      ? studentId.replace('student-', 'user-')
      : studentId;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('student_messages')
          .select('*')
          .or(`student_id.eq.${studentId},student_id.eq.${altId}`)
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

    const raw = getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []);
    const all = cleanRealMessages(raw);
    if (all.length !== raw.length) {
      setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);
    }
    return all
      .filter((m) => matchesStudentId(m.studentId, studentId))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(msgData: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage> {
    const newMessage: StudentMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
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

    const all = cleanRealMessages(getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []));
    all.push(newMessage);
    setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);

    return newMessage;
  }

  async markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void> {
    const all = cleanRealMessages(getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []));
    let modified = false;

    all.forEach((m) => {
      if (matchesStudentId(m.studentId, studentId) && m.senderRole !== readerRole && !m.read) {
        m.read = true;
        modified = true;
      }
    });

    if (modified) {
      setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    const all = cleanRealMessages(getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []));
    const filtered = all.filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.STUDENT_MESSAGES, filtered);
    return true;
  }
}

export const messageRepository = new SupabaseMessageRepository();
