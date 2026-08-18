'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CargoType, Escola } from '@/types/database';
import { UserPlus, Shield, UserCheck, Trash2, CheckCircle2, Mail, Building2, MapPin, Plus, ListFilter, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthorizedUser {
  id: string;
  nome: string;
  email: string;
  cargo: CargoType;
  regiao: string;
  status: 'ativo' | 'convidado';
}

export default function UsuariosPage() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'whitelist' | 'escolas'>('whitelist');

  // Whitelist Form State
  const [nomeInput, setNomeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [cargoInput, setCargoInput] = useState<CargoType>('agente');
  const [regiaoInput, setRegiaoInput] = useState('Polo Norte');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Escolas Form State (João Pessoa)
  const [escolaNome, setEscolaNome] = useState('');
  const [escolaPolo, setEscolaPolo] = useState('Polo Norte');
  const [escolaCoords, setEscolaCoords] = useState('-7.1153,-34.8610');
  const [escolaFeedback, setEscolaFeedback] = useState<string | null>(null);

  const [usuariosList, setUsuariosList] = useState<AuthorizedUser[]>([
    {
      id: 'usr-1',
      nome: 'Administrador Geral (Coordenação)',
      email: 'bolaojpa@gmail.com',
      cargo: 'coordenacao_geral',
      regiao: 'Todas as Jurisdições',
      status: 'ativo',
    },
  ]);

  const [escolasList, setEscolasList] = useState<Escola[]>([
    { id: 'e1', nome: 'EMEF Anísio Teixeira', regiao: 'Polo Norte', lat_lng_oficial: '-7.1153,-34.8610', created_at: '', updated_at: '' },
    { id: 'e2', nome: 'EMEF Paulo Freire', regiao: 'Polo Norte', lat_lng_oficial: '-7.1280,-34.8500', created_at: '', updated_at: '' },
    { id: 'e3', nome: 'EMEF Florestan Fernandes', regiao: 'Polo Sul', lat_lng_oficial: '-7.1700,-34.8800', created_at: '', updated_at: '' },
    { id: 'e4', nome: 'EMEF Darcy Ribeiro', regiao: 'Polo Sul', lat_lng_oficial: '-7.1800,-34.8900', created_at: '', updated_at: '' },
    { id: 'e5', nome: 'EMEF Celso Furtado', regiao: 'Polo Leste', lat_lng_oficial: '-7.1400,-34.8300', created_at: '', updated_at: '' },
    { id: 'e6', nome: 'EMEF João XXIII', regiao: 'Polo Leste', lat_lng_oficial: '-7.1350,-34.8400', created_at: '', updated_at: '' },
    { id: 'e7', nome: 'EMEF Severino Patrício', regiao: 'Polo Oeste', lat_lng_oficial: '-7.1500,-34.9100', created_at: '', updated_at: '' },
  ]);

  const fetchWhitelist = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: dbWhitelist } = await supabase.from('whitelist_emails').select('*');

      if (dbWhitelist && dbWhitelist.length > 0) {
        const list: AuthorizedUser[] = dbWhitelist.map((item) => ({
          id: item.id || item.email,
          nome: item.nome || item.email,
          email: item.email,
          cargo: item.cargo || 'agente',
          regiao: item.regiao_atuacao || 'Polo Norte',
          status: 'ativo',
        }));

        if (!list.some((u) => u.email.toLowerCase() === 'bolaojpa@gmail.com')) {
          list.unshift({
            id: 'usr-1',
            nome: 'Administrador Geral (Coordenação)',
            email: 'bolaojpa@gmail.com',
            cargo: 'coordenacao_geral',
            regiao: 'Todas as Jurisdições',
            status: 'ativo',
          });
        }
        setUsuariosList(list);
      }
    } catch (err) {
      console.warn('Erro ao carregar lista de whitelist:', err);
    }
  };

  const fetchEscolas = async () => {
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: dbEscolas } = await supabase.from('escolas').select('*').order('nome', { ascending: true });

      if (dbEscolas && dbEscolas.length > 0) {
        setEscolasList(dbEscolas);
      }
    } catch (err) {
      console.warn('Erro ao carregar escolas:', err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchWhitelist();
      fetchEscolas();
    }
  }, [loading]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nomeInput.trim()) return;

    const emailClean = emailInput.trim().toLowerCase();
    const nomeClean = nomeInput.trim();

    const newUser: AuthorizedUser = {
      id: `usr-${Date.now()}`,
      nome: nomeClean,
      email: emailClean,
      cargo: cargoInput,
      regiao: regiaoInput,
      status: 'ativo',
    };

    setUsuariosList((prev) => [newUser, ...prev.filter((u) => u.email !== emailClean)]);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.from('whitelist_emails').upsert(
        {
          email: emailClean,
          nome: nomeClean,
          cargo: cargoInput,
          regiao_atuacao: regiaoInput,
        },
        { onConflict: 'email' }
      );

      if (error) {
        setFeedback(`⚠️ Atenção: ${error.message}.`);
      } else {
        setFeedback(`✅ E-mail ${emailClean} cadastrado na Whitelist com sucesso!`);
      }
    } catch (err: any) {
      setFeedback(`⚠️ Erro ao salvar no banco: ${err.message || 'Falha de gravação.'}`);
    }

    setNomeInput('');
    setEmailInput('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleRemoveUser = async (id: string, email: string) => {
    setUsuariosList((prev) => prev.filter((u) => u.id !== id));
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('whitelist_emails').delete().eq('email', email.toLowerCase());
    } catch (err) {
      console.warn('Exclusão Whitelist Supabase:', err);
    }
  };

  const handleAddEscola = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escolaNome.trim()) return;

    const nomeClean = escolaNome.trim();

    const newEscola: Escola = {
      id: `esc-${Date.now()}`,
      nome: nomeClean,
      regiao: escolaPolo,
      lat_lng_oficial: escolaCoords.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEscolasList((prev) => [newEscola, ...prev]);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.from('escolas').insert({
        nome: nomeClean,
        regiao: escolaPolo,
        lat_lng_oficial: escolaCoords.trim(),
      });

      if (error) {
        setEscolaFeedback(`⚠️ Erro no Supabase: ${error.message}`);
      } else {
        setEscolaFeedback(`✅ Escola Municipal "${nomeClean}" cadastrada no sistema com sucesso!`);
        fetchEscolas();
      }
    } catch (err: any) {
      setEscolaFeedback(`⚠️ Falha de gravação: ${err.message || 'Erro de conexão'}`);
    }

    setEscolaNome('');
    setTimeout(() => setEscolaFeedback(null), 5000);
  };

  const handleRemoveEscola = async (id: string) => {
    setEscolasList((prev) => prev.filter((e) => e.id !== id));
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('escolas').delete().eq('id', id);
    } catch (err) {
      console.warn('Exclusão Escola Supabase:', err);
    }
  };

  const cargoBadges: Record<CargoType, string> = {
    agente: 'Agente Educacional (Campo)',
    gerente_polo: 'Gerente de Polo',
    coordenacao_area: 'Coordenação de Área',
    coordenador_dados: 'Coordenação de Dados',
    coordenacao_geral: 'Coordenação Geral (Admin)',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner CRM de Gestão de Acessos e Escolas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-extrabold text-slate-900">
                Gestão de Usuários & Escolas Municipais (João Pessoa)
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Painel estratégico da Coordenação Geral: Controle de Whitelist e Delegação de Unidades Escolares.
            </p>
          </div>

          {/* Abas Alternáveis de Gestão */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'whitelist'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Whitelist ({usuariosList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('escolas')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'escolas'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Escolas Municipais ({escolasList.length})</span>
            </button>
          </div>
        </div>

        {/* MÓDULO 1: WHITELIST DE USUÁRIOS */}
        {activeTab === 'whitelist' && (
          <div className="space-y-6">
            {feedback && (
              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{feedback}</span>
                </div>
              </div>
            )}

            {/* Form para Cadastrar Novo Servidor na Whitelist */}
            <div className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-extrabold text-slate-900">Pré-Autorizar Novo E-mail no Sistema</h2>
              </div>

              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Completo do Servidor:
                  </label>
                  <input
                    type="text"
                    required
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    placeholder="Ex: Ana Souza"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail Google Autorizado:
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="servidor@gmail.com"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cargo / Nível de Acesso:
                  </label>
                  <select
                    value={cargoInput}
                    onChange={(e) => setCargoInput(e.target.value as CargoType)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  >
                    <option value="agente">Agente Educacional (Campo)</option>
                    <option value="gerente_polo">Gerente de Polo</option>
                    <option value="coordenacao_area">Coordenação de Área</option>
                    <option value="coordenador_dados">Coordenação de Dados</option>
                    <option value="coordenacao_geral">Coordenação Geral (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Polo / Região de Atuação:
                  </label>
                  <select
                    value={regiaoInput}
                    onChange={(e) => setRegiaoInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Polo Norte">Polo Norte</option>
                    <option value="Polo Sul">Polo Sul</option>
                    <option value="Polo Leste">Polo Leste</option>
                    <option value="Polo Oeste">Polo Oeste</option>
                    <option value="Todas as Jurisdições">Todas as Jurisdições</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 mt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary py-3.5 px-6 text-xs flex items-center justify-center gap-2 font-extrabold shadow-md"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Autorizar E-mail na Whitelist</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela CRM de Usuários Autorizados */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Lista de E-mails Autorizados no Sistema ({usuariosList.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                      <th className="p-3">Servidor</th>
                      <th className="p-3">E-mail Autorizado</th>
                      <th className="p-3">Nível de Acesso (Cargo)</th>
                      <th className="p-3">Polo / Região</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {usuariosList.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-extrabold text-slate-900">{user.nome}</td>
                        <td className="p-3 text-slate-700 font-mono flex items-center gap-1.5 font-semibold">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user.email}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-red-50 text-red-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-red-200">
                            {cargoBadges[user.cargo]}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-semibold">{user.regiao}</td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300">
                            🟢 Autorizado
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {user.email !== 'bolaojpa@gmail.com' && (
                            <button
                              onClick={() => handleRemoveUser(user.id, user.email)}
                              className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
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
          </div>
        )}

        {/* MÓDULO 2: GESTÃO DE ESCOLAS MUNICIPAIS DE JOÃO PESSOA */}
        {activeTab === 'escolas' && (
          <div className="space-y-6">
            {escolaFeedback && (
              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{escolaFeedback}</span>
                </div>
              </div>
            )}

            {/* Cadastro de Escola Municipal */}
            <div className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-extrabold text-slate-900">Cadastrar Nova Escola Municipal de João Pessoa</h2>
              </div>

              <form onSubmit={handleAddEscola} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome Oficial da Escola:
                  </label>
                  <input
                    type="text"
                    required
                    value={escolaNome}
                    onChange={(e) => setEscolaNome(e.target.value)}
                    placeholder="Ex: EMEF João XXIII"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Polo / Regional de João Pessoa:
                  </label>
                  <select
                    value={escolaPolo}
                    onChange={(e) => setEscolaPolo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Polo Norte">Polo Norte</option>
                    <option value="Polo Sul">Polo Sul</option>
                    <option value="Polo Leste">Polo Leste</option>
                    <option value="Polo Oeste">Polo Oeste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Coordenadas GPS (Lat, Lng):
                  </label>
                  <input
                    type="text"
                    required
                    value={escolaCoords}
                    onChange={(e) => setEscolaCoords(e.target.value)}
                    placeholder="-7.1153,-34.8610"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="sm:col-span-3 mt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary py-3.5 px-6 text-xs flex items-center justify-center gap-2 font-extrabold shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Escola Municipal ao Sistema</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Escolas Cadastradas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Rede de Escolas Municipais de João Pessoa Cadastradas ({escolasList.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                      <th className="p-3">Unidade Escolar</th>
                      <th className="p-3">Polo/Região</th>
                      <th className="p-3">Coordenadas GPS</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {escolasList.map((escola) => (
                      <tr key={escola.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-extrabold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-red-600" />
                          <span>{escola.nome}</span>
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                            {escola.regiao}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{escola.lat_lng_oficial || 'N/A'}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            🟢 Ativa para Agentes
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveEscola(escola.id)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Remover Escola da Rede"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
