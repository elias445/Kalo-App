// Exercício do plano de treino
export type Exercicio = {
  id: string;
  nome: string;
  grupo: string;
  series: number;
  reps: number;
  carga: number;
  exercicioId?: string;
  imagemUrl?: string | null;
  musculos?: string[];
  musculosSecundarios?: string[];
  equipamento?: string[];
  descricao?: string | null;
  idioma?: string;
};
// Treino de um dia da semana
export type DiaTreino = { titulo: string; exercicios: Exercicio[] };
// Exercício do catálogo (wger) que pode entrar no plano
export type ExercicioCatalogo = {
  id: string;
  nome: string;
  grupo: string;
  musculos: string[];
  musculosSecundarios: string[];
  equipamento: string[];
  imagemUrl: string | null;
  descricao: string | null;
  idioma: string;
};
// Item do plano como o servidor devolve (GET /treinos/)
export type TreinoApi = {
  id: string;
  dia_semana: string;
  ordem: number;
  series_planejadas: number;
  repeticoes: number;
  carga_kg: number;
  grupo_muscular: string;
  nome_exercicio: string;
  exercicio: {
    id: string;
    idioma: string;
    musculos: string[];
    musculos_secundarios: string[];
    equipamento: string[];
    descricao: string | null;
    imagem_url: string | null;
  } | null;
};

// Frequência de treino do mês como o servidor devolve (GET /treinos/frequencia)
export type Frequencia = {
  mes: string;
  dias_treinados: number[];
  total_treinos_mes: number;
  total_treinos: number;
  planejados_ate_hoje: number;
  consistencia: number;
  sequencia: number;
  treinou_hoje: boolean;
};

// Data de hoje no horário do celular (AAAA-MM-DD)
export const dataLocal = (data = new Date()) =>
  `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;

// Dias da semana (domingo é o índice 0)
export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// Título do dia a partir dos grupos musculares treinados (ou descanso)
export const tituloDoDia = (exercicios: Exercicio[]) => {
  const grupos = Array.from(new Set(exercicios.map((e) => e.grupo))).slice(0, 2);
  return grupos.length ? grupos.join(' & ') : 'Descanso';
};

// Plano com todos os dias de descanso
export const planoVazio = (): Record<string, DiaTreino> =>
  Object.fromEntries(DIAS.map((dia) => [dia, { titulo: 'Descanso', exercicios: [] }]));

// Agrupa os itens devolvidos pelo servidor em um treino por dia da semana
export const montarPlano = (itens: TreinoApi[]): Record<string, DiaTreino> => {
  const plano = planoVazio();
  const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem);
  for (const item of ordenados) {
    if (!plano[item.dia_semana]) continue;
    plano[item.dia_semana].exercicios.push({
      id: item.id,
      nome: item.nome_exercicio,
      grupo: item.grupo_muscular,
      series: item.series_planejadas,
      reps: item.repeticoes,
      carga: item.carga_kg,
      exercicioId: item.exercicio?.id,
      imagemUrl: item.exercicio?.imagem_url ?? null,
      musculos: item.exercicio?.musculos ?? [],
      musculosSecundarios: item.exercicio?.musculos_secundarios ?? [],
      equipamento: item.exercicio?.equipamento ?? [],
      descricao: item.exercicio?.descricao ?? null,
      idioma: item.exercicio?.idioma,
    });
  }
  for (const dia of DIAS) plano[dia].titulo = tituloDoDia(plano[dia].exercicios);
  return plano;
};

// Sigla do dia da semana de hoje
export const diaDeHoje = () => DIAS[new Date().getDay()];

// Estimativa de duração e calorias do treino
export const estimarTreino = (exercicios: Exercicio[]) => {
  const minutos = exercicios.length * 9;
  return { minutos, kcal: minutos * 7 };
};

// Texto da carga (ou peso corporal)
export const formatarCarga = (carga: number) => (carga > 0 ? `${carga} kg` : 'Peso corporal');
