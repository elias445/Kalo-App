export type Amigo = {
  id: string;
  nome: string;
  usuario: string;
  pontos: number;
  treinos: number;
  sequencia: number;
  status: 'ativo' | 'pendente';
};

export type Desafio = {
  nome: string;
  duracao: number;
  diaAtual: number;
  participantes: string[];
};

export type Atividade = {
  id: string;
  autor: string;
  acao: string;
  detalhe: string;
  tempo: string;
  curtidas: number;
};

// Dados de exemplo até existir backend
export const AMIGOS_INICIAIS: Amigo[] = [
  { id: 'ana', nome: 'Ana Costa', usuario: 'ana.costa', pontos: 1420, treinos: 21, sequencia: 18, status: 'ativo' },
  { id: 'bruno', nome: 'Bruno Lima', usuario: 'bruno.lima', pontos: 1190, treinos: 17, sequencia: 6, status: 'ativo' },
  { id: 'carla', nome: 'Carla Souza', usuario: 'carlinha', pontos: 980, treinos: 15, sequencia: 4, status: 'ativo' },
  { id: 'diego', nome: 'Diego Alves', usuario: 'diegoalves', pontos: 760, treinos: 12, sequencia: 2, status: 'ativo' },
  { id: 'marina', nome: 'Marina Dias', usuario: 'mari.dias', pontos: 640, treinos: 10, sequencia: 0, status: 'ativo' },
  { id: 'felipe', nome: 'Felipe Rocha', usuario: 'felipe.rocha', pontos: 0, treinos: 0, sequencia: 0, status: 'pendente' },
];

export const DESAFIO_INICIAL: Desafio = {
  nome: 'Desafio 30 dias',
  duracao: 30,
  diaAtual: 12,
  participantes: ['ana', 'bruno', 'carla', 'diego', 'marina'],
};

// Estatísticas do próprio usuário no desafio
export const EU = { id: 'eu', pontos: 1240, treinos: 18, sequencia: 13 };

export const SUGESTOES = [
  { nome: 'Lucas Martins', usuario: 'lucasm' },
  { nome: 'Julia Ferreira', usuario: 'ju.ferreira' },
  { nome: 'Rafael Nunes', usuario: 'rafaelnunes' },
];

export const ATIVIDADES: Atividade[] = [
  { id: '1', autor: 'Ana Costa', acao: 'concluiu o treino', detalhe: 'Pernas  •  45 min', tempo: 'há 20 min', curtidas: 6 },
  { id: '2', autor: 'Bruno Lima', acao: 'bateu a meta de proteína', detalhe: '152 g de 150 g', tempo: 'há 1 h', curtidas: 3 },
  { id: '3', autor: 'Carla Souza', acao: 'chegou a 4 dias seguidos', detalhe: 'Sequência de treinos', tempo: 'há 3 h', curtidas: 8 },
  { id: '4', autor: 'Diego Alves', acao: 'concluiu o treino', detalhe: 'Peito & Tríceps  •  38 min', tempo: 'ontem', curtidas: 2 },
  { id: '5', autor: 'Marina Dias', acao: 'registrou o peso', detalhe: '−0,6 kg na semana', tempo: 'ontem', curtidas: 5 },
];

export const REGRAS_PONTOS = [
  { titulo: 'Treino concluído', pontos: '+50' },
  { titulo: 'Meta de calorias cumprida', pontos: '+30' },
  { titulo: 'Sequência de treinos', pontos: '+10 por dia' },
];

export const iniciais = (nome: string) =>
  nome.trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
