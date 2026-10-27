import fs from 'fs';
import path from 'path';
import { Profile, Contribution, Expense, AuditLog } from '@/types/database';
import { INITIAL_MEMBERS } from './supabase/seedData';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

export interface LocalDataStore {
  profiles: Profile[];
  contributions: Contribution[];
  expenses: Expense[];
  auditLogs: AuditLog[];
}

function getDefaultData(): LocalDataStore {
  return {
    profiles: INITIAL_MEMBERS.map((m, idx) => ({
      ...m,
      id: `member-${idx + 1}`,
      auth_user_id: idx === 0 ? 'admin-auth-id' : `user-auth-${idx + 1}`,
      created_at: new Date(Date.now() - (25 - idx) * 86400000).toISOString(),
    })),
    contributions: [],
    expenses: [],
    auditLogs: [],
  };
}

export function readLocalStore(): LocalDataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getDefaultData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local data store:', e);
    return getDefaultData();
  }
}

export function writeLocalStore(data: LocalDataStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing local data store:', e);
  }
}
