-- ==============================================================================
-- SAG - SISTEMA DE ACOMPANHAMENTO DE GESTÃO (v2.0)
-- UPDATE: DEFINIÇÃO AUTOMÁTICA DE ADMIN GERAL PARA O E-MAIL DA COORDENAÇÃO
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, cargo, regiao_atuacao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    CASE 
      WHEN LOWER(NEW.email) = 'bolaojpa@gmail.com' THEN 'coordenacao_geral'::public.cargo_type
      ELSE 'agente'::public.cargo_type
    END,
    NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    cargo = EXCLUDED.cargo;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
