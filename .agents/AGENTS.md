# SAG (Sistema de Acompanhamento de Gestão) - Regras do Projeto

## Diretrizes de Vocabulário (MANDATÓRIO)
- **🚫 Proibido:** Nunca utilizar os termos `evasão` ou `defasagem` em textos de UI, nomes de variáveis, colunas do banco de dados, comentários ou documentações.
- **✅ Substituições Obrigatórias:**
  - `evasão` ➔ `Frequência Irregular` (ou `irregular_frequency` / `frequencia_irregular` em código)
  - `defasagem` ➔ `Desafios de Aprendizagem` (ou `learning_challenges` / `desafios_aprendizagem` em código)

## Stack e Arquitetura
- **Front-end:** Next.js (React), PWA autossuficiente, Tailwind CSS.
- **UI & Componentes:** `shadcn/ui`, `Tremor` (gráficos), `TanStack Table` (tabelas).
- **Relatórios:** `@react-pdf/renderer` (PDF A4 P&B amigável).
- **Back-end & Banco:** Supabase (PostgreSQL) com RLS (Row-Level Security) nativo para RBAC.
- **Autenticação:** Google OAuth integrado com tabela de perfis (Agente Educacional, Gerente de Polo, Coordenação de Dados/Geral).

## Identidade Visual e UX/UI
- **Cores:** Fundo predominantemente Branco (#FFFFFF) com destaques e botões de ação em Vermelho. Alto contraste.
- **Mobile First:** Módulo de ações com botões `[+]` e `[-]` para incrementos rápidos no celular.
- **Check-in:** Botão simples via HTML5 Geolocation API cruzado com o endereço da escola em segundo plano.
- **Intercorrências:** Classificação por semáforo: 🟢 Baixa, 🟡 Média, 🔴 Alta.
- **Contingência Offline:** Suporte PWA com IndexedDB e sincronização silenciosa via Service Workers ao reconectar.
