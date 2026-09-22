import { Student } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialStudents } from '../data/students';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface StudentFilters {
  search?: string;
  goal?: string;
  status?: string;
  frequency?: string;
}

export interface IStudentRepository {
  getAll(filters?: StudentFilters): Promise<Student[]>;
  getById(id: string): Promise<Student | null>;
  getByUserId(userId: string): Promise<Student | null>;
  create(student: Omit<Student, 'id' | 'createdAt' | 'lastActive' | 'status' | 'adherencePercentage'>): Promise<Student>;
  update(id: string, updates: Partial<Student>): Promise<Student | null>;
  updateStatus(id: string, status: Student['status']): Promise<Student | null>;
  delete(id: string): Promise<boolean>;
}

// Mapper between Supabase snake_case and app camelCase
function mapFromDb(row: any): Student {
  return {
    id: row.id,
    userId: row.user_id || row.userId,
    name: row.name,
    birthDate: row.birth_date || row.birthDate,
    gender: row.gender,
    phone: row.phone,
    email: row.email,
    goals: Array.isArray(row.goals) ? row.goals : JSON.parse(row.goals || '[]'),
    availableDays: Array.isArray(row.available_days)
      ? row.available_days
      : Array.isArray(row.availableDays)
      ? row.availableDays
      : JSON.parse(row.available_days || '[]'),
    level: row.level,
    experience: row.experience,
    notes: row.notes,
    restrictions: row.restrictions,
    preferences: row.preferences,
    avatarUrl: row.avatar_url || row.avatarUrl,
    status: row.status,
    adherencePercentage: Number(row.adherence_percentage ?? row.adherencePercentage ?? 90),
    createdAt: row.created_at || row.createdAt,
    lastActive: row.last_active || row.lastActive,
  };
}

function mapToDb(student: Partial<Student>): any {
  const row: any = { ...student };
  if (student.userId !== undefined) {
    row.user_id = student.userId;
    delete row.userId;
  }
  if (student.birthDate !== undefined) {
    row.birth_date = student.birthDate;
    delete row.birthDate;
  }
  if (student.availableDays !== undefined) {
    row.available_days = student.availableDays;
    delete row.availableDays;
  }
  if (student.avatarUrl !== undefined) {
    row.avatar_url = student.avatarUrl;
    delete row.avatarUrl;
  }
  if (student.adherencePercentage !== undefined) {
    row.adherence_percentage = student.adherencePercentage;
    delete row.adherencePercentage;
  }
  if (student.lastActive !== undefined) {
    row.last_active = student.lastActive;
    delete row.lastActive;
  }
  if (student.createdAt !== undefined) {
    row.created_at = student.createdAt;
    delete row.createdAt;
  }
  return row;
}

export class SupabaseStudentRepository implements IStudentRepository {
  async getAll(filters?: StudentFilters): Promise<Student[]> {
    let students: Student[] = [];

    if (isSupabaseConfigured) {
      try {
        let query = supabase.from('students').select('*').order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          students = data.map(mapFromDb);
          setItem(STORAGE_KEYS.STUDENTS, students);
        } else {
          students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
        }
      } catch (err) {
        students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
      }
    } else {
      students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    }

    // Apply in-memory filters for search, goal, frequency
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        students = students.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone.includes(q)
        );
      }
      if (filters.goal && filters.goal !== 'all') {
        students = students.filter((s) => s.goals.includes(filters.goal as any));
      }
      if (filters.status && filters.status !== 'all') {
        students = students.filter((s) => s.status === filters.status);
      }
      if (filters.frequency && filters.frequency !== 'all') {
        students = students.filter((s) => s.availableDays.length === Number(filters.frequency));
      }
    }

    return students;
  }

  async getById(id: string): Promise<Student | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((s) => s.id === id) || null;
  }

  async getByUserId(userId: string): Promise<Student | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('students').select('*').eq('user_id', userId).single();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const list = await this.getAll();
    return list.find((s) => s.userId === userId) || null;
  }

  async create(studentData: Omit<Student, 'id' | 'createdAt' | 'lastActive' | 'status' | 'adherencePercentage'>): Promise<Student> {
    const newStudent: Student = {
      ...studentData,
      id: `student-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Recém-criado',
      status: 'Ativo',
      adherencePercentage: 100,
    };

    if (isSupabaseConfigured) {
      try {
        const row = mapToDb(newStudent);
        await supabase.from('students').insert(row);
      } catch (err) {
        console.error('Supabase create student error:', err);
      }
    }

    const localList = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    localList.unshift(newStudent);
    setItem(STORAGE_KEYS.STUDENTS, localList);
    return newStudent;
  }

  async update(id: string, updates: Partial<Student>): Promise<Student | null> {
    let updatedStudent: Student | null = null;

    if (isSupabaseConfigured) {
      try {
        const rowUpdates = mapToDb(updates);
        const { data, error } = await supabase
          .from('students')
          .update(rowUpdates)
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          updatedStudent = mapFromDb(data);
        }
      } catch (err) {
        console.error('Supabase update student error:', err);
      }
    }

    const localList = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    const index = localList.findIndex((s) => s.id === id);
    if (index !== -1) {
      localList[index] = { ...localList[index], ...updates };
      setItem(STORAGE_KEYS.STUDENTS, localList);
      if (!updatedStudent) updatedStudent = localList[index];
    }

    return updatedStudent;
  }

  async updateStatus(id: string, status: Student['status']): Promise<Student | null> {
    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('students').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete student error:', err);
      }
    }

    const localList = getItem<Student[]>(STORAGE_KEYS.STUDENTS, initialStudents);
    const filtered = localList.filter((s) => s.id !== id);
    setItem(STORAGE_KEYS.STUDENTS, filtered);
    return true;
  }
}

export const studentRepository = new SupabaseStudentRepository();

