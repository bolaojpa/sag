'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { CargoType, Escola } from '@/types/database';
import { UserPlus, Shield, UserCheck, Trash2, CheckCircle2, Mail, Building2, MapPin, Plus, Users, Calendar, Clock, Navigation, Pencil, X } from 'lucide-react';
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

import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  action?: () => void | Promise<void>;
}

import { useSearchParams } from 'next/navigation';

function UsuariosPageContent() {
  const { user, profile, cargo, loading } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'whitelist' | 'escolas' | 'escala'>('escolas');

  const isAdmin = ['coordenacao_geral', 'coordenador_dados', 'coordenacao_area', 'gerente_polo'].includes(cargo);

  useEffect(() => {
    if (searchParams) {
      const tabParam = searchParams.get('tab');
      if (tabParam === 'escolas' || tabParam === 'whitelist' || tabParam === 'escala') {
        setActiveTab(tabParam as any);
      }
    }
  }, [searchParams]);

  // Modal de Confirmação Global
  const [confirmModal, setConfirmModal] = useState<ModalConfig>({
    isOpen: false,
    title: '',
    message: '',
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    if (confirmModal.action) {
      await confirmModal.action();
    }
    closeConfirmModal();
  };

  // Whitelist Form State
  const [nomeInput, setNomeInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [cargoInput, setCargoInput] = useState<CargoType>('agente');
  const [regiaoInput, setRegiaoInput] = useState('Polo Norte');
  const [grupoInput, setGrupoInput] = useState('Grupo 01');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Escolas Form State (Cadastro & Edição)
  const [editingEscolaId, setEditingEscolaId] = useState<string | null>(null);
  const [escolaNome, setEscolaNome] = useState('');
  const [escolaPolo, setEscolaPolo] = useState('Polo Norte');
  const [escolaEndereco, setEscolaEndereco] = useState('Av. Epitácio Pessoa, João Pessoa, PB');
  const [escolaLat, setEscolaLat] = useState<number>(-7.1153);
  const [escolaLng, setEscolaLng] = useState<number>(-34.8610);
  const [escolaFeedback, setEscolaFeedback] = useState<string | null>(null);

  // Escala & Atribuição Form State
  const [selectedPoloEscala, setSelectedPoloEscala] = useState<string>('Polo Norte');
  const [escalaFeedback, setEscalaFeedback] = useState<string | null>(null);

  const DEFAULT_ESCOLAS: Escola[] = [];

  const DEFAULT_WHITELIST: AuthorizedUser[] = [
    {
      id: 'usr-1',
      nome: 'Administrador Geral (Coordenação)',
      email: 'bolaojpa@gmail.com',
      cargo: 'coordenacao_geral',
      regiao: 'Todas as Jurisdições',
      grupo_id: '',
      status: 'ativo',
    },
  ];

  const [usuariosList, setUsuariosList] = useState<AuthorizedUser[]>(DEFAULT_WHITELIST);
  const [escolasList, setEscolasList] = useState<Escola[]>(DEFAULT_ESCOLAS);

  // Helper functions para gravação síncrona no localStorage e Supabase
  const saveEscolasState = (newList: Escola[]) => {
    setEscolasList(newList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sag_escolas_v7', JSON.stringify(newList));
    }
  };

  const sanitizeWhitelist = (list: AuthorizedUser[]): AuthorizedUser[] => {
    return list.map((u) => {
      const isAdmin =
        u.email.toLowerCase() === 'bolaojpa@gmail.com' ||
        u.cargo === 'coordenacao_geral' ||
        u.cargo === 'coordenador_dados' ||
        u.cargo === 'coordenacao_area';

      return {
        ...u,
        cargo: u.email.toLowerCase() === 'bolaojpa@gmail.com' ? 'coordenacao_geral' : u.cargo,
        grupo_id: isAdmin ? '' : (u.grupo_id && !u.grupo_id.includes('Geral') ? u.grupo_id : 'Grupo 01'),
      };
    });
  };

  const saveWhitelistState = (newList: AuthorizedUser[]) => {
    const cleanList = sanitizeWhitelist(newList);
    setUsuariosList(cleanList);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sag_whitelist_v7', JSON.stringify(cleanList));
    }
  };

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
          grupo_id: (item.cargo === 'coordenacao_geral' || item.cargo === 'coordenador_dados' || item.cargo === 'coordenacao_area')
            ? ''
            : (item.grupo_id || 'Grupo 01'),
          status: 'ativo',
        }));

        if (!list.some((u) => u.email.toLowerCase() === 'bolaojpa@gmail.com')) {
          list.unshift(DEFAULT_WHITELIST[0]);
        }
        saveWhitelistState(list);
      }
    } catch (err) {
      console.warn('Erro ao carregar lista de whitelist:', err);
    }
  };

  const fetchEscolas = async () => {
    try {
      const res = await fetch('/api/escolas');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.length > 0) {
          saveEscolasState(json.data);
          return;
        }
      }
      
      // Fallback para Supabase direto
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: dbEscolas } = await supabase.from('escolas').select('*').order('nome', { ascending: true });

      if (dbEscolas && dbEscolas.length > 0) {
        saveEscolasState(dbEscolas);
      }
    } catch (err) {
      console.warn('Erro ao carregar escolas do banco:', err);
    }
  };

  // Inicialização com cache local síncrono v7
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cachedEscolas = localStorage.getItem('sag_escolas_v7');
    if (cachedEscolas) {
      try {
        setEscolasList(JSON.parse(cachedEscolas));
      } catch (e) {
        setEscolasList(DEFAULT_ESCOLAS);
      }
    } else {
      localStorage.setItem('sag_escolas_v7', JSON.stringify(DEFAULT_ESCOLAS));
    }

    const cachedWhitelist = localStorage.getItem('sag_whitelist_v7');
    if (cachedWhitelist) {
      try {
        const parsed = JSON.parse(cachedWhitelist);
        setUsuariosList(sanitizeWhitelist(parsed));
      } catch (e) {
        setUsuariosList(DEFAULT_WHITELIST);
      }
    } else {
      localStorage.setItem('sag_whitelist_v7', JSON.stringify(DEFAULT_WHITELIST));
    }

    if (!loading) {
      fetchWhitelist();
      fetchEscolas();
    }
  }, [loading]);

  // Ações de Whitelist com Confirmação e Persistência
  const executeAddUser = async () => {
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

    const updated = [newUser, ...usuariosList.filter((u) => u.email !== emailClean)];
    saveWhitelistState(updated);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('whitelist_emails').upsert(
        {
          email: emailClean,
          nome: nomeClean,
          cargo: cargoInput,
          regiao_atuacao: regiaoInput,
          grupo_id: grupoInput,
        },
        { onConflict: 'email' }
      );
      setFeedback(`✅ E-mail ${emailClean} cadastrado na Whitelist com sucesso!`);
    } catch (err: any) {
      setFeedback(`✅ E-mail ${emailClean} salvo localmente no dispositivo.`);
    }

    setNomeInput('');
    setEmailInput('');
    setTimeout(() => setFeedback(null), 5000);
  };

  const requestAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !nomeInput.trim()) return;

    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Cadastro na Whitelist',
      message: `Deseja autorizar o e-mail "${emailInput.trim().toLowerCase()}" (${nomeInput.trim()}) com cargo "${cargoBadges[cargoInput]}" no "${regiaoInput}"?`,
      confirmText: 'Autorizar Servidor',
      variant: 'primary',
      action: () => executeAddUser(),
    });
  };

  const executeRemoveUser = async (id: string, email: string) => {
    const updated = usuariosList.filter((u) => u.id !== id);
    saveWhitelistState(updated);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('whitelist_emails').delete().eq('email', email.toLowerCase());
      setFeedback(`✅ Autorização do e-mail ${email} foi revogada com sucesso.`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.warn('Exclusão Whitelist Supabase:', err);
    }
  };

  const requestRemoveUser = (id: string, email: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Revogar Autorização de Acesso',
      message: `Tem certeza que deseja revogar o e-mail "${email}" da Whitelist? O usuário perderá o acesso ao SAG imediatamente.`,
      confirmText: 'Revogar Acesso',
      variant: 'danger',
      action: () => executeRemoveUser(id, email),
    });
  };

  // Cadastro e Edição de Unidade Escolar com Confirmação e Persistência
  const handleEditEscolaClick = (escola: Escola) => {
    let parsedLat = escola.latitude;
    let parsedLng = escola.longitude;

    if ((parsedLat === undefined || parsedLat === null) && escola.lat_lng_oficial) {
      const parts = escola.lat_lng_oficial.split(',');
      if (parts.length === 2) {
        parsedLat = parseFloat(parts[0]);
        parsedLng = parseFloat(parts[1]);
      }
    }

    setEditingEscolaId(escola.id);
    setEscolaNome(escola.nome);
    setEscolaPolo(escola.regiao || 'Polo Norte');
    setEscolaEndereco(escola.endereco || '');
    const finalLat = (parsedLat !== undefined && parsedLat !== null && !isNaN(Number(parsedLat))) ? Number(parsedLat) : -7.1153;
    const finalLng = (parsedLng !== undefined && parsedLng !== null && !isNaN(Number(parsedLng))) ? Number(parsedLng) : -34.8610;

    setEscolaLat(finalLat);
    setEscolaLng(finalLng);

    const formElement = document.getElementById('form-cadastro-escola');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelEditEscola = () => {
    setEditingEscolaId(null);
    setEscolaNome('');
    setEscolaPolo('Polo Norte');
    setEscolaEndereco('Av. Epitácio Pessoa, João Pessoa, PB');
    setEscolaLat(-7.1153);
    setEscolaLng(-34.8610);
  };

  const executeSaveEscola = async () => {
    if (!isAdmin) return;
    const nomeClean = escolaNome.trim();
    const coordsString = `${escolaLat.toFixed(6)},${escolaLng.toFixed(6)}`;

    if (editingEscolaId) {
      // MODO EDIÇÃO
      const updated = escolasList.map((e) =>
        e.id === editingEscolaId
          ? {
              ...e,
              nome: nomeClean,
              endereco: escolaEndereco,
              regiao: escolaPolo,
              latitude: escolaLat,
              longitude: escolaLng,
              lat_lng_oficial: coordsString,
              updated_at: new Date().toISOString(),
            }
          : e
      );
      saveEscolasState(updated);

      try {
        const response = await fetch('/api/escolas', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingEscolaId,
            nome: nomeClean,
            endereco: escolaEndereco,
            regiao: escolaPolo,
            latitude: escolaLat,
            longitude: escolaLng,
            lat_lng_oficial: coordsString,
          }),
        });

        const json = await response.json();
        if (response.ok && json.success) {
          setEscolaFeedback(`✅ Unidade Escolar "${nomeClean}" e novo endereço atualizados com sucesso!`);
        } else {
          setEscolaFeedback(`✅ Unidade Escolar "${nomeClean}" atualizada no dispositivo.`);
        }
      } catch (err: any) {
        console.warn('Erro ao atualizar via PUT /api/escolas:', err);
        setEscolaFeedback(`✅ Alterações da escola "${nomeClean}" salvas localmente.`);
      }

      setEditingEscolaId(null);
      setEscolaNome('');
      setTimeout(() => setEscolaFeedback(null), 5000);
      return;
    }

    const newEscolaObj: Escola = {
      id: `esc-${Date.now()}`,
      nome: nomeClean,
      endereco: escolaEndereco,
      regiao: escolaPolo,
      grupo_id: 'Grupo 01',
      data_programada: new Date().toISOString().split('T')[0],
      turno_programado: 'Manhã',
      latitude: escolaLat,
      longitude: escolaLng,
      lat_lng_oficial: coordsString,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Atualiza imediatamente o estado e cache local
    const updated = [newEscolaObj, ...escolasList.filter(e => e.nome.toLowerCase() !== nomeClean.toLowerCase())];
    saveEscolasState(updated);

    try {
      const response = await fetch('/api/escolas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nomeClean,
          endereco: escolaEndereco,
          regiao: escolaPolo,
          grupo_id: 'Grupo 01',
          latitude: escolaLat,
          longitude: escolaLng,
          lat_lng_oficial: coordsString,
        }),
      });

      const json = await response.json();
      if (response.ok && json.success && json.data) {
        // Substitui o ID temporário pelo ID real do Supabase
        const persisted = updated.map(e => e.id === newEscolaObj.id ? json.data : e);
        saveEscolasState(persisted);
        setEscolaFeedback(`✅ Escola Municipal "${nomeClean}" cadastrada com sucesso!`);
      } else {
        setEscolaFeedback(`✅ Escola "${nomeClean}" cadastrada e salva na memória do sistema.`);
      }
    } catch (err: any) {
      console.warn('Persistência via API:', err);
      setEscolaFeedback(`✅ Escola "${nomeClean}" salva com sucesso.`);
    }

    setEscolaNome('');
    setTimeout(() => setEscolaFeedback(null), 6000);
  };

  const requestSaveEscola = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Acesso negado: Somente administradores podem cadastrar ou editar escolas.');
      return;
    }
    if (!escolaNome.trim()) return;

    const title = editingEscolaId
      ? 'Confirmar Edição de Unidade Escolar'
      : 'Confirmar Cadastro de Unidade Escolar';
    const message = editingEscolaId
      ? `Deseja salvar as alterações para a escola "${escolaNome.trim()}" no "${escolaPolo}" com a localização: "${escolaEndereco}"?`
      : `Deseja cadastrar a escola "${escolaNome.trim()}" no "${escolaPolo}" com a localização capturada: "${escolaEndereco}"?`;
    const confirmText = editingEscolaId ? 'Salvar Alterações' : 'Cadastrar Escola';

    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      variant: 'primary',
      action: () => executeSaveEscola(),
    });
  };

  const executeRemoveEscola = async (id: string) => {
    if (!isAdmin) return;
    const updated = escolasList.filter((e) => e.id !== id);
    saveEscolasState(updated);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase.from('escolas').delete().eq('id', id);
      setEscolaFeedback('✅ Unidade escolar removida da listagem com sucesso.');
      setTimeout(() => setEscolaFeedback(null), 4000);
    } catch (err) {
      console.warn('Exclusão Escola Supabase:', err);
    }
  };

  const requestRemoveEscola = (id: string, nome: string) => {
    if (!isAdmin) {
      alert('Acesso negado: Somente administradores podem excluir unidades escolares.');
      return;
    }
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Unidade Escolar',
      message: `Tem certeza que deseja remover a escola "${nome}" da rede de ensino?`,
      confirmText: 'Excluir Escola',
      variant: 'danger',
      action: () => executeRemoveEscola(id),
    });
  };

  // Salvar Escala de Visita com Confirmação e Persistência
  const executeSaveEscalaVisita = async (
    escolaId: string,
    grupoId: string,
    dataProgramada: string,
    turnoProgramado: string
  ) => {
    const updated = escolasList.map((e) =>
      e.id === escolaId
        ? { ...e, grupo_id: grupoId, data_programada: dataProgramada, turno_programado: turnoProgramado }
        : e
    );
    saveEscolasState(updated);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      await supabase
        .from('escolas')
        .update({
          grupo_id: grupoId,
          data_programada: dataProgramada,
          turno_programado: turnoProgramado,
        })
        .eq('id', escolaId);

      setEscalaFeedback(`✅ Escala salva: Escola delegada ao ${grupoId} para ${dataProgramada} (${turnoProgramado})!`);
      setTimeout(() => setEscalaFeedback(null), 4000);
    } catch (err) {
      console.warn('Erro ao atribuir escala:', err);
    }
  };

  const requestSaveEscalaVisita = (
    escolaId: string,
    escolaNome: string,
    grupoId: string,
    dataProgramada: string,
    turnoProgramado: string
  ) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Atribuição de Escala',
      message: `Deseja atribuir a visita da escola "${escolaNome}" ao ${grupoId} para a data ${dataProgramada} (${turnoProgramado})?`,
      confirmText: 'Salvar Escala',
      variant: 'primary',
      action: () => executeSaveEscalaVisita(escolaId, grupoId, dataProgramada, turnoProgramado),
    });
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
      return;
    }
    if (!loading && user && !isAdmin) {
      window.location.href = '/';
    }
  }, [loading, user, profile, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile || !isAdmin) {
    return null;
  }

  return (
    <AppShell
      title="Gestão de Unidades, Escalas & Servidores"
      onNewActionClick={() => {
        setActiveTab('escolas');
        const formElement = document.getElementById('form-cadastro-escola');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
      }}
    >
      <div className="space-y-6">
        {/* Banner CRM de Gestão de Acessos e Escolas */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Painel da Coordenação: Cadastro, Escala & Whitelist
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              1. Cadastro Inicial no Mapa (Pino Reverso) • 2. Atribuição de Visita por Polo aos Grupos • 3. Whitelist de Servidores
            </p>
          </div>

          {/* Abas Alternáveis de Gestão */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('escolas')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'escolas'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>1. Cadastro Inicial ({escolasList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('escala')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'escala'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>2. Escala & Atribuição</span>
            </button>

            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                activeTab === 'whitelist'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. Whitelist ({usuariosList.length})</span>
            </button>
          </div>
        </div>

        {/* ABA 1: CADASTRO INICIAL DE UNIDADES ESCOLARES (MAPA + GEOCODIFICAÇÃO REVERSA) */}
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

            {/* Banner Informativo de Permissão para Não-Admins */}
            {!isAdmin && (
              <div className="bg-amber-50 border border-amber-300 text-amber-950 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Modo Somente Leitura: Apenas Administradores Gerais e Coordenação possuem permissão para cadastrar, editar ou excluir unidades escolares.</span>
              </div>
            )}

            {/* Form de Cadastro & Edição de Unidade Escolar (Exclusivo para ADMINS) */}
            {isAdmin && (
              <div id="form-cadastro-escola" className="bg-white border-l-4 border-l-red-600 border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-red-600" />
                    <h2 className="text-base font-extrabold text-slate-900">
                      {editingEscolaId
                        ? 'Edição de Unidade Escolar Cadastrada'
                        : 'Cadastro Inicial da Unidade Escolar (Mapeamento Geográfico no OpenStreetMap)'}
                    </h2>
                  </div>
                  {editingEscolaId && (
                    <span className="bg-blue-100 text-blue-900 text-xs font-black px-3 py-1 rounded-full border border-blue-300 animate-pulse">
                      ✏️ Modo Edição Ativo
                    </span>
                  )}
                </div>

              <form onSubmit={requestSaveEscola} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                {/* Exibição Destacada do Endereço Capturado pelo Pino */}
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <span className="font-extrabold text-emerald-950 block">📍 Endereço Capturado Instantaneamente pelo Pino do Mapa:</span>
                  <input
                    type="text"
                    readOnly
                    value={escolaEndereco}
                    className="w-full bg-white border border-emerald-300 text-emerald-900 font-extrabold text-xs rounded-lg p-2.5 shadow-inner"
                  />
                </div>

                {/* Componente Leaflet de Geocodificação Reversa por Pino */}
                <AdminSchoolMapPicker
                  key={`${editingEscolaId || 'new'}-${escolaLat}-${escolaLng}`}
                  initialLat={escolaLat}
                  initialLng={escolaLng}
                  initialEndereco={escolaEndereco}
                  onCoordinatesChange={({ lat, lng, endereco }) => {
                    setEscolaLat(lat);
                    setEscolaLng(lng);
                    if (endereco) {
                      setEscolaEndereco(endereco);
                    }
                  }}
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    className="w-full sm:w-auto btn-primary py-4 px-8 text-xs flex items-center justify-center gap-2 font-extrabold shadow-lg"
                  >
                    {editingEscolaId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{editingEscolaId ? 'Salvar Alterações da Unidade Escolar' : 'Cadastrar Unidade Escolar na Rede'}</span>
                  </button>

                  {editingEscolaId && (
                    <button
                      type="button"
                      onClick={cancelEditEscola}
                      className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-800 py-4 px-6 text-xs flex items-center justify-center gap-2 font-bold rounded-xl transition-all"
                    >
                      <X className="w-4 h-4 text-slate-600" />
                      <span>Cancelar Edição</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
            )}

            {/* Tabela de Unidades Cadastradas */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                Unidades Escolares Cadastradas ({escolasList.length})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-extrabold border-b border-slate-300">
                      <th className="p-3">Unidade Escolar & Endereço Capturado</th>
                      <th className="p-3">Polo / Regional</th>
                      <th className="p-3">Coordenadas Pino Leaflet</th>
                      <th className="p-3 text-center">Status Mapeamento</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {escolasList.map((escola) => (
                      <tr key={escola.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-extrabold text-slate-900">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{escola.nome}</span>
                          </div>
                          {escola.endereco && (
                            <p className="text-[11px] text-slate-500 font-medium ml-6 leading-relaxed">{escola.endereco}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 text-slate-800 font-extrabold px-2.5 py-0.5 rounded-full border border-slate-200">
                            {escola.regiao}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono font-bold">
                          <div className="flex items-center gap-1 text-red-700">
                            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                            <span>
                              {escola.latitude ? escola.latitude.toFixed(4) : '-7.1153'},{' '}
                              {escola.longitude ? escola.longitude.toFixed(4) : '-34.8610'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                            🟢 Mapeado via Pino
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {isAdmin ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEditEscolaClick(escola)}
                                className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200 shadow-sm flex items-center gap-1 font-bold"
                                title="Editar Informações da Escola"
                              >
                                <Pencil className="w-4 h-4 text-blue-600" />
                                <span className="hidden sm:inline text-[11px]">Editar</span>
                              </button>

                              <button
                                onClick={() => requestRemoveEscola(escola.id, escola.nome)}
                                className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors border border-red-200 shadow-sm"
                                title="Remover Escola da Rede"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold">Somente Leitura</span>
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

        {/* ABA 2: ESCALA & ATRIBUIÇÃO DE VISITAS POR POLO AOS GRUPOS DE AGENTES */}
        {activeTab === 'escala' && (
          <div className="space-y-6">
            {escalaFeedback && (
              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-bold animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{escalaFeedback}</span>
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-red-600" />
                    <span>Escala & Atribuição de Visitas de Campo</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Selecione o Polo Regional para listar as unidades cadastradas e programar a escala de visitas dos Grupos de Agentes.
                  </p>
                </div>

                {/* Seletor de Polo Regional para a Escala */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-800 whitespace-nowrap">
                    Polo Regional:
                  </label>
                  <select
                    value={selectedPoloEscala}
                    onChange={(e) => setSelectedPoloEscala(e.target.value)}
                    className="bg-red-50 border border-red-200 text-red-900 text-xs rounded-xl p-2.5 font-extrabold focus:ring-2 focus:ring-red-500 shadow-sm"
                  >
                    <option value="Polo Norte">Polo Norte ({escolasList.filter((e) => e.regiao === 'Polo Norte').length} unidades)</option>
                    <option value="Polo Sul">Polo Sul ({escolasList.filter((e) => e.regiao === 'Polo Sul').length} unidades)</option>
                    <option value="Polo Leste">Polo Leste ({escolasList.filter((e) => e.regiao === 'Polo Leste').length} unidades)</option>
                    <option value="Polo Oeste">Polo Oeste ({escolasList.filter((e) => e.regiao === 'Polo Oeste').length} unidades)</option>
                  </select>
                </div>
              </div>

              {/* Lista de Unidades do Polo com Formulário de Escala */}
              <div className="space-y-4">
                {escolasList.filter((e) => e.regiao === selectedPoloEscala).length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 text-xs font-bold">
                    Nenhuma unidade escolar cadastrada no {selectedPoloEscala}. Cadastre as unidades na aba "1. Cadastro Inicial de Unidades".
                  </div>
                ) : (
                  escolasList
                    .filter((e) => e.regiao === selectedPoloEscala)
                    .map((escola) => (
                      <div
                        key={escola.id}
                        className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 hover:border-slate-300 transition-all"
                      >
                        {/* Informações da Unidade */}
                        <div className="flex-1 min-w-[240px]">
                          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900">
                            <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                            <span>{escola.nome}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            📍 {escola.endereco || 'Endereço mapeado via pino Leaflet'}
                          </p>
                        </div>

                        {/* Configuração da Escala: Grupo, Data e Horário */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                              Grupo Delegado:
                            </label>
                            <select
                              id={`grupo-${escola.id}`}
                              defaultValue={escola.grupo_id || 'Grupo 01'}
                              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-2 font-bold focus:ring-2 focus:ring-red-500 shadow-sm"
                            >
                              <option value="Grupo 01">Grupo 01</option>
                              <option value="Grupo 02">Grupo 02</option>
                              <option value="Grupo 03">Grupo 03</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                              Data Programada:
                            </label>
                            <input
                              type="date"
                              id={`data-${escola.id}`}
                              defaultValue={escola.data_programada || new Date().toISOString().split('T')[0]}
                              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-2 font-bold focus:ring-2 focus:ring-red-500 shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase mb-0.5">
                              Turno:
                            </label>
                            <select
                              id={`turno-${escola.id}`}
                              defaultValue={escola.turno_programado || 'Manhã'}
                              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-xl p-2 font-bold focus:ring-2 focus:ring-red-500 shadow-sm"
                            >
                              <option value="Manhã">Manhã (08h - 12h)</option>
                              <option value="Tarde">Tarde (13h - 17h)</option>
                              <option value="Integral">Integral</option>
                            </select>
                          </div>

                          <div className="self-end">
                            <button
                              type="button"
                              onClick={() => {
                                const gEl = document.getElementById(`grupo-${escola.id}`) as HTMLSelectElement;
                                const dEl = document.getElementById(`data-${escola.id}`) as HTMLInputElement;
                                const tEl = document.getElementById(`turno-${escola.id}`) as HTMLSelectElement;
                                requestSaveEscalaVisita(escola.id, escola.nome, gEl.value, dEl.value, tEl.value);
                              }}
                              className="btn-primary py-2.5 px-4 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              <span>Atribuir Escala</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ABA 3: WHITELIST DE USUÁRIOS E VÍNCULO DE GRUPO */}
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
                <h2 className="text-base font-extrabold text-slate-900">Pré-Autorizar Novo E-mail e Atribuir Cargo</h2>
              </div>

              <form onSubmit={requestAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                    value={
                      cargoInput === 'coordenacao_geral' || cargoInput === 'coordenador_dados' || cargoInput === 'coordenacao_area'
                        ? 'Geral (Todos os Grupos)'
                        : grupoInput
                    }
                    disabled={
                      cargoInput === 'coordenacao_geral' || cargoInput === 'coordenador_dados' || cargoInput === 'coordenacao_area'
                    }
                    onChange={(e) => setGrupoInput(e.target.value)}
                    className={`w-full text-xs rounded-xl p-3 font-extrabold focus:ring-2 focus:ring-red-500 border ${
                      cargoInput === 'coordenacao_geral' || cargoInput === 'coordenador_dados' || cargoInput === 'coordenacao_area'
                        ? 'bg-purple-50 text-purple-950 border-purple-200 cursor-not-allowed'
                        : 'bg-slate-50 text-slate-900 border-slate-300'
                    }`}
                  >
                    {cargoInput === 'coordenacao_geral' || cargoInput === 'coordenador_dados' || cargoInput === 'coordenacao_area' ? (
                      <option value="Geral (Todos os Grupos)">✨ Geral (Todos os Grupos / Sem Vínculo)</option>
                    ) : (
                      <>
                        <option value="Grupo 01">Grupo 01</option>
                        <option value="Grupo 02">Grupo 02</option>
                        <option value="Grupo 03">Grupo 03</option>
                      </>
                    )}
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
                          {user.email.toLowerCase() === 'bolaojpa@gmail.com' ||
                          user.cargo === 'coordenacao_geral' ||
                          user.cargo === 'coordenador_dados' ||
                          user.cargo === 'coordenacao_area' ||
                          !user.grupo_id ||
                          user.grupo_id === '' ||
                          user.grupo_id.includes('Geral') ? (
                            <span className="text-slate-400 font-extrabold text-sm ml-4">-</span>
                          ) : (
                            <span className="bg-blue-50 text-blue-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-blue-200">
                              {user.grupo_id}
                            </span>
                          )}
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
                              onClick={() => requestRemoveUser(user.id, user.email)}
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

        {/* Caixa de Confirmação Global para Operações de Cadastro, Edição e Exclusão */}
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          variant={confirmModal.variant}
          onConfirm={handleConfirmAction}
          onCancel={closeConfirmModal}
        />
      </div>
    </AppShell>
  );
}

export default function UsuariosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <UsuariosPageContent />
    </Suspense>
  );
}
