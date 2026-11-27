// Opções de sexo biológico
export const SEXOS = ['Masculino', 'Feminino', 'Outro'];

// Níveis de experiência em treino
export const NIVEIS = ['Iniciante', 'Intermediário', 'Avançado'];

// Dias da semana que o usuário pode marcar para treinar (começando na segunda)
export const DIAS_TREINO = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

// Dias usados quando só se sabe quantos dias o usuário treina
export const diasPadrao = (quantidade: number) =>
  ({ 2: ['Seg', 'Qui'], 3: ['Seg', 'Qua', 'Sex'], 4: ['Seg', 'Ter', 'Qui', 'Sex'], 5: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'], 6: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] } as Record<number, string[]>)[quantidade];

// Objetivos e o ajuste diário de calorias de cada um
export const OBJETIVOS = [
  { nome: 'Emagrecimento', ajuste: -500 },
  { nome: 'Hipertrofia e Ganho de Massa', ajuste: 300 },
  { nome: 'Definição Muscular', ajuste: -250 },
  { nome: 'Manutenção e Saúde', ajuste: 0 },
  { nome: 'Performance Esportiva', ajuste: 200 },
  { nome: 'Bem-estar e Saúde Mental', ajuste: 0 },
];
