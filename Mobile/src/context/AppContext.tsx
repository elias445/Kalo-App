import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ALIMENTOS, calcularKcal } from '../data/alimentos';
import { PLANO_PADRAO, DiaTreino, Exercicio } from '../data/treino';
import { calcularMetas, Metas } from '../utils/metas';
import { AMIGOS_INICIAIS, DESAFIO_INICIAL, Amigo, Desafio } from '../data/comunidade';

export type Perfil = { nome: string; sexo: string; idade: string; altura: string; objetivo: string };
export type RegistroPeso = { value: number; label: string };
export type ItemRefeicao = { id: number; nome: string; gramas: number; kcal: number };

export const REFEICOES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];

type AppState = {
  perfil: Perfil;
  atualizarPerfil: (dados: Partial<Perfil>) => void;
  pesos: RegistroPeso[];
  pesoAtual: number;
  registrarPeso: (valor: number) => void;
  metas: Metas;
  refeicoes: Record<string, ItemRefeicao[]>;
  adicionarAlimento: (refeicao: string, nome: string, gramas: number) => void;
  removerAlimento: (refeicao: string, id: number) => void;
  totalConsumido: number;
  plano: Record<string, DiaTreino>;
  salvarExercicio: (dia: string, exercicio: Omit<Exercicio, 'id'> & { id?: number }) => void;
  removerExercicio: (dia: string, id: number) => void;
  amigos: Amigo[];
  adicionarAmigo: (nome: string, usuario: string) => void;
  desafio: Desafio;
  criarDesafio: (nome: string, duracao: number, participantes: string[]) => void;
};

const AppContext = createContext<AppState | null>(null);

const rotuloHoje = () => {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil>({
    nome: 'João Elias',
    sexo: 'Masculino',
    idade: '24',
    altura: '178',
    objetivo: 'Hipertrofia e Ganho de Massa',
  });

  const [pesos, setPesos] = useState<RegistroPeso[]>([
    { value: 80, label: '01/07' },
    { value: 75.5, label: '01/08' },
    { value: 70.5, label: '01/09' },
    { value: 67, label: '01/10' },
    { value: 64.5, label: '15/11' },
  ]);

  const [refeicoes, setRefeicoes] = useState<Record<string, ItemRefeicao[]>>({
    'Café da manhã': [
      { id: 1, nome: 'Pão francês', gramas: 50, kcal: 150 },
      { id: 2, nome: 'Ovos mexidos', gramas: 100, kcal: 150 },
      { id: 3, nome: 'Café puro', gramas: 200, kcal: 50 },
    ],
    'Lanche da manhã': [],
    'Almoço': [
      { id: 4, nome: 'Arroz', gramas: 150, kcal: 195 },
      { id: 5, nome: 'Feijão', gramas: 100, kcal: 75 },
      { id: 6, nome: 'Frango grelhado', gramas: 100, kcal: 165 },
      { id: 7, nome: 'Salada', gramas: 100, kcal: 115 },
    ],
    'Lanche da tarde': [],
    'Jantar': [
      { id: 8, nome: 'Inhame', gramas: 200, kcal: 230 },
      { id: 9, nome: 'Charque', gramas: 100, kcal: 220 },
    ],
    'Ceia': [],
  });

  const [plano, setPlano] = useState<Record<string, DiaTreino>>(PLANO_PADRAO);
  const [amigos, setAmigos] = useState<Amigo[]>(AMIGOS_INICIAIS);
  const [desafio, setDesafio] = useState<Desafio>(DESAFIO_INICIAL);

  const pesoAtual = pesos[pesos.length - 1].value;

  const metas = useMemo(
    () =>
      calcularMetas({
        peso: pesoAtual,
        altura: Number(perfil.altura),
        idade: Number(perfil.idade),
        sexo: perfil.sexo,
        objetivo: perfil.objetivo,
      }),
    [pesoAtual, perfil]
  );

  const totalConsumido = Object.values(refeicoes).flat().reduce((soma, item) => soma + item.kcal, 0);

  const atualizarPerfil = useCallback((dados: Partial<Perfil>) => setPerfil((atual) => ({ ...atual, ...dados })), []);

  const registrarPeso = useCallback((valor: number) => {
    setPesos((atual) => [...atual, { value: valor, label: rotuloHoje() }]);
  }, []);

  const adicionarAlimento = useCallback((refeicao: string, nome: string, gramas: number) => {
    const alimento = ALIMENTOS.find((a) => a.nome === nome);
    const kcal = calcularKcal(alimento?.kcal100 ?? 100, gramas);
    setRefeicoes((atual) => ({
      ...atual,
      [refeicao]: [...(atual[refeicao] ?? []), { id: Date.now() + Math.random(), nome, gramas, kcal }],
    }));
  }, []);

  const removerAlimento = useCallback((refeicao: string, id: number) => {
    setRefeicoes((atual) => ({ ...atual, [refeicao]: (atual[refeicao] ?? []).filter((item) => item.id !== id) }));
  }, []);

  const salvarExercicio = useCallback((dia: string, exercicio: Omit<Exercicio, 'id'> & { id?: number }) => {
    setPlano((atual) => {
      const lista = atual[dia].exercicios;
      const novo = { ...exercicio, id: exercicio.id ?? Date.now() };
      const exercicios = lista.some((e) => e.id === novo.id)
        ? lista.map((e) => (e.id === novo.id ? novo : e))
        : [...lista, novo];
      return { ...atual, [dia]: { ...atual[dia], exercicios } };
    });
  }, []);

  const removerExercicio = useCallback((dia: string, id: number) => {
    setPlano((atual) => ({
      ...atual,
      [dia]: { ...atual[dia], exercicios: atual[dia].exercicios.filter((e) => e.id !== id) },
    }));
  }, []);

  // Convite enviado: o amigo fica pendente até aceitar (no protótipo não há aceite)
  const adicionarAmigo = useCallback((nome: string, usuario: string) => {
    setAmigos((atual) =>
      atual.some((a) => a.usuario === usuario)
        ? atual
        : [...atual, { id: `${usuario}-${Date.now()}`, nome, usuario, pontos: 0, treinos: 0, sequencia: 0, status: 'pendente' }]
    );
  }, []);

  const criarDesafio = useCallback((nome: string, duracao: number, participantes: string[]) => {
    setDesafio({ nome, duracao, diaAtual: 1, participantes });
  }, []);

  const valor = useMemo(
    () => ({
      perfil, atualizarPerfil, pesos, pesoAtual, registrarPeso, metas,
      refeicoes, adicionarAlimento, removerAlimento, totalConsumido,
      plano, salvarExercicio, removerExercicio,
      amigos, adicionarAmigo, desafio, criarDesafio,
    }),
    [perfil, atualizarPerfil, pesos, pesoAtual, registrarPeso, metas, refeicoes, adicionarAlimento, removerAlimento, totalConsumido, plano, salvarExercicio, removerExercicio, amigos, adicionarAmigo, desafio, criarDesafio]
  );

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}
