'use client';

import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CargoType } from '@/types/database';
import { UserPlus, Shield, UserCheck, Trash2, CheckCircle2, AlertCircle, Mail, Building } from 'lucide-react';

interface AuthorizedUser {
  id: string;
  nome: string;
  email: string;
  cargo: CargoType;
  regiao: string;
  status: 'ativo' | 'convidado';
}

export default function UsuariosPage() {
  const [cargo, setCargo] = useState<CargoType>('coordenacao_geral');
  const [regiao, setRegiao] = useState<string>('Polo Norte');

  // Form State
  const [nomeInput, setNomeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [cargoInput, setCargoInput] = useState<CargoType>('agente');
  const [regiaoInput, setRegiaoInput] = useState('Polo Norte');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, cargo')
        .eq('id', user.id)
        .single();

      if (!profile && user.email?.toLowerCase() !== 'bolaojpa@gmail.com') {
        await supabase.auth.signOut();
        window.location.href = '/login?error=unauthorized';
        return;
      }

      setIsAuthenticated(true);
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const [usuariosDemo, setUsuariosDemo] = useState<AuthorizedUser[]>([
    {
      id: 'usr-1',
      nome: 'Administrador Geral',
      email: 'bolaojpa@gmail.com',
      cargo: 'coordenacao_geral',
      regiao: 'Todas as Jurisdições',
      status: 'ativo',
    },
    {
      id: 'usr-2',
      nome: 'Maria Silva',
      email: 'maria.agente@escola.gov.br',
      cargo: 'agente',
      regiao: 'Polo Norte',
      status: 'ativo',
    },
    {
      id: 'usr-3',
      nome: 'Carlos Oliveira',
      email: 'carlos.gerente@escola.gov.br',
      cargo: 'gerente_polo',
      regiao: 'Polo Norte',
      status: 'convidado',
    },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nomeInput.trim()) return;

    const newUser: AuthorizedUser = {
      id: `usr-${Date.now()}`,
      nome: nomeInput.trim(),
      email: emailInput.trim().toLowerCase(),
      cargo: cargoInput,
      regiao: regiaoInput,
      status: 'convidado',
    };

    setUsuariosDemo((prev) => [newUser, ...prev]);
    setFeedback(`E-mail ${newUser.email} cadastrado na Whitelist com sucesso! Acesso liberado.`);
    setNomeInput('');
    setEmailInput('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleRemoveUser = (id: string) => {
    setUsuariosDemo((prev) => prev.filter((u) => u.id !== id));
  };

  const cargoBadges: Record<CargoType, string> = {
    agente: 'Agente Educacional (Campo)',
    gerente_polo: 'Gerente de Polo',
    coordenacao_area: 'Coordenação de Área',
    coordenador_dados: 'Coordenação de Dados',
    coordenacao_geral: 'Coordenação Geral (Admin)',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header
        currentCargo={cargo}
        onCargoChange={setCargo}
        currentRegiao={regiao}
        onRegiaoChange={setRegiao}
      />
      <Nav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner de Gestão de Acessos */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-brand-600" />
              <h1 className="text-xl font-extrabold text-gray-900">
                Gestão de Usuários & Whitelist de Acesso
              </h1>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Controle de acesso restrito: Apenas e-mails autorizados nesta lista conseguem realizar login via Google.
            </p>
          </div>

          <div className="bg-brand-50 text-brand-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-200">
            Painel Exclusivo da Coordenação
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-semibold animate-pulse">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{feedback}</span>
            </div>
          </div>
        )}

        {/* Form para Cadastrar Novo Servidor na Whitelist */}
        <div className="card-institutional p-6 bg-white border-l-4 border-l-brand-600">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-gray-900">Pré-Autorizar Novo E-mail no Sistema</h2>
          </div>

          <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Nome Completo do Servidor:
              </label>
              <input
                type="text"
                required
                value={nomeInput}
                onChange={(e) => setNomeInput(e.target.value)}
                placeholder="Ex: Ana Souza"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                E-mail Google Autorizado:
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="servidor@gmail.com"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cargo Institucional:
              </label>
              <select
                value={cargoInput}
                onChange={(e) => setCargoInput(e.target.value as CargoType)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="agente">Agente Educacional (Campo)</option>
                <option value="gerente_polo">Gerente de Polo</option>
                <option value="coordenacao_area">Coordenação de Área</option>
                <option value="coordenador_dados">Coordenação de Dados</option>
                <option value="coordenacao_geral">Coordenação Geral (Admin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Polo / Região de Atuação:
              </label>
              <select
                value={regiaoInput}
                onChange={(e) => setRegiaoInput(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="Polo Norte">Polo Norte</option>
                <option value="Polo Sul">Polo Sul</option>
                <option value="Polo Leste">Polo Leste</option>
                <option value="Todas as Jurisdições">Todas as Jurisdições</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 mt-2">
              <button
                type="submit"
                className="w-full sm:w-auto btn-primary py-3 px-6 text-xs flex items-center justify-center gap-2 font-bold shadow-md"
              >
                <UserCheck className="w-4 h-4" />
                <span>Autorizar E-mail na Whitelist</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tabela de Usuários Autorizados */}
        <div className="card-institutional p-5 bg-white">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Lista de E-mails Autorizados no Sistema ({usuariosDemo.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-300">
                  <th className="p-3">Servidor</th>
                  <th className="p-3">E-mail Autorizado</th>
                  <th className="p-3">Cargo Atribuído</th>
                  <th className="p-3">Polo / Região</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {usuariosDemo.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900">{user.nome}</td>
                    <td className="p-3 text-gray-700 font-mono flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{user.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-brand-50 text-brand-800 text-[11px] font-bold px-2 py-0.5 rounded border border-brand-200">
                        {cargoBadges[user.cargo]}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">{user.regiao}</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        🟢 Autorizado
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {user.email !== 'bolaojpa@gmail.com' && (
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors"
                          title="Revogar Autorização de Acesso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
