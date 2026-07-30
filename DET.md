# Documento de Especificação Técnica (DET)
**Projeto:** Sistema de Acompanhamento de Gestão (SAG) - Iniciativa Futuro  
**Versão:** 2.0 (Atualizada com simplificação de auditoria e contingência offline)  
**Foco:** Arquitetura de Software, Regras de Negócio e UX/UI  

---

## 1. Visão Geral do Sistema
O **SAG** é uma aplicação web progressiva (PWA) autossuficiente projetada para digitalizar o fluxo de dados entre o chão da escola e a gestão governamental. O sistema elimina relatórios em papel, garantindo coleta de dados rápida via mobile e visualização analítica em tempo real no desktop, com infraestrutura otimizada para custo zero de manutenção inicial.

---

## 2. Perfis de Acesso e Segurança (RBAC)
O controle de acesso é estruturado nativamente no banco de dados. O sistema identifica o usuário via Google OAuth e aplica as restrições baseadas na tabela de perfis institucionais:

* **Agentes Educacionais:** Perfil operacional mobile. Visualizam e inserem dados apenas relacionados ao seu próprio usuário e escolas vinculadas.
* **Gerentes de Polo / Coordenação de Área:** Visão gerencial intermediária. Acesso aos dados e painéis gerenciais restritos às escolas de sua jurisdição geográfica.
* **Coordenação de Dados / Coordenação Geral:** Acesso irrestrito (leitura/atualização) ao painel global, visualização do mapa de calor de toda a cidade e métricas de todos os polos.

---

## 3. Arquitetura Tecnológica e UX/UI
* **Front-end & Interface:** Next.js (React) com Tailwind CSS.
* **Identidade Visual:** Design limpo de alto contraste, utilizando primordialmente Branco (fundo) e Vermelho (destaques, cabeçalhos, botões de ação principal).
* **Back-end & Banco de Dados:** Supabase (PostgreSQL) com políticas estritas de Row-Level Security (RLS).
* **Tratamento de Dados:** Bibliotecas `shadcn/ui` (interface), `Tremor` (gráficos) e `TanStack Table` (tabelas de dados).
* **Exportação:** Módulo `@react-pdf/renderer` para geração de relatórios oficiais em formato A4, com cabeçalho institucional e formatação amigável para impressão em preto e branco.

---

## 4. Módulos Operacionais e Funcionalidades

### 4.1. Módulo de Check-in (Visita Simplificada)
* O check-in é realizado através de um botão simples na interface principal, sem obrigatoriedade de bloqueio de uso do sistema.
* Não haverá uso de infraestrutura física nas escolas (como QR Codes impressos).
* A validação ocorre de forma transparente: ao clicar, o PWA solicita a localização via HTML5 Geolocation API e cruza a coordenada com o endereço da escola em segundo plano, registrando o horário seguro do servidor.

### 4.2. Módulo de Ações Diárias
* Interface otimizada para toques rápidos em telas de celular.
* Permite o registro quantitativo das rotinas pedagógicas executadas (ex: oficinas, acompanhamentos) e o impacto direto (número de alunos atendidos) através de botões de incremento numérico `[+]` / `[-]`.

### 4.3. Central de Intercorrências
* Mapeamento focado na rápida identificação e solução de gargalos estruturais e pedagógicos.
* Categorização visual de urgência através de "semáforo": Baixa (🟢), Média (🟡) e Alta (🔴).
* A classificação de urgência serve como gatilho automático de envio de dados para o mapa de calor da gestão.

### 4.4. Contingência Offline (Service Workers)
* Se o agente registrar uma intercorrência ou ação em uma área da escola sem sinal 4G/Wi-Fi, o sistema salva o pacote de dados localmente (IndexedDB).
* A sincronização com o banco de dados ocorre silenciosamente assim que o sistema operacional do celular detecta o retorno da conexão à internet.

---

## 5. Diretrizes de Comunicação e Restrições de Domínio
Para alinhar a ferramenta ao caráter construtivo das políticas educacionais, o vocabulário da aplicação (incluindo variáveis de código, opções de formulário e textos na interface) deve seguir rigorosamente o padrão abaixo:

* 🚫 **Evitar termos punitivos ou negativos:** É estritamente proibido o uso das palavras `"evasão"` e `"defasagem"` no sistema.
* ✅ **Substituições obrigatórias:**
  * Utilizar **`"Frequência Irregular"`** (em vez de evasão).
  * Utilizar **`"Desafios de Aprendizagem"`** (em vez de defasagem).
