export type Exercicio = { id: number; nome: string; grupo: string; series: number; reps: number; carga: number };
export type DiaTreino = { titulo: string; exercicios: Exercicio[] };
export type ExercicioSugerido = Omit<Exercicio, 'id'>;

export const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const ex = (id: number, nome: string, grupo: string, series: number, reps: number, carga: number): Exercicio => ({ id, nome, grupo, series, reps, carga });
const sug = (grupo: string, nome: string, series: number, reps: number, carga: number): ExercicioSugerido => ({ nome, grupo, series, reps, carga });

export const PLANO_PADRAO: Record<string, DiaTreino> = {
  Dom: { titulo: 'Descanso', exercicios: [] },
  Seg: {
    titulo: 'Peito & Tríceps',
    exercicios: [
      ex(1, 'Supino reto', 'Peito', 3, 12, 80),
      ex(2, 'Supino inclinado', 'Peito', 3, 12, 60),
      ex(3, 'Fly (Crucifixo)', 'Peito', 3, 12, 20),
      ex(4, 'Crossover', 'Peito', 3, 12, 25),
    ],
  },
  Ter: {
    titulo: 'Costas & Bíceps',
    exercicios: [
      ex(5, 'Puxada frontal', 'Costas', 4, 10, 60),
      ex(6, 'Remada curvada', 'Costas', 3, 12, 50),
      ex(7, 'Remada baixa', 'Costas', 3, 12, 45),
      ex(8, 'Rosca direta', 'Bíceps', 3, 12, 25),
      ex(9, 'Rosca martelo', 'Bíceps', 3, 12, 14),
    ],
  },
  Qua: {
    titulo: 'Pernas',
    exercicios: [
      ex(10, 'Agachamento livre', 'Pernas', 4, 10, 70),
      ex(11, 'Leg press', 'Pernas', 4, 12, 160),
      ex(12, 'Cadeira extensora', 'Pernas', 3, 12, 45),
      ex(13, 'Mesa flexora', 'Pernas', 3, 12, 40),
      ex(14, 'Panturrilha em pé', 'Pernas', 4, 15, 50),
    ],
  },
  Qui: {
    titulo: 'Ombros & Abdômen',
    exercicios: [
      ex(15, 'Desenvolvimento', 'Ombros', 3, 12, 30),
      ex(16, 'Elevação lateral', 'Ombros', 3, 15, 10),
      ex(17, 'Elevação frontal', 'Ombros', 3, 12, 10),
      ex(18, 'Abdominal remador', 'Abdômen', 3, 20, 0),
    ],
  },
  Sex: {
    titulo: 'Funcional',
    exercicios: [
      ex(19, 'Burpee', 'Funcional', 3, 15, 0),
      ex(20, 'Agachamento com salto', 'Funcional', 3, 15, 0),
      ex(21, 'Mountain climber', 'Funcional', 3, 30, 0),
      ex(22, 'Prancha dinâmica', 'Funcional', 3, 20, 0),
    ],
  },
  Sáb: { titulo: 'Descanso', exercicios: [] },
};

// Exercícios recomendados, usados para substituir ou adicionar no treino
export const CATALOGO: ExercicioSugerido[] = [
  sug('Peito', 'Supino reto', 3, 12, 80),
  sug('Peito', 'Supino inclinado', 3, 12, 60),
  sug('Peito', 'Supino declinado', 3, 12, 60),
  sug('Peito', 'Fly (Crucifixo)', 3, 12, 20),
  sug('Peito', 'Crossover', 3, 12, 25),
  sug('Peito', 'Peck deck', 3, 12, 40),
  sug('Peito', 'Flexão de braço', 3, 15, 0),

  sug('Tríceps', 'Tríceps pulley', 3, 12, 30),
  sug('Tríceps', 'Tríceps testa', 3, 12, 25),
  sug('Tríceps', 'Tríceps francês', 3, 12, 20),
  sug('Tríceps', 'Mergulho no banco', 3, 12, 0),

  sug('Costas', 'Puxada frontal', 4, 10, 60),
  sug('Costas', 'Remada curvada', 3, 12, 50),
  sug('Costas', 'Remada baixa', 3, 12, 45),
  sug('Costas', 'Remada unilateral', 3, 12, 25),
  sug('Costas', 'Barra fixa', 3, 8, 0),
  sug('Costas', 'Pulldown', 3, 12, 35),

  sug('Bíceps', 'Rosca direta', 3, 12, 25),
  sug('Bíceps', 'Rosca martelo', 3, 12, 14),
  sug('Bíceps', 'Rosca alternada', 3, 12, 12),
  sug('Bíceps', 'Rosca concentrada', 3, 12, 10),
  sug('Bíceps', 'Rosca scott', 3, 12, 20),

  sug('Pernas', 'Agachamento livre', 4, 10, 70),
  sug('Pernas', 'Leg press', 4, 12, 160),
  sug('Pernas', 'Cadeira extensora', 3, 12, 45),
  sug('Pernas', 'Mesa flexora', 3, 12, 40),
  sug('Pernas', 'Afundo', 3, 12, 20),
  sug('Pernas', 'Stiff', 3, 12, 40),
  sug('Pernas', 'Panturrilha em pé', 4, 15, 50),

  sug('Ombros', 'Desenvolvimento', 3, 12, 30),
  sug('Ombros', 'Elevação lateral', 3, 15, 10),
  sug('Ombros', 'Elevação frontal', 3, 12, 10),
  sug('Ombros', 'Remada alta', 3, 12, 25),
  sug('Ombros', 'Crucifixo inverso', 3, 12, 8),
  sug('Ombros', 'Arnold press', 3, 12, 14),

  sug('Abdômen', 'Abdominal remador', 3, 20, 0),
  sug('Abdômen', 'Abdominal infra', 3, 20, 0),
  sug('Abdômen', 'Abdominal bicicleta', 3, 20, 0),
  sug('Abdômen', 'Elevação de pernas', 3, 15, 0),
  sug('Abdômen', 'Prancha', 3, 40, 0),

  sug('Funcional', 'Burpee', 3, 15, 0),
  sug('Funcional', 'Agachamento com salto', 3, 15, 0),
  sug('Funcional', 'Mountain climber', 3, 30, 0),
  sug('Funcional', 'Prancha dinâmica', 3, 20, 0),
  sug('Funcional', 'Polichinelo', 3, 40, 0),
  sug('Funcional', 'Corda naval', 3, 30, 0),
];

export const GRUPOS = Array.from(new Set(CATALOGO.map((e) => e.grupo)));

export const diaDeHoje = () => DIAS[new Date().getDay()];

// Estimativas simples para exibir no resumo do treino
export const estimarTreino = (exercicios: Exercicio[]) => {
  const minutos = exercicios.length * 9;
  return { minutos, kcal: minutos * 7 };
};

export const formatarCarga = (carga: number) => (carga > 0 ? `${carga} kg` : 'Peso corporal');
