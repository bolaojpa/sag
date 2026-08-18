'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/layout/Header';
import { Nav } from '@/components/layout/Nav';
import { CargoType, Escola } from '@/types/database';
import { UserPlus, Shield, UserCheck, Trash2, CheckCircle2, Mail, Building2, MapPin, Plus, Users, Compass } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AdminSchoolMapPicker = dynamic(
  () => import('@/components/map/AdminSchoolMapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-100 rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-500 font-extrabold text-xs">
        Carregando seletor OpenStreetMap Leaflet...
      </div>
    ),
  }
);

interface AuthorizedUser {
  id: string;
  nome: string;
  email: string;
  cargo: CargoType;
  regiao: string;
  grupo_id?: string;
  status: 'ativo' | 'convidado';
}

export default function UsuariosPage() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'whitelist' | 'escolas'>('whitelist');

  // Whitelist Form State
  const [nomeInput, setNomeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [cargoInput, setCargoInput] = useState<CargoType>('agente');
  const [regiaoInput, setRegiaoInput] = useState('Polo Norte');
  const [grupoInput, setGrupoInput] = useState('Grupo 01');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Escolas Form State (João Pessoa)
  const [escolaNome, setEscolaNome] = useState('');
  const [escolaPolo, setEscolaPolo] = useState('Polo Norte');
  const [escolaGrupo, setEscolaGrupo] = useState('Grupo 01');
  const [escolaEndereco, setEscolaEndereco] = useState('Av. Epitácio Pessoa, João Pessoa, PB');
  const [escolaLat, setEscolaLat] = useState<number>(-7.1153);
  const [escolaLng, setEscolaLng] = useState<number>(-34.8610);
  const [escolaFeedback, setEscolaFeedback] = useState<string | null>(null);

  const [usuariosList, setUsuariosList] = useState<AuthorizedUser[]>([
    {
      id: 'usr-1',
      nome: 'Administrador Geral (Coordenação)',
      email: 'bolaojpa@gmail.com',
      cargo: 'coordenacao_geral',
      regiao: 'Todas as Jurisdições',
      grupo_id: 'Grupo 01',
      status: 'ativo',
    },
  ]);

  const [escolasList, setEscolasList] = useState<Escola[]>([
    { id: 'e1', nome: 'EMEF Anísio Teixeira', endereco: 'R. Anísio Teixeira, Jaguaribe, João Pessoa - PB', regiao: 'Polo Norte', grupo_id: 'Grupo 01', latitude: -7.1350, longitude: -34.8700, lat_lng_oficial: '-7.1350,-34.8700', created_at: '', updated_at: '' },
    { id: 'e2', nome: 'EMEF Paulo Freire', endereco: 'Av. Mandacaru, Mandacaru, João Pessoa - PB', regiao: 'Polo Norte', grupo_id: 'Grupo 01', latitude: -7.1100, longitude: -34.8600, lat_lng_oficial: '-7.1100,-34.8600', created_at: '', updated_at: '' },
    { id: 'e3', nome: 'EMEF Florestan Fernandes', endereco: 'R. Mangabeira, Mangabeira, João Pessoa - PB', regiao: 'Polo Sul', grupo_id: 'Grupo 02', latitude: -7.1700, longitude: -34.8500, lat_lng_oficial: '-7.1700,-34.8500', created_at: '', updated_at: '' },
    { id: 'e4', nome: 'EMEF Darcy Ribeiro', endereco: 'Av. Principal, Bancários, João Pessoa - PB', regiao: 'Polo Sul', grupo_id: 'Grupo 02', latitude: -7.1500, longitude: -34.8400, lat_lng_oficial: '-7.1500,-34.8400', created_at: '', updated_at: '' },
    { id: 'e5', nome: 'EMEF Celso Furtado', endereco: 'R. Tambaú, Tambaú, João Pessoa - PB', regiao: 'Polo Leste', grupo_id: 'Grupo 03', latitude: -7.1153, longitude: -34.8210, lat_lng_oficial: '-7.1153,-34.8210', created_at: '', updated_at: '' },
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
          grupo_id: item.grupo_id || 'Grupo 01',
          status: 'ativo',
        }));

        if (!list.some((u) => u.email.toLowerCase() === 'bolaojpa@gmail.com')) {
          list.unshift({
            id: 'usr-1',
            nome: 'Administrador Geral (Coordenação)',
            email: 'bolaojpa@gmail.com',
            cargo: 'coordenacao_geral',
            regiao: 'Todas as Jurisdições',
            grupo_id: 'Grupo 01',
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
      grupo_id: grupoInput,
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
          grupo_id: grupoInput,
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
    const coordsString = `${escolaLat.toFixed(6)},${escolaLng.toFixed(6)}`;

    const newEscola: Escola = {
      id: `esc-${Date.now()}`,
      nome: nomeClean,
      endereco: escolaEndereco,
      regiao: escolaPolo,
      grupo_id: escolaGrupo,
      latitude: escolaLat,
      longitude: escolaLng,
      lat_lng_oficial: coordsString,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEscolasList((prev) => [newEscola, ...prev]);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error } = await supabase.from('escolas').insert({
        nome: nomeClean,
        endereco: escolaEndereco,
        regiao: escolaPolo,
        grupo_id: escolaGrupo,
        latitude: escolaLat,
        longitude: escolaLng,
        lat_lng_oficial: coordsString,
      });

      if (error) {
        setEscolaFeedback(`⚠️ Erro no Supabase: ${error.message}`);
      } else {
        setEscolaFeedback(`✅ Escola Municipal "${nomeClean}" com coordenadas (${escolaLat.toFixed(4)}, ${escolaLng.toFixed(4)}) salva no banco!`);
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

  useEffect(() => {
    if (!loading && (!user || !profile)) {
      window.location.href = '/login';
    }
  }, [loading, user, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <Nav />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Banner CRM de Gestão de Acessos e Escolas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600" />
              <h1 className="text-xl font-extrabold text-slate-900">
                Painel do Administrador: Acessos, Grupos & Geocodificação OpenStreetMap
              </h1>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Controle de Whitelist, Delegação de Grupos de Agentes e Geocodificação via Nominatim (Leaflet.js).
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
              <span>Whitelist & Grupos ({usuariosList.length})</span>
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
              <span>Escolas & Leaflet.js ({escolasList.length})</span>
            </button>
          </div>
        </div>

        {/* MÓDULO 1: WHITELIST DE USUÁRIOS E VÍNCULO DE GRUPO */}
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
                <h2 className="text-base font-extrabold text-slate-900">Pré-Autorizar Novo E-mail e Atribuir Grupo</h2>
              </div>

              <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    Polo / Região:
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Grupo de Campo Vinculado:
                  </label>
                  <select
                    value={grupoInput}
                    onChange={(e) => setGrupoInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                  >
                    <option value="Grupo 01">Grupo 01</option>
                    <option value="Grupo 02">Grupo 02</option>
                    <option value="Grupo 03">Grupo 03</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-5 mt-2">
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
                Lista de E-mails Autorizados e Grupos ({usuariosList.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                      <th className="p-3">Servidor</th>
                      <th className="p-3">E-mail Autorizado</th>
                      <th className="p-3">Nível de Acesso (Cargo)</th>
                      <th className="p-3">Grupo Escalado</th>
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
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                            {user.grupo_id || 'Grupo 01'}
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

        {/* MÓDULO 2: GESTÃO DE ESCOLAS, GEOCODIFICAÇÃO NOMINATIM E LEAFLET.JS */}
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

            {/* Cadastro de Escola Municipal + Geocodificação Nominatim + Mapa Auxiliar Leaflet */}
            <div className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-red-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Cadastro de Escola Municipal com Geocodificação Nominatim (OpenStreetMap)
                </h2>
              </div>

              <form onSubmit={handleAddEscola} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      Polo / Regional:
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
                      Grupo Responsável Delegado:
                    </label>
                    <select
                      value={escolaGrupo}
                      onChange={(e) => setEscolaGrupo(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 font-semibold focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Grupo 01">Grupo 01</option>
                      <option value="Grupo 02">Grupo 02</option>
                      <option value="Grupo 03">Grupo 03</option>
                    </select>
                  </div>
                </div>

                {/* Componente Leaflet de Geocodificação Nominatim + Seleção Interativa no Mapa */}
                <AdminSchoolMapPicker
                  initialLat={escolaLat}
                  initialLng={escolaLng}
                  initialEndereco={escolaEndereco}
                  onCoordinatesChange={({ lat, lng, endereco }) => {
                    setEscolaLat(lat);
                    setEscolaLng(lng);
                    if (endereco) setEscolaEndereco(endereco);
                  }}
                />

                <div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary py-4 px-8 text-xs flex items-center justify-center gap-2 font-extrabold shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Salvar Escola com Coordenadas no Banco de Dados</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Escolas Cadastradas com Coordenadas e Grupo */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Rede de Escolas Cadastradas no Banco ({escolasList.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                      <th className="p-3">Unidade Escolar</th>
                      <th className="p-3">Polo/Região</th>
                      <th className="p-3">Grupo Delegado</th>
                      <th className="p-3">Latitude / Longitude</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {escolasList.map((escola) => (
                      <tr key={escola.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-extrabold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-red-600" />
                            <span>{escola.nome}</span>
                          </div>
                          {escola.endereco && (
                            <p className="text-[11px] text-slate-500 font-medium ml-6">{escola.endereco}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                            {escola.regiao}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-800 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                            {escola.grupo_id || 'Grupo 01'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono font-bold">
                          <div className="flex items-center gap-1 text-red-700">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            <span>
                              {escola.latitude ? escola.latitude.toFixed(4) : '-7.1153'},{' '}
                              {escola.longitude ? escola.longitude.toFixed(4) : '-34.8610'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            🟢 Pista Leaflet Pronta
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
