-- ==============================================================================
-- SAG - SISTEMA DE ACOMPANHAMENTO DE GESTÃO (INICIATIVA FUTURO v2.0)
-- SCRIPT DE WHITELIST ESTRITA E GESTÃO DE ACESSOS AUTORIZADOS
-- ==============================================================================

-- 1. TABELA DE E-MAILS PRÉ-AUTORIZADOS (WHITELIST)
CREATE TABLE IF NOT EXISTS public.whitelist_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  cargo public.cargo_type NOT NULL DEFAULT 'agente',
  regiao_atuacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- HABILITAR RLS NA WHITELIST
ALTER TABLE public.whitelist_emails ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS PARA WHITELIST (APENAS COORDENAÇÃO DE DADOS / GERAL PODEM GERENCIAR)
DROP POLICY IF EXISTS "whitelist_select_policy" ON public.whitelist_emails;
CREATE POLICY "whitelist_select_policy" ON public.whitelist_emails
  FOR SELECT USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

DROP POLICY IF EXISTS "whitelist_insert_policy" ON public.whitelist_emails;
CREATE POLICY "whitelist_insert_policy" ON public.whitelist_emails
  FOR INSERT WITH CHECK (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

DROP POLICY IF EXISTS "whitelist_update_policy" ON public.whitelist_emails;
CREATE POLICY "whitelist_update_policy" ON public.whitelist_emails
  FOR UPDATE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

DROP POLICY IF EXISTS "whitelist_delete_policy" ON public.whitelist_emails;
CREATE POLICY "whitelist_delete_policy" ON public.whitelist_emails
  FOR DELETE USING (public.get_user_cargo(auth.uid()) IN ('coordenador_dados', 'coordenacao_geral'));

-- 2. TRIGGER INTELIGENTE DE VERIFICAÇÃO DE E-MAIL PRÉ-AUTORIZADO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_whitelist public.whitelist_emails%ROWTYPE;
BEGIN
  -- Se for o e-mail do Admin Supremo, garante acesso automático como 'coordenacao_geral'
  IF LOWER(NEW.email) = 'bolaojpa@gmail.com' THEN
    INSERT INTO public.profiles (id, nome, email, cargo, regiao_atuacao)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NEW.email,
      'coordenacao_geral'::public.cargo_type,
      NULL
    )
    ON CONFLICT (id) DO UPDATE SET cargo = 'coordenacao_geral'::public.cargo_type;
    RETURN NEW;
  END IF;

  -- Para qualquer outro e-mail, verifica obrigatoriamente se consta na Whitelist
  SELECT * INTO v_whitelist FROM public.whitelist_emails WHERE LOWER(email) = LOWER(NEW.email);

  IF FOUND THEN
    -- E-mail pré-autorizado pelo Admin: Cria o profile com o cargo e polo configurados
    INSERT INTO public.profiles (id, nome, email, cargo, regiao_atuacao)
    VALUES (
      NEW.id,
      COALESCE(v_whitelist.nome, NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.email,
      v_whitelist.cargo,
      v_whitelist.regiao_atuacao
    )
    ON CONFLICT (id) DO UPDATE SET
      cargo = EXCLUDED.cargo,
      regiao_atuacao = EXCLUDED.regiao_atuacao;
  ELSE
    -- E-mail NÃO pré-autorizado: Não cria perfil no sistema (impedindo acesso pelas RLS)
    RAISE NOTICE 'Tentativa de login por e-mail não autorizado: %', NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
