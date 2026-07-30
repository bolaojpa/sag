-- ==============================================================================
-- SAG - SISTEMA DE ACOMPANHAMENTO DE GESTÃO (v2.0)
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS (SUPABASE POSTGRESQL + RLS)
-- ==============================================================================
-- ATENÇÃO: Diretrizes de Vocabulário Aplicadas
-- Proibido o uso dos termos "evasão" ou "defasagem".
-- Substitutos oficiais: "Frequência Irregular" e "Desafios de Aprendizagem".
-- ==============================================================================

-- 1. LIMPEZA PREVENTIVA (OPCIONAL)
-- CASCADE limpa tabelas, tipos e triggers associados em caso de recriação.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.get_user_cargo(uuid);
DROP FUNCTION IF EXISTS public.get_user_regiao(uuid);

DROP TABLE IF EXISTS public.intercorrencias CASCADE;
DROP TABLE IF EXISTS public.registros_diarios CASCADE;
DROP TABLE IF EXISTS public.visitas CASCADE;
DROP TABLE IF EXISTS public.escolas CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.cargo_type CASCADE;
DROP TYPE IF EXISTS public.urgencia_type CASCADE;
DROP TYPE IF EXISTS public.status_intercorrencia_type CASCADE;

-- 2. ENUMS DE DOMÍNIO
CREATE TYPE public.cargo_type AS ENUM (
  'agente',
  'gerente_polo',
  'coordenacao_area',
  'coordenador_dados',
  'coordenacao_geral'
);

CREATE TYPE public.urgencia_type AS ENUM (
  'baixa',
  'media',
  'alta'
);

CREATE TYPE public.status_intercorrencia_type AS ENUM (
  'aberto',
  'em_analise',
  'resolvido'
);

-- 3. CRIAÇÃO DAS TABELAS PRIMÁRIAS

-- 3.1. Tabela: profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  cargo public.cargo_type NOT NULL DEFAULT 'agente',
  regiao_atuacao TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.2. Tabela: escolas
CREATE TABLE public.escolas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  regiao TEXT NOT NULL,
  lat_lng_oficial TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.3. Tabela: visitas (Check-in via GPS)
CREATE TABLE public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  data_hora_entrada TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  lat_lng_agente TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.4. Tabela: registros_diarios (Ações Pedagógicas)
CREATE TABLE public.registros_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  tipo_atividade TEXT NOT NULL,
  alunos_impactados INTEGER NOT NULL DEFAULT 0 CHECK (alunos_impactados >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3.5. Tabela: intercorrencias (Urgência & Semáforo)
CREATE TABLE public.intercorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  escola_id UUID NOT NULL REFERENCES public.escolas(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL CHECK (categoria IN ('Infraestrutura', 'Frequência Irregular', 'Suporte Familiar', 'Desafios de Aprendizagem')),
  urgencia public.urgencia_type NOT NULL DEFAULT 'baixa',
  descricao TEXT NOT NULL,
  status public.status_intercorrencia_type NOT NULL DEFAULT 'aberto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. FUNÇÕES E TRIGGERS AUXILIARES

-- 4.1. Atualização Automática de updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_escolas_updated_at BEFORE UPDATE ON public.escolas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_registros_diarios_updated_at BEFORE UPDATE ON public.registros_diarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_intercorrencias_updated_at BEFORE UPDATE ON public.intercorrencias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4.2. Criação Automática de Profile no Registro Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, cargo, regiao_atuacao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'agente',
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4.3. Funções Auxiliares de RLS (SECURITY DEFINER previne recursão infinita)
CREATE OR REPLACE FUNCTION public.get_user_cargo(p_user_id UUID)
RETURNS public.cargo_type AS $$
  SELECT cargo FROM public.profiles WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_regiao(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT regiao_atuacao FROM public.profiles WHERE id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 5. HABILITAÇÃO DO ROW-LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercorrencias ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURANÇA (RLS POLICIES)

-- ==============================================================================
-- 6.1. POLÍTICAS PARA: profiles
-- ==============================================================================
-- Leitura de perfis:
-- - Próprio perfil
-- - Gerentes/Coordenadores de área leem perfis da sua região
-- - Gestão de Dados/Geral leem todos os perfis
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
    OR (
      public.get_user_cargo(auth.uid()) IN ('gerente_polo', 'coordenacao_area')
      AND regiao_atuacao = public.get_user_regiao(auth.uid())
    )
  );

-- Atualização de perfil:
-- - Usuário pode atualizar seus dados cadastrais/last_seen
-- - Gestão de Dados/Geral podem atualizar qualquer perfil (definir cargos/regiões)
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
  );

-- ==============================================================================
-- 6.2. POLÍTICAS PARA: escolas
-- ==============================================================================
-- Qualquer usuário autenticado pode visualizar as escolas
CREATE POLICY "escolas_select_policy" ON public.escolas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Apenas Coordenação de Dados/Geral podem inserir, atualizar ou excluir escolas
CREATE POLICY "escolas_insert_policy" ON public.escolas
  FOR INSERT WITH CHECK (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

CREATE POLICY "escolas_update_policy" ON public.escolas
  FOR UPDATE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

CREATE POLICY "escolas_delete_policy" ON public.escolas
  FOR DELETE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

-- ==============================================================================
-- 6.3. POLÍTICAS PARA: visitas (Check-in)
-- ==============================================================================
-- SELECT: Agente vê suas visitas | Gerente vê visitas das escolas da sua região | Geral vê todas
CREATE POLICY "visitas_select_policy" ON public.visitas
  FOR SELECT USING (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
    OR (
      public.get_user_cargo(auth.uid()) IN ('gerente_polo', 'coordenacao_area')
      AND EXISTS (
        SELECT 1 FROM public.escolas e
        WHERE e.id = visitas.escola_id
        AND e.regiao = public.get_user_regiao(auth.uid())
      )
    )
  );

-- INSERT: Agente insere suas próprias visitas (ou Coordenação)
CREATE POLICY "visitas_insert_policy" ON public.visitas
  FOR INSERT WITH CHECK (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
  );

-- UPDATE / DELETE: Apêndice administrativo
CREATE POLICY "visitas_update_policy" ON public.visitas
  FOR UPDATE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

CREATE POLICY "visitas_delete_policy" ON public.visitas
  FOR DELETE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

-- ==============================================================================
-- 6.4. POLÍTICAS PARA: registros_diarios
-- ==============================================================================
-- SELECT: Agente vê seus registros | Gerente vê de sua região | Geral vê todos
CREATE POLICY "registros_diarios_select_policy" ON public.registros_diarios
  FOR SELECT USING (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
    OR (
      public.get_user_cargo(auth.uid()) IN ('gerente_polo', 'coordenacao_area')
      AND EXISTS (
        SELECT 1 FROM public.escolas e
        WHERE e.id = registros_diarios.escola_id
        AND e.regiao = public.get_user_regiao(auth.uid())
      )
    )
  );

-- INSERT: Agente insere seus próprios registros
CREATE POLICY "registros_diarios_insert_policy" ON public.registros_diarios
  FOR INSERT WITH CHECK (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
  );

-- UPDATE / DELETE: Coordenação Geral / Dados
CREATE POLICY "registros_diarios_update_policy" ON public.registros_diarios
  FOR UPDATE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

CREATE POLICY "registros_diarios_delete_policy" ON public.registros_diarios
  FOR DELETE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

-- ==============================================================================
-- 6.5. POLÍTICAS PARA: intercorrencias
-- ==============================================================================
-- SELECT: Agente vê suas intercorrências | Gerente vê de sua região | Geral vê todas
CREATE POLICY "intercorrencias_select_policy" ON public.intercorrencias
  FOR SELECT USING (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
    OR (
      public.get_user_cargo(auth.uid()) IN ('gerente_polo', 'coordenacao_area')
      AND EXISTS (
        SELECT 1 FROM public.escolas e
        WHERE e.id = intercorrencias.escola_id
        AND e.regiao = public.get_user_regiao(auth.uid())
      )
    )
  );

-- INSERT: Agentes e Gestão podem registrar intercorrências
CREATE POLICY "intercorrencias_insert_policy" ON public.intercorrencias
  FOR INSERT WITH CHECK (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral')
  );

-- UPDATE: Agente pode atualizar se for o criador (ex: ajustar descrição) | Gerentes e Coordenação podem alterar status/resolução
CREATE POLICY "intercorrencias_update_policy" ON public.intercorrencias
  FOR UPDATE USING (
    agente_id = auth.uid()
    OR public.get_user_cargo(auth.uid()) IN ('gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral')
  );

-- DELETE: Apenas Coordenação Geral e de Dados
CREATE POLICY "intercorrencias_delete_policy" ON public.intercorrencias
  FOR DELETE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

-- ==============================================================================
-- 7. REPOVOAMENTO INICIAL DE TESTE (SEED DATA OPCIONAL)
-- ==============================================================================
INSERT INTO public.escolas (nome, regiao, lat_lng_oficial) VALUES
  ('EMEF Anísio Teixeira', 'Polo Norte', '-3.7319,-38.5267'),
  ('EMEF Paulo Freire', 'Polo Norte', '-3.7380,-38.5300'),
  ('EMEF Florestan Fernandes', 'Polo Sul', '-3.7700,-38.5500'),
  ('EMEF Darcy Ribeiro', 'Polo Sul', '-3.7800,-38.5600'),
  ('EMEF Celso Furtado', 'Polo Leste', '-3.7400,-38.4900');
