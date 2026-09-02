# Documento de Especificação Técnica II (DET2.md)
**Projeto:** Sistema de Acompanhamento de Gestão (SAG)  
**Versão:** 2.1 (Atualizada com Estrutura DDL PostgreSQL, Restrições e Critérios de UX)  
**Foco:** Schemas de Banco de Dados, Regras DDL e Refinamentos de UX/UI  

---

## 1. Estrutura de Banco de Dados (PostgreSQL / Supabase)

### 1.1. Tabela de Perfis Institucionais (`perfis`)
```sql
CREATE TABLE public.perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    cargo TEXT CHECK (cargo IN ('agente', 'gerente_polo', 'coordenacao_area', 'coordenador_dados', 'coordenacao_geral')) NOT NULL,
    regiao_atuacao TEXT,
    grupo_id TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 1.2. Tabela de Unidades Escolares (`escolas`)
```sql
CREATE TABLE public.escolas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    regiao TEXT NOT NULL,
    endereco TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    lat_lng_oficial TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 1.3. Tabela de Ações e Atividades Diárias (`atividades_diarias`)
```sql
CREATE TABLE public.atividades_diarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agente_id UUID REFERENCES public.perfis(id) ON DELETE CASCADE,
    escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
    oficinas_realizadas INT DEFAULT 0,
    alunos_atendidos INT DEFAULT 0,
    relato_qualitativo TEXT,
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 1.4. Tabela de Desafios & Intercorrências (`desafios_intercorrencias`)
```sql
CREATE TABLE public.desafios_intercorrencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    gerente_id UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
    escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
    categoria TEXT CHECK (categoria IN ('Infraestrutura', 'Frequência Irregular', 'Suporte Familiar', 'Falta de Material', 'Outros')) NOT NULL,
    urgencia TEXT CHECK (urgencia IN ('Baixa', 'Média', 'Alta')) NOT NULL,
    descricao TEXT NOT NULL,
    acao_mitigacao TEXT,
    status TEXT CHECK (status IN ('pendente', 'em_analise', 'resolvido')) NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

---

## 2. Critérios de Entrega e Refinamento Técnico (Seção 7)

1. **Performance e State Management:** Utilização do React Context (`AuthContext`) e cache local de sincronização (`sag_escolas_v7`) para gerenciamento do estado global e filtros em tempo real.
2. **TypeScript Estrito:** Tipagem forte das respostas do Supabase (`types/database.ts`) e das propriedades de todos os componentes de interface.
3. **Resiliência de Rede & Contingência Mobile:** Feedbacks visuais e *Skeleton Screens* para conexões lentas, acompanhados de *Optimistic Updates* nos botões `[+]` e `[-]` do PWA mobile.
4. **Feedback Loop Gerencial:** Ao atualizar o status de uma intercorrência no painel desktop, o sistema altera o status no banco e no aplicativo móvel para o agente responsável.
