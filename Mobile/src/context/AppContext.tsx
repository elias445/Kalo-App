import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { apiFetch } from '../services/api';
import { PLANO_PADRAO, DiaTreino, Exercicio } from '../data/treino';
import { calcularMetas, Metas } from '../utils/metas';
import { AMIGOS_INICIAIS, DESAFIO_INICIAL, Amigo, Desafio } from '../data/comunidade';

// Dados do perfil do usuário
export type Perfil = { nome: string; sexo: string; idade: string; altura: string; objetivo: string };
// Um ponto do gráfico de peso
export type RegistroPeso = { value: number; label: string };

// Nomes das refeições do dia
export const REFEICOES = ['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];

// Tudo que o estado global oferece às telas
type AppState = {
  usuarioId: string | null; 
  iniciarSessao: (usuario: any, novoToken: string) => Promise<void>; 
  encerrarSessao: () => Promise<void>; 
  perfil: Perfil;
  atualizarPerfil: (dados: Partial<Perfil>) => void;
  pesos: RegistroPeso[];
  pesoAtual: number;
  registrarPeso: (valor: number) => void;
  metas: Metas;
  plano: Record<string, DiaTreino>;
  salvarExercicio: (dia: string, exercicio: Omit<Exercicio, 'id'> & { id?: number }) => void;
  removerExercicio: (dia: string, id: number) => void;
  amigos: Amigo[];
  adicionarAmigo: (nome: string, usuario: string) => void;
  desafio: Desafio;
  criarDesafio: (nome: string, duracao: number, participantes: string[]) => void;
};

// Contexto global do app
const AppContext = createContext<AppState | null>(null);

// Converte a data do servidor (UTC) para dd/mm no horário local
const rotuloDeData = (iso: string) => {
  const data = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  return `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}`;
};

// Data de hoje no formato dd/mm
const rotuloHoje = () => {
  const hoje = new Date();
  return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}`;
};

// Provedor do estado global: sessão, perfil, peso, treino e comunidade
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<string | null>(null);

  // Perfil (valores iniciais até o login)
  const [perfil, setPerfil] = useState<Perfil>({
    nome: 'Visitante',
    sexo: 'Masculino',
    idade: '24',
    altura: '178',
    objetivo: 'Hipertrofia e Ganho de Massa',
  });

  // Histórico de peso (exemplo até carregar o do servidor)
  const [pesos, setPesos] = useState<RegistroPeso[]>([
    { value: 80, label: '01/07' },
    { value: 75.5, label: '01/08' },
    { value: 70.5, label: '01/09' },
    { value: 67, label: '01/10' },
    { value: 64.5, label: '15/11' },
  ]);

  // Plano de treino (guardado só no app)
  const [plano, setPlano] = useState<Record<string, DiaTreino>>(PLANO_PADRAO);
  // Comunidade (dados de exemplo)
  const [amigos, setAmigos] = useState<Amigo[]>(AMIGOS_INICIAIS);
  const [desafio, setDesafio] = useState<Desafio>(DESAFIO_INICIAL);


  // Ao abrir o app, restaura a sessão salva no celular
  useEffect(() => {
    async function carregarSessao() {
      const tokenSalvo = await AsyncStorage.getItem('@kalo_token');
      const idSalvo = await AsyncStorage.getItem('@kalo_id');
      const perfilSalvo = await AsyncStorage.getItem('@kalo_perfil');

      if (tokenSalvo && idSalvo && perfilSalvo) {
        setUsuarioId(idSalvo);
        setPerfil(JSON.parse(perfilSalvo));
      }
    }
    carregarSessao();
  }, []);

  
  // Guarda token e perfil após login/cadastro e carrega o histórico de peso
  const iniciarSessao = async (usuario: any, novoToken: string) => {
    setUsuarioId(usuario.id);

    const novoPerfil = {
      ...perfil,
      nome: usuario.nome,
      sexo: usuario.sexo ?? perfil.sexo,
      idade: usuario.idade != null ? String(usuario.idade) : perfil.idade,
      altura: usuario.altura != null ? String(usuario.altura) : perfil.altura,
      objetivo: usuario.objetivo || perfil.objetivo,
    };
    setPerfil(novoPerfil);
    if (usuario.peso_atual != null) {
      setPesos([{ value: usuario.peso_atual, label: rotuloHoje() }]);
    }

    await AsyncStorage.setItem('@kalo_token', novoToken);
    await AsyncStorage.setItem('@kalo_id', usuario.id);
    await AsyncStorage.setItem('@kalo_perfil', JSON.stringify(novoPerfil));

    try {
      // Histórico de peso salvo no servidor, usado no gráfico do perfil
      const medidas = await apiFetch(`/medidas/usuario/${usuario.id}`);
      if (Array.isArray(medidas) && medidas.length > 0) {
        setPesos(medidas.map((m: any) => ({ value: m.peso_kg, label: rotuloDeData(m.data_registro) })));
      }
    } catch (erro) {
      console.error('Erro ao carregar o histórico de peso:', erro);
    }
  };

  // Apaga a sessão do estado e do celular
  const encerrarSessao = async () => {
    setUsuarioId(null);
    await AsyncStorage.removeItem('@kalo_token');
    await AsyncStorage.removeItem('@kalo_id');
    await AsyncStorage.removeItem('@kalo_perfil');
  };

  // Último peso registrado
  const pesoAtual = pesos[pesos.length - 1]?.value || 0;

  // Metas recalculadas quando o peso ou o perfil mudam
  const metas = useMemo(() => calcularMetas({
    peso: pesoAtual, altura: Number(perfil.altura), idade: Number(perfil.idade), sexo: perfil.sexo, objetivo: perfil.objetivo,
  }), [pesoAtual, perfil]);

  // Funções que alteram perfil, peso, treino e comunidade
  const atualizarPerfil = useCallback((dados: Partial<Perfil>) => setPerfil((atual) => ({ ...atual, ...dados })), []);
  const registrarPeso = useCallback((valor: number) => setPesos((atual) => [...atual, { value: valor, label: rotuloHoje() }]), []);
  const salvarExercicio = useCallback((dia: string, exercicio: Omit<Exercicio, 'id'> & { id?: number }) => {
    setPlano((atual) => {
      const lista = atual[dia].exercicios;
      const novo = { ...exercicio, id: exercicio.id ?? Date.now() };
      const exercicios = lista.some((e) => e.id === novo.id) ? lista.map((e) => (e.id === novo.id ? novo : e)) : [...lista, novo];
      return { ...atual, [dia]: { ...atual[dia], exercicios } };
    });
  }, []);
  const removerExercicio = useCallback((dia: string, id: number) => setPlano((atual) => ({
    ...atual, [dia]: { ...atual[dia], exercicios: atual[dia].exercicios.filter((e) => e.id !== id) },
  })), []);
  const adicionarAmigo = useCallback((nome: string, usuario: string) => setAmigos((atual) => atual.some((a) => a.usuario === usuario) ? atual : [...atual, { id: `${usuario}-${Date.now()}`, nome, usuario, pontos: 0, treinos: 0, sequencia: 0, status: 'pendente' }]), []);
  const criarDesafio = useCallback((nome: string, duracao: number, participantes: string[]) => setDesafio({ nome, duracao, diaAtual: 1, participantes }), []);

  // Valores entregues a todas as telas
  const valor = useMemo(() => ({
    usuarioId, iniciarSessao, encerrarSessao, perfil, atualizarPerfil, pesos, pesoAtual, registrarPeso, metas, plano, salvarExercicio, removerExercicio, amigos, adicionarAmigo, desafio, criarDesafio,
  }), [usuarioId, perfil, pesos, pesoAtual, metas, plano, amigos, desafio, atualizarPerfil, registrarPeso, salvarExercicio, removerExercicio, adicionarAmigo, criarDesafio]);

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

// Hook para as telas lerem o estado global
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}