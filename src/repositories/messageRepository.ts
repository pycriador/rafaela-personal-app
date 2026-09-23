import { StudentMessage } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { studentRepository } from './studentRepository';
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

function cleanStudentKey(id: string): string {
  if (!id) return '';
  return id.replace(/^(user-|student-)+/gi, '').toLowerCase().trim();
}

async function getStudentCandidateIds(queryId: string): Promise<Set<string>> {
  const set = new Set<string>();
  if (!queryId) return set;

  set.add(queryId);
  const clean = cleanStudentKey(queryId);
  if (clean) {
    set.add(clean);
    set.add(`student-${clean}`);
    set.add(`user-${clean}`);
  }

  try {
    const student =
      (await studentRepository.getById(queryId)) ||
      (await studentRepository.getByUserId(queryId));
    if (student) {
      if (student.id) {
        set.add(student.id);
        const c1 = cleanStudentKey(student.id);
        if (c1) {
          set.add(c1);
          set.add(`student-${c1}`);
          set.add(`user-${c1}`);
        }
      }
      if (student.userId) {
        set.add(student.userId);
        const c2 = cleanStudentKey(student.userId);
        if (c2) {
          set.add(c2);
          set.add(`student-${c2}`);
          set.add(`user-${c2}`);
        }
      }
    }
  } catch (err) {
    // repository lookup fallback
  }

  return set;
}

function matchesCandidateIds(targetId: string, candidateIds: Set<string>): boolean {
  if (!targetId) return false;
  if (candidateIds.has(targetId)) return true;
  const clean = cleanStudentKey(targetId);
  if (candidateIds.has(clean)) return true;
  if (candidateIds.has(`student-${clean}`)) return true;
  if (candidateIds.has(`user-${clean}`)) return true;
  return false;
}

export interface IMessageRepository {
  getMessagesByStudentId(studentId: string): Promise<StudentMessage[]>;
  sendMessage(message: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage>;
  markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void>;
  deleteMessage(id: string): Promise<boolean>;
}

export class SupabaseMessageRepository implements IMessageRepository {
  async getMessagesByStudentId(studentId: string): Promise<StudentMessage[]> {
    const candidates = await getStudentCandidateIds(studentId);

    if (isSupabaseConfigured) {
      try {
        const candidateArray = Array.from(candidates);
        const orConditions = candidateArray.map((id) => `student_id.eq.${id}`).join(',');
        const { data, error } = await supabase
          .from('student_messages')
          .select('*')
          .or(orConditions)
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
      .filter((m) => matchesCandidateIds(m.studentId, candidates))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async sendMessage(msgData: Omit<StudentMessage, 'id' | 'timestamp' | 'read'>): Promise<StudentMessage> {
    // Canonicalize studentId to student.id if possible
    let canonicalStudentId = msgData.studentId;
    try {
      const student =
        (await studentRepository.getById(msgData.studentId)) ||
        (await studentRepository.getByUserId(msgData.studentId));
      if (student && student.id) {
        canonicalStudentId = student.id;
      }
    } catch {
      // fallback
    }

    const newMessage: StudentMessage = {
      ...msgData,
      studentId: canonicalStudentId,
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

    // Notify any local listeners immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rafaela_chat_message', {
          detail: { studentId: canonicalStudentId, message: newMessage },
        })
      );
    }

    return newMessage;
  }

  async markAsRead(studentId: string, readerRole: 'personal' | 'student'): Promise<void> {
    const candidates = await getStudentCandidateIds(studentId);
    const all = cleanRealMessages(getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []));
    let modified = false;

    all.forEach((m) => {
      if (matchesCandidateIds(m.studentId, candidates) && m.senderRole !== readerRole && !m.read) {
        m.read = true;
        modified = true;
      }
    });

    if (modified) {
      setItem(STORAGE_KEYS.STUDENT_MESSAGES, all);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('rafaela_chat_read', {
            detail: { studentId },
          })
        );
      }
    }
  }

  async deleteMessage(id: string): Promise<boolean> {
    const all = cleanRealMessages(getItem<StudentMessage[]>(STORAGE_KEYS.STUDENT_MESSAGES, []));
    const filtered = all.filter((m) => m.id !== id);
    setItem(STORAGE_KEYS.STUDENT_MESSAGES, filtered);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('rafaela_chat_message', { detail: { deletedId: id } }));
    }
    return true;
  }
}

export const messageRepository = new SupabaseMessageRepository();
