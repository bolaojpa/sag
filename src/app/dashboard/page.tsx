'use client';

import React, { useState, useEffect } from 'react';
import { AdminDashboardView } from '@/components/dashboard/AdminDashboardView';
import { useAuth } from '@/context/AuthContext';
import { Escola } from '@/types/database';

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const [escolas, setEscolas] = useState<Escola[]>([]);

  const fetchEscolas = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = await supabase.from('escolas').select('*').order('nome', { ascending: true });
      if (data) {
        setEscolas(data);
        if (typeof window !== 'undefined') {
          localStorage.setItem('sag_escolas_v7', JSON.stringify(data));
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('sag_escolas_v7');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed)) setEscolas(parsed);
        } catch (e) {}
      }
    }

    fetchEscolas();

    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-xs font-bold mt-3">Carregando Dashboard Admin SAG...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return <AdminDashboardView escolas={escolas} />;
}
