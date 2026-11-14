import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { apiFetch } from '../services/api';
import { DiaTreino, ExercicioCatalogo, Frequencia, TreinoApi, dataLocal, montarPlano, planoVazio } from '../data/treino';
import { calcularMetas, Metas } from '../utils/metas';
import { diasPadrao } from '../data/perfil';
import { AMIZADES_VAZIAS, DESAFIOS_VAZIOS, Amizades, Atividade, Desafios, LinhaRanking } from '../data/comunidade';

// Dados do perfil do usuário
export type Perfil = { nome: string; sexo: string; idade: string; altura: string; objetivo: string; nivel: string; diasSemana: string[] };
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
  salvarExercicio: (dia: string, exercicio: ExercicioCatalogo, substituirId?: string) => Promise<boolean>;
  removerExercicio: (id: string) => Promise<boolean>;
  gerarPlano: (substituir?: boolean) => Promise<boolean>;
  recarregarPlano: () => Promise<void>;
  frequencia: Frequencia | null;
  carregarFrequencia: () => Promise<void>;
  registrarTreino: (exerciciosConcluidos: number) => Promise<{ ok: boolean; erro?: string }>;
  amizades: Amizades;
  desafios: Desafios;
  feed: Atividade[];
  carregarComunidade: () => Promise<void>;
  convidarAmigo: (dados: { usuario?: string; codigo?: string }) => Promise<Resultado>;
  responderConviteAmizade: (amizadeId: string, aceitar: boolean) => Promise<boolean>;
  removerAmizade: (amizadeId: string) => Promise<boolean>;
  criarDesafio: (nome: string, duracao: number, convidados: string[]) => Promise<Resultado>;
  responderConviteDesafio: (desafioId: string, aceitar: boolean) => Promise<boolean>;
  carregarRanking: (desafioId: string) => Promise<LinhaRanking[] | null>;
  curtirAtividade: (atividadeId: string) => Promise<void>;
};

// Resultado de uma ação no servidor: deu certo ou a mensagem de erro que ele devolveu
export type Resultado = { ok: boolean; erro?: string };

// Pega a mensagem de erro que o servidor devolveu (o detail pode vir como texto ou como lista de validações)
const mensagemDeErro = (resposta: any): string | undefined => {
  if (typeof resposta?.detail === 'string') return resposta.detail;
  if (Array.isArray(resposta?.detail) && resposta.detail[0]?.msg) return String(resposta.detail[0].msg).replace(/^Value error, /, '');
  return undefined;
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
    nivel: 'Iniciante',
    diasSemana: ['Seg', 'Ter', 'Qui', 'Sex'],
  });

  // Histórico de peso (exemplo até carregar o do servidor)
  const [pesos, setPesos] = useState<RegistroPeso[]>([
    { value: 80, label: '01/07' },
    { value: 75.5, label: '01/08' },
    { value: 70.5, label: '01/09' },
    { value: 67, label: '01/10' },
    { value: 64.5, label: '15/11' },
  ]);

  // Plano de treino (vem do servidor)
  const [plano, setPlano] = useState<Record<string, DiaTreino>>(planoVazio());
  // Frequência de treino do mês (vem do servidor)
  const [frequencia, setFrequencia] = useState<Frequencia | null>(null);
  // Comunidade (vem do servidor)
  const [amizades, setAmizades] = useState<Amizades>(AMIZADES_VAZIAS);
  const [desafios, setDesafios] = useState<Desafios>(DESAFIOS_VAZIOS);
  const [feed, setFeed] = useState<Atividade[]>([]);

  // Busca no servidor amigos, convites, desafios e o feed (cada parte falha sozinha, sem derrubar as outras)
  const carregarComunidade = useCallback(async () => {
    const hoje = dataLocal();
    const [dadosAmigos, dadosDesafios, dadosFeed] = await Promise.all([
      apiFetch(`/amigos/?hoje=${hoje}`).catch(() => null),
      apiFetch(`/desafios/?hoje=${hoje}`).catch(() => null),
      apiFetch('/feed/').catch(() => null),
    ]);
    if (dadosAmigos && Array.isArray(dadosAmigos.amigos)) setAmizades(dadosAmigos as Amizades);
    if (dadosDesafios && Array.isArray(dadosDesafios.ativos)) setDesafios(dadosDesafios as Desafios);
    if (Array.isArray(dadosFeed)) setFeed(dadosFeed as Atividade[]);
  }, []);


  // Busca o plano no servidor; no início da sessão, se o usuário ainda não tem plano, o servidor gera o padrão
  const carregarPlano = useCallback(async (gerarSeVazio = false) => {
    try {
      let itens = await apiFetch('/treinos/');
      if (gerarSeVazio && Array.isArray(itens) && itens.length === 0) {
        itens = await apiFetch('/treinos/gerar', { method: 'POST' });
      }
      if (Array.isArray(itens)) setPlano(montarPlano(itens as TreinoApi[]));
    } catch (erro) {
      console.error('Erro ao carregar o plano de treino:', erro);
    }
  }, []);

  // Busca no servidor a frequência de treino do mês atual (calendário, consistência e sequência)
  const carregarFrequencia = useCallback(async () => {
    try {
      const hoje = dataLocal();
      const dados = await apiFetch(`/treinos/frequencia?mes=${hoje.slice(0, 7)}&hoje=${hoje}`);
      if (dados && Array.isArray(dados.dias_treinados)) setFrequencia(dados as Frequencia);
    } catch (erro) {
      console.error('Erro ao carregar a frequência de treino:', erro);
    }
  }, []);

  // Ao abrir o app, restaura a sessão salva no celular
  useEffect(() => {
    async function carregarSessao() {
      const tokenSalvo = await AsyncStorage.getItem('@kalo_token');
      const idSalvo = await AsyncStorage.getItem('@kalo_id');
      const perfilSalvo = await AsyncStorage.getItem('@kalo_perfil');

      if (tokenSalvo && idSalvo && perfilSalvo) {
        setUsuarioId(idSalvo);
        setPerfil((atual) => ({ ...atual, ...JSON.parse(perfilSalvo) }));
        carregarPlano(true);
        carregarFrequencia();
        carregarComunidade();
      }
    }
    carregarSessao();
  }, [carregarPlano, carregarFrequencia, carregarComunidade]);

  
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
      nivel: usuario.nivel_experiencia || perfil.nivel,
      diasSemana: usuario.dias_preferidos ?? diasPadrao(usuario.dias_treino) ?? perfil.diasSemana,
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

    // Quem ainda não fez o onboarding recebe o plano depois, já com nível e dias escolhidos
    await carregarPlano(!!usuario.onboarding_completo);
    await carregarFrequencia();
    await carregarComunidade();
  };

  // Apaga a sessão do estado e do celular
  const encerrarSessao = async () => {
    setUsuarioId(null);
    setAmizades(AMIZADES_VAZIAS);
    setDesafios(DESAFIOS_VAZIOS);
    setFeed([]);
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
  // Adiciona o exercício ao dia (ou troca o exercício informado) no servidor e recarrega o plano
  const salvarExercicio = useCallback(async (dia: string, exercicio: ExercicioCatalogo, substituirId?: string) => {
    try {
      const resposta = substituirId
        ? await apiFetch(`/treinos/${substituirId}`, { method: 'PUT', body: JSON.stringify({ exercicio_id: exercicio.id }) })
        : await apiFetch('/treinos/', { method: 'POST', body: JSON.stringify({ dia_semana: dia, exercicio_id: exercicio.id }) });
      if (!resposta?.id) return false;
      await carregarPlano();
      return true;
    } catch (erro) {
      console.error('Erro ao salvar o exercício:', erro);
      return false;
    }
  }, [carregarPlano]);
  // Busca de novo o plano salvo no servidor (usado depois de refazer o plano pelo perfil)
  const recarregarPlano = useCallback(() => carregarPlano(false), [carregarPlano]);
  // Gera o plano no servidor pelo objetivo, nível e dias por semana do usuário
  const gerarPlano = useCallback(async (substituir = false) => {
    try {
      const itens = await apiFetch(`/treinos/gerar?substituir=${substituir}`, { method: 'POST' });
      if (!Array.isArray(itens)) return false;
      setPlano(montarPlano(itens as TreinoApi[]));
      return true;
    } catch (erro) {
      console.error('Erro ao gerar o plano de treino:', erro);
      return false;
    }
  }, []);
  // Registra o treino de hoje como concluído no servidor e atualiza a frequência
  const registrarTreino = useCallback(async (exerciciosConcluidos: number) => {
    try {
      const resposta = await apiFetch('/treinos/concluir', {
        method: 'POST',
        body: JSON.stringify({ data_treino: dataLocal(), exercicios_concluidos: exerciciosConcluidos }),
      });
      if (!resposta?.id) return { ok: false, erro: typeof resposta?.detail === 'string' ? resposta.detail : undefined };
      await carregarFrequencia();
      return { ok: true };
    } catch (erro) {
      console.error('Erro ao registrar o treino:', erro);
      return { ok: false };
    }
  }, [carregarFrequencia]);
  // Remove o exercício do plano no servidor e recarrega o plano
  const removerExercicio = useCallback(async (id: string) => {
    try {
      const resposta = await apiFetch(`/treinos/${id}`, { method: 'DELETE' });
      if (!resposta?.status) return false;
      await carregarPlano();
      return true;
    } catch (erro) {
      console.error('Erro ao remover o exercício:', erro);
      return false;
    }
  }, [carregarPlano]);
  // Convida alguém por @usuário ou código; se a pessoa já tinha convidado, vira amizade na hora
  const convidarAmigo = useCallback(async (dados: { usuario?: string; codigo?: string }): Promise<Resultado> => {
    try {
      const resposta = await apiFetch('/amigos/convidar', { method: 'POST', body: JSON.stringify(dados) });
      if (!resposta?.id) return { ok: false, erro: mensagemDeErro(resposta) };
      await carregarComunidade();
      return { ok: true };
    } catch (erro) {
      console.error('Erro ao convidar amigo:', erro);
      return { ok: false };
    }
  }, [carregarComunidade]);
  // Aceita ou recusa um convite de amizade recebido
  const responderConviteAmizade = useCallback(async (amizadeId: string, aceitar: boolean) => {
    try {
      const resposta = await apiFetch(`/amigos/${amizadeId}/${aceitar ? 'aceitar' : 'recusar'}`, { method: 'POST' });
      if (!resposta?.status) return false;
      await carregarComunidade();
      return true;
    } catch (erro) {
      console.error('Erro ao responder o convite:', erro);
      return false;
    }
  }, [carregarComunidade]);
  // Desfaz a amizade ou cancela um convite enviado
  const removerAmizade = useCallback(async (amizadeId: string) => {
    try {
      const resposta = await apiFetch(`/amigos/${amizadeId}`, { method: 'DELETE' });
      if (!resposta?.status) return false;
      await carregarComunidade();
      return true;
    } catch (erro) {
      console.error('Erro ao remover a amizade:', erro);
      return false;
    }
  }, [carregarComunidade]);
  // Cria o desafio (começa hoje) e convida os amigos escolhidos
  const criarDesafio = useCallback(async (nome: string, duracao: number, convidados: string[]): Promise<Resultado> => {
    try {
      const resposta = await apiFetch('/desafios/', {
        method: 'POST',
        body: JSON.stringify({ nome, duracao_dias: duracao, convidados, hoje: dataLocal() }),
      });
      if (!resposta?.id) return { ok: false, erro: mensagemDeErro(resposta) };
      await carregarComunidade();
      return { ok: true };
    } catch (erro) {
      console.error('Erro ao criar o desafio:', erro);
      return { ok: false };
    }
  }, [carregarComunidade]);
  // Aceita ou recusa o convite de um desafio
  const responderConviteDesafio = useCallback(async (desafioId: string, aceitar: boolean) => {
    try {
      const resposta = await apiFetch(`/desafios/${desafioId}/${aceitar ? 'aceitar' : 'recusar'}`, { method: 'POST' });
      if (!resposta?.status) return false;
      await carregarComunidade();
      return true;
    } catch (erro) {
      console.error('Erro ao responder o convite do desafio:', erro);
      return false;
    }
  }, [carregarComunidade]);
  // Ranking de um desafio (null se não deu para carregar)
  const carregarRanking = useCallback(async (desafioId: string) => {
    try {
      const resposta = await apiFetch(`/desafios/${desafioId}/ranking?hoje=${dataLocal()}`);
      return Array.isArray(resposta?.ranking) ? (resposta.ranking as LinhaRanking[]) : null;
    } catch (erro) {
      console.error('Erro ao carregar o ranking:', erro);
      return null;
    }
  }, []);
  // Curte ou descurte uma atividade: muda na tela na hora e confirma com o servidor
  const curtirAtividade = useCallback(async (atividadeId: string) => {
    const aplicar = (curtiu: boolean, curtidas: number) =>
      setFeed((atual) => atual.map((a) => (a.id === atividadeId ? { ...a, curtiu, curtidas } : a)));
    const item = feed.find((a) => a.id === atividadeId);
    if (!item) return;
    aplicar(!item.curtiu, item.curtidas + (item.curtiu ? -1 : 1));
    try {
      const resposta = await apiFetch(`/feed/${atividadeId}/curtir`, { method: 'POST' });
      if (typeof resposta?.curtidas === 'number') aplicar(resposta.curtiu, resposta.curtidas);
      else aplicar(item.curtiu, item.curtidas);
    } catch (erro) {
      console.error('Erro ao curtir:', erro);
      aplicar(item.curtiu, item.curtidas);
    }
  }, [feed]);

  // Valores entregues a todas as telas
  const valor = useMemo(() => ({
    usuarioId, iniciarSessao, encerrarSessao, perfil, atualizarPerfil, pesos, pesoAtual, registrarPeso, metas, plano, salvarExercicio, removerExercicio, gerarPlano, recarregarPlano, frequencia, carregarFrequencia, registrarTreino,
    amizades, desafios, feed, carregarComunidade, convidarAmigo, responderConviteAmizade, removerAmizade, criarDesafio, responderConviteDesafio, carregarRanking, curtirAtividade,
  }), [usuarioId, perfil, pesos, pesoAtual, metas, plano, amizades, desafios, feed, atualizarPerfil, registrarPeso, salvarExercicio, removerExercicio, gerarPlano, recarregarPlano, frequencia, carregarFrequencia, registrarTreino,
    carregarComunidade, convidarAmigo, responderConviteAmizade, removerAmizade, criarDesafio, responderConviteDesafio, carregarRanking, curtirAtividade]);

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>;
}

// Hook para as telas lerem o estado global
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider');
  return ctx;
}