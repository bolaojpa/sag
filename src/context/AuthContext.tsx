'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { CargoType, Profile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  cargo: CargoType;
  regiao: string;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  cargo: 'agente',
  regiao: 'Polo Norte',
  loading: true,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cargo, setCargo] = useState<CargoType>('agente');
  const [regiao, setRegiao] = useState<string>('Polo Norte');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfileAndAuth = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (currentUser) {
        const userEmail = currentUser.email?.toLowerCase() || '';

        // E-mail Admin Master Supremo
        if (userEmail === 'bolaojpa@gmail.com') {
          setUser(currentUser);
          setCargo('coordenacao_geral');
          setRegiao('Polo Norte');
          setProfile({
            id: currentUser.id,
            email: currentUser.email || 'bolaojpa@gmail.com',
            nome: 'Administrador Geral (Coordenação)',
            cargo: 'coordenacao_geral',
            regiao_atuacao: 'Polo Norte',
            grupo_id: 'Grupo 01',
            last_seen: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setLoading(false);
          return;
        }

        // Busca o perfil na tabela profiles
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (userProfile) {
          setUser(currentUser);
          setProfile(userProfile);
          setCargo((userProfile.cargo as CargoType) || 'agente');
          setRegiao(userProfile.regiao_atuacao || 'Polo Norte');
        } else {
          // Busca autorização prévia na whitelist_emails
          const { data: whitelist } = await supabase
            .from('whitelist_emails')
            .select('*')
            .ilike('email', userEmail)
            .single();

          if (whitelist) {
            setUser(currentUser);
            const newProfileData = {
              id: currentUser.id,
              email: currentUser.email || userEmail,
              nome: whitelist.nome || currentUser.email || 'Servidor',
              cargo: (whitelist.cargo as CargoType) || 'agente',
              regiao_atuacao: whitelist.regiao_atuacao || 'Polo Norte',
              grupo_id: whitelist.grupo_id || 'Grupo 01',
            };

            await supabase.from('profiles').upsert(newProfileData);

            setCargo((whitelist.cargo as CargoType) || 'agente');
            setRegiao(whitelist.regiao_atuacao || 'Polo Norte');
            setProfile({
              ...newProfileData,
              last_seen: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            // E-MAIL NÃO AUTORIZADO! REJEIÇÃO E DESLOGUE IMEDIATO!
            console.warn(`[SAG Auth] E-mail não autorizado tentou acessar: ${userEmail}`);
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setCargo('agente');
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login?error=unauthorized';
            }
          }
        }
      } else {
        // Checa se há uma sessão de teste local gravada
        if (typeof window !== 'undefined') {
          const simUserRaw = localStorage.getItem('sag_simulated_user');
          if (simUserRaw) {
            const simUser = JSON.parse(simUserRaw);
            const isSimAdmin = simUser.email === 'bolaojpa@gmail.com' || simUser.role === 'admin';

            setUser({ id: 'sim-user-1', email: simUser.email } as any);
            setCargo(isSimAdmin ? 'coordenacao_geral' : 'agente');
            setRegiao('Polo Norte');
            setProfile({
              id: 'sim-user-1',
              email: simUser.email,
              nome: isSimAdmin ? 'Administrador Geral (Coordenação)' : 'Agente Educacional de Campo',
              cargo: isSimAdmin ? 'coordenacao_geral' : 'agente',
              regiao_atuacao: 'Polo Norte',
              grupo_id: 'Grupo 01',
              last_seen: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setLoading(false);
            return;
          }
        }

        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn('Erro ao inicializar AuthContext:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndAuth();

    let subscription: { unsubscribe: () => void } | null = null;
    const setupListener = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchProfileAndAuth();
        } else if (event === 'SIGNED_OUT') {
          if (typeof window !== 'undefined') localStorage.removeItem('sag_simulated_user');
          setUser(null);
          setProfile(null);
          setCargo('agente');
          setLoading(false);
        }
      });
      subscription = data.subscription;
    };

    setupListener();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    await fetchProfileAndAuth();
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') localStorage.removeItem('sag_simulated_user');
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignora falha de rede ao deslogar offline
    }
    setUser(null);
    setProfile(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        cargo,
        regiao,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
