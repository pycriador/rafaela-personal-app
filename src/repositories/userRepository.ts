import { User } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialUsers } from '../data/users';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  deleteByStudentProfileId(studentProfileId: string): Promise<boolean>;
}

function mapFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url || row.avatarUrl,
    phone: row.phone,
    studentProfileId: row.student_profile_id || row.studentProfileId,
  };
}

function mapToDb(u: Partial<User>): any {
  const row: any = { ...u };
  if (u.avatarUrl !== undefined) {
    row.avatar_url = u.avatarUrl;
    delete row.avatarUrl;
  }
  if (u.studentProfileId !== undefined) {
    row.student_profile_id = u.studentProfileId;
    delete row.studentProfileId;
  }
  return row;
}

export class SupabaseUserRepository implements IUserRepository {
  async getAll(): Promise<User[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          const users = data.map(mapFromDb);
          setItem(STORAGE_KEYS.USERS, users);
          return users;
        }
      } catch (err) {
        // fallback
      }
    }
    return getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  async getById(id: string): Promise<User | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const users = await this.getAll();
    return users.find((u) => u.id === id) || null;
  }

  async getByEmail(email: string): Promise<User | null> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .ilike('email', email.trim())
          .maybeSingle();
        if (!error && data) {
          return mapFromDb(data);
        }
      } catch (err) {
        // fallback
      }
    }
    const users = await this.getAll();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async create(user: User): Promise<User> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('users').insert(mapToDb(user));
      } catch (err) {
        console.error('Supabase create user error:', err);
      }
    }

    const users = await this.getAll();
    users.push(user);
    setItem(STORAGE_KEYS.USERS, users);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    let updatedUser: User | null = null;

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(mapToDb(updates))
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!error && data) {
          updatedUser = mapFromDb(data);
        }
      } catch (err) {
        console.error('Supabase update user error:', err);
      }
    }

    const users = await this.getAll();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    setItem(STORAGE_KEYS.USERS, users);
    return updatedUser || users[index];
  }

  async delete(id: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('users').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase delete user error:', err);
      }
    }

    const users = await this.getAll();
    const filtered = users.filter((u) => u.id !== id);
    setItem(STORAGE_KEYS.USERS, filtered);
    return true;
  }

  async deleteByStudentProfileId(studentProfileId: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('users').delete().eq('student_profile_id', studentProfileId);
      } catch (err) {
        console.error('Supabase delete user by studentProfileId error:', err);
      }
    }

    const users = await this.getAll();
    const filtered = users.filter((u) => u.studentProfileId !== studentProfileId);
    setItem(STORAGE_KEYS.USERS, filtered);
    return true;
  }
}

export const userRepository = new SupabaseUserRepository();

