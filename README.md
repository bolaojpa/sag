# 🏫 SAG — Sistema de Acompanhamento de Gestão (Iniciativa Futuro v2.0)

> **Aplicação Web Progressiva (PWA)** autossuficiente projetada para digitalizar o fluxo de dados entre o chão da escola e a gestão governamental da **Prefeitura de João Pessoa (PB)**.

---

## 📌 Documentações do Projeto

Toda a documentação oficial da arquitetura, regras de negócio e especificações do sistema está localizada na raiz deste repositório:

1. 📄 **[DET.md — Documento de Especificação Técnica](file:///c:/Users/Cecapro1/.gemini/antigravity-ide/scratch/sag/DET.md)**  
   Detalhamento da arquitetura de software, infraestrutura PostgreSQL/Supabase, módulos operacionais, mapa de calor e regras de contingência offline.

2. 📋 **[AGENTS.md — Regras do Projeto & Diretrizes de Vocabulário](file:///c:/Users/Cecapro1/.gemini/antigravity-ide/scratch/sag/.agents/AGENTS.md)**  
   Diretrizes obrigatórias de vocabulário educacional, restrições de termos (`Frequência Irregular` e `Desafios de Aprendizagem`), identidade visual (Branco #FFFFFF e Vermelho) e controle de permissões por perfil (RBAC).

3. 🗄️ **[schema.sql — Estrutura de Banco de Dados PostgreSQL](file:///c:/Users/Cecapro1/.gemini/antigravity-ide/scratch/sag/supabase/schema.sql)**  
   Modelagem SQL das tabelas de `escolas`, `whitelist_emails`, `visitas`, `registros_diarios` e `intercorrencias` no Supabase com políticas RLS (Row-Level Security).

---

## 🚀 Arquitetura & Tecnologias Utilizadas

- **Front-end:** Next.js 14 (React 18), Tailwind CSS, TypeScript.
- **Mapeamento & Geocodificação:** OpenStreetMap com Leaflet.js (pinagem interativa de coordenadas, busca direta por endereço por texto e geocodificação reversa por clique/arraste do pino).
- **Back-end & Banco:** Supabase (PostgreSQL) com políticas nativas de RLS (Row-Level Security).
- **Autenticação:** Google OAuth integrado à Whitelist de Servidores Institucionais.
- **Relatórios:** Módulo oficial para impressão A4 e exportação em PDF em preto e branco.
- **Contingência Offline:** Suporte PWA com cache duplo em segundo plano (`localStorage` + IndexedDB v7).

---

## 👥 Perfis de Acesso (RBAC)

1. **Agente Educacional (Campo):** Acesso mobile para registro de check-in GPS, ações diárias e intercorrencias nas escolas do seu grupo escalado.
2. **Gerente de Polo / Coordenação de Área:** Visão gerencial regionalizada das escolas da sua jurisdição geográfica.
3. **Coordenação de Dados / Coordenação Geral (Admin):** Acesso irrestrito ao mapa geral de toda a rede municipal, relatórios globais e cadastro de unidades/servidores.

---

## 🔤 Diretrizes de Vocabulário (MANDATÓRIO)

- 🚫 **Termos Proibidos:** `evasão` e `defasagem`.
- ✅ **Substituições Obrigatórias:**
  - `evasão` ➔ **`Frequência Irregular`** (`frequencia_irregular`).
  - `defasagem` ➔ **`Desafios de Aprendizagem`** (`desafios_aprendizagem`).

---

## 💻 Como Executar o Projeto Localmente

```bash
# 1. Instalar as dependências
npm install

# 2. Executar o servidor de desenvolvimento
npm run dev

# 3. Gerar a compilação de produção (build)
npm run build
```
