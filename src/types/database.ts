export type CargoType = 
  | 'agente' 
  | 'gerente_polo' 
  | 'coordenacao_area' 
  | 'coordenador_dados' 
  | 'coordenacao_geral';

export type UrgenciaType = 'baixa' | 'media' | 'alta';

export type StatusIntercorrenciaType = 'aberto' | 'em_analise' | 'resolvido';

export type CategoriaIntercorrencia = 
  | 'Infraestrutura'
  | 'Frequência Irregular'
  | 'Suporte Familiar'
  | 'Desafios de Aprendizagem';

export interface Profile {
  id: string;
  nome: string;
  email: string;
  cargo: CargoType;
  regiao_atuacao: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface Escola {
  id: string;
  nome: string;
  regiao: string;
  lat_lng_oficial: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visita {
  id: string;
  agente_id: string;
  escola_id: string;
  data_hora_entrada: string;
  lat_lng_agente: string | null;
  created_at: string;
  // Joins
  escola?: Escola;
  agente?: Profile;
}

export interface RegistroDiario {
  id: string;
  agente_id: string;
  escola_id: string;
  tipo_atividade: string;
  alunos_impactados: number;
  created_at: string;
  updated_at: string;
  // Joins
  escola?: Escola;
  agente?: Profile;
}

export interface Intercorrencia {
  id: string;
  agente_id: string;
  escola_id: string;
  categoria: CategoriaIntercorrencia;
  urgencia: UrgenciaType;
  descricao: string;
  status: StatusIntercorrenciaType;
  created_at: string;
  updated_at: string;
  // Joins
  escola?: Escola;
  agente?: Profile;
}
