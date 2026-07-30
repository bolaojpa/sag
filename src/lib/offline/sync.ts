import {
  getPendingRegistros,
  getPendingIntercorrencias,
  removePendingRegistro,
  removePendingIntercorrencia,
} from './db';
import { createClient } from '@/lib/supabase/client';

export const syncOfflineQueue = async (): Promise<{ syncedCount: number; errors: number }> => {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const supabase = createClient();
  let syncedCount = 0;
  let errors = 0;

  // 1. Sincronizar Registros Diários pendentes
  try {
    const registros = await getPendingRegistros();
    for (const item of registros) {
      const { temp_id, timestamp, ...data } = item;
      const { error } = await supabase.from('registros_diarios').insert([data]);
      if (!error) {
        await removePendingRegistro(temp_id);
        syncedCount++;
      } else {
        console.error('Erro ao sincronizar registro diário:', error);
        errors++;
      }
    }
  } catch (err) {
    console.error('Falha no processo de sincronização de registros:', err);
  }

  // 2. Sincronizar Intercorrências pendentes
  try {
    const intercorrencias = await getPendingIntercorrencias();
    for (const item of intercorrencias) {
      const { temp_id, timestamp, ...data } = item;
      const { error } = await supabase.from('intercorrencias').insert([data]);
      if (!error) {
        await removePendingIntercorrencia(temp_id);
        syncedCount++;
      } else {
        console.error('Erro ao sincronizar intercorrência:', error);
        errors++;
      }
    }
  } catch (err) {
    console.error('Falha no processo de sincronização de intercorrências:', err);
  }

  return { syncedCount, errors };
};

export const initOfflineSyncListener = (onSyncComplete?: (count: number) => void) => {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    console.log('[SAG Offline Sync] Conexão detectada. Iniciando sincronização silenciosa...');
    const result = await syncOfflineQueue();
    if (result.syncedCount > 0 && onSyncComplete) {
      onSyncComplete(result.syncedCount);
    }
  };

  window.addEventListener('online', handleOnline);

  // Executa checagem inicial se já estiver online
  if (navigator.onLine) {
    syncOfflineQueue().then((res) => {
      if (res.syncedCount > 0 && onSyncComplete) {
        onSyncComplete(res.syncedCount);
      }
    });
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
};
