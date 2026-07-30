import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { RegistroDiario, Intercorrencia } from '@/types/database';

interface SAGOfflineDB extends DBSchema {
  pending_registros: {
    key: string;
    value: Omit<RegistroDiario, 'id' | 'created_at' | 'updated_at'> & {
      temp_id: string;
      timestamp: string;
    };
  };
  pending_intercorrencias: {
    key: string;
    value: Omit<Intercorrencia, 'id' | 'created_at' | 'updated_at'> & {
      temp_id: string;
      timestamp: string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<SAGOfflineDB>> | null = null;

export const getDB = () => {
  if (typeof window === 'undefined') return null;
  if (!dbPromise) {
    dbPromise = openDB<SAGOfflineDB>('sag-offline-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pending_registros')) {
          db.createObjectStore('pending_registros', { keyPath: 'temp_id' });
        }
        if (!db.objectStoreNames.contains('pending_intercorrencias')) {
          db.createObjectStore('pending_intercorrencias', { keyPath: 'temp_id' });
        }
      },
    });
  }
  return dbPromise;
};

export const savePendingRegistro = async (
  registro: Omit<RegistroDiario, 'id' | 'created_at' | 'updated_at'>
) => {
  const db = await getDB();
  if (!db) return;
  const temp_id = `temp_reg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.put('pending_registros', {
    ...registro,
    temp_id,
    timestamp: new Date().toISOString(),
  });
  return temp_id;
};

export const savePendingIntercorrencia = async (
  intercorrencia: Omit<Intercorrencia, 'id' | 'created_at' | 'updated_at'>
) => {
  const db = await getDB();
  if (!db) return;
  const temp_id = `temp_int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await db.put('pending_intercorrencias', {
    ...intercorrencia,
    temp_id,
    timestamp: new Date().toISOString(),
  });
  return temp_id;
};

export const getPendingRegistros = async () => {
  const db = await getDB();
  if (!db) return [];
  return await db.getAll('pending_registros');
};

export const getPendingIntercorrencias = async () => {
  const db = await getDB();
  if (!db) return [];
  return await db.getAll('pending_intercorrencias');
};

export const removePendingRegistro = async (temp_id: string) => {
  const db = await getDB();
  if (!db) return;
  await db.delete('pending_registros', temp_id);
};

export const removePendingIntercorrencia = async (temp_id: string) => {
  const db = await getDB();
  if (!db) return;
  await db.delete('pending_intercorrencias', temp_id);
};
