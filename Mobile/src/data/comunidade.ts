// Uma pessoa vista pelos amigos (o que o servidor deixa aparecer)
export type Pessoa = {
  id: string;
  nome: string;
  usuario: string;
  objetivo: string | null;
  treinos: number;
  sequencia: number;
  // Usado para aceitar, recusar ou desfazer a amizade
  amizade_id: string;
};

// Amigos, convites recebidos e convites enviados
export type Amizades = {
  // @usuário e código de convite de quem está logado
  eu: { usuario: string; codigo_convite: string } | null;
  amigos: Pessoa[];
  recebidos: Pessoa[];
  enviados: Pessoa[];
};

// Estado inicial, antes de carregar do servidor
export const AMIZADES_VAZIAS: Amizades = { eu: null, amigos: [], recebidos: [], enviados: [] };
export const DESAFIOS_VAZIOS: Desafios = { ativos: [], convites: [] };

// Resultado da busca por @usuário
export type PessoaBusca = { id: string; nome: string; usuario: string };

// Um desafio como o servidor devolve
export type Desafio = {
  id: string;
  nome: string;
  duracao_dias: number;
  data_inicio: string;
  data_fim: string;
  dia_atual: number;
  encerrado: boolean;
  criador_id: string;
  // Só nos desafios em que o usuário já participa
  criador?: string | null;
  participantes?: number;
  minha_posicao?: number | null;
  meus_pontos?: number;
};

// Desafios do usuário e convites que ainda não respondeu
export type Desafios = { ativos: Desafio[]; convites: Desafio[] };

// Uma linha do ranking de um desafio
export type LinhaRanking = {
  id: string;
  nome: string;
  usuario: string;
  objetivo: string | null;
  eu: boolean;
  posicao: number;
  pontos: number;
  treinos: number;
  sequencia: number;
  dias_meta_calorias: number;
  detalhe: { treinos: number; sequencia: number; calorias: number };
};

// Item do feed de atividades
export type Atividade = {
  id: string;
  autor: string;
  usuario: string;
  minha: boolean;
  tipo: string;
  acao: string;
  detalhe: string;
  criado_em: string;
  curtidas: number;
  curtiu: boolean;
};

// Regras de pontuação do desafio (as mesmas do servidor)
export const REGRAS_PONTOS = [
  { titulo: 'Treino concluído', pontos: '+50' },
  { titulo: 'Meta de calorias cumprida', pontos: '+30' },
  { titulo: 'Sequência de treinos', pontos: '+10 por dia' },
];

// Durações disponíveis para um desafio, em dias
export const DURACOES_DESAFIO = [7, 14, 30, 60];

// Iniciais do nome, usadas no avatar
export const iniciais = (nome: string) =>
  nome.trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

// Texto de há quanto tempo algo aconteceu (o servidor manda o horário em UTC)
export const haQuantoTempo = (iso: string) => {
  const minutos = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutos < 1) return 'agora';
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.floor(horas / 24);
  return dias === 1 ? 'ontem' : `há ${dias} dias`;
};
