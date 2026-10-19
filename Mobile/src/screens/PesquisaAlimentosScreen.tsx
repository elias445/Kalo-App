import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import Screen from '../components/Screen';
import AlimentoRow, { useAdicionado } from '../components/AlimentoRow';
import { BackButton, Badge, Chip, MiniTile, SectionLabel } from '../components/UI';
import { ICONES_REFEICAO } from '../components/iconesRefeicao';
import { useApp } from '../context/AppContext';
import { useRefeicoes } from '../context/RefeicoesContext';
import { apiFetch } from '../services/api';
import { carregarRecentes, registrarRecente, salvarRecentes, chaveDoAlimento } from '../services/recentes';
import { AlimentoBusca, calcularKcal } from '../data/alimentos';
import { colors } from '../theme';

// Filtros da busca
type Fonte = 'todos' | 'taco' | 'industrializados';

// Rótulo de cada filtro
const FONTES: { chave: Fonte; rotulo: string }[] = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'taco', rotulo: 'Alimentos' },
  { chave: 'industrializados', rotulo: 'Industrializados' },
];

const chaveDe = chaveDoAlimento;
// Arredonda para 1 casa e usa vírgula
const formatar = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

// Tela de busca de alimentos (TACO e industrializados)
export default function PesquisaAlimentosScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const refeicaoDestino: string = route.params.refeicao;
  const Icone = ICONES_REFEICAO[refeicaoDestino];

  const { adicionarAlimento } = useRefeicoes();
  const { usuarioId } = useApp();

  const [busca, setBusca] = useState('');
  const [fonte, setFonte] = useState<Fonte>('todos');
  const [resultados, setResultados] = useState<AlimentoBusca[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [recentes, setRecentes] = useState<AlimentoBusca[]>([]);
  const [gramas, setGramas] = useState<Record<string, string>>({});
  const [adicionado, marcarAdicionado] = useAdicionado();

  const termo = busca.trim();

  // Carrega os pesquisados recentemente ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      carregarRecentes(usuarioId).then(setRecentes);
    }, [usuarioId])
  );

  // Busca no servidor 400 ms depois de parar de digitar e ignora respostas antigas
  useEffect(() => {
    if (termo.length < 2) {
      setResultados([]);
      setAvisos([]);
      setErro(null);
      setCarregando(false);
      return;
    }

    let cancelado = false;
    setCarregando(true);

    const espera = setTimeout(async () => {
      try {
        const dados = await apiFetch(`/alimentos/buscar?q=${encodeURIComponent(termo)}&fonte=${fonte}&limite=20`);
        if (cancelado) return;
        if (!Array.isArray(dados?.resultados)) throw new Error('Resposta inesperada do servidor');
        setResultados(dados.resultados);
        setAvisos(dados.avisos ?? []);
        setErro(null);
      } catch {
        if (cancelado) return;
        setResultados([]);
        setAvisos([]);
        setErro('Não foi possível buscar agora. Verifique sua conexão e tente de novo.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }, 400);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [termo, fonte]);

  // Adiciona o alimento à refeição com a quantidade digitada
  const adicionar = (alimento: AlimentoBusca) => {
    const chave = chaveDe(alimento);
    const g = Number(String(gramas[chave] ?? '100').replace(',', '.'));
    if (!g) {
      Alert.alert('Quantidade inválida', 'Informe a quantidade em gramas.');
      return;
    }
    adicionarAlimento(refeicaoDestino, alimento, g);
    marcarAdicionado(chave);
    registrarRecente(usuarioId, alimento).then(setRecentes);
  };

  // Monta a linha de um alimento
  const renderLinha = (alimento: AlimentoBusca) => {
    const chave = chaveDe(alimento);
    const g = gramas[chave] ?? '100';
    const origem = alimento.fonte === 'TACO' ? 'TACO' : alimento.categoria ?? 'Industrializado';
    return (
      <AlimentoRow
        key={chave}
        nome={alimento.nome}
        legenda={`${origem}  ·  por 100 g:  P ${formatar(alimento.proteina_100g)}  C ${formatar(alimento.carboidrato_100g)}  G ${formatar(alimento.gordura_100g)}`}
        kcal={calcularKcal(alimento.kcal_100g, Number(g.replace(',', '.')) || 0)}
        gramas={g}
        onGramasChange={(v) => setGramas((atual) => ({ ...atual, [chave]: v }))}
        onAdd={() => adicionar(alimento)}
        onPress={() => navigation.navigate('DetalheAlimento', { alimento, refeicao: refeicaoDestino })}
        adicionado={adicionado === chave}
      />
    );
  };

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge
          tone="cyan"
          label={`Adicionando em ${refeicaoDestino}`}
          icon={Icone ? <Icone color={colors.cyan} size={13} strokeWidth={2.4} /> : undefined}
        />
      </View>

      <Text className="text-white text-3xl font-extrabold mb-5">Buscar alimento</Text>

      <View
        className="flex-row items-center px-4 mb-4"
        style={{ height: 56, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' }}
      >
        <Search color={colors.cyan} size={20} strokeWidth={2.4} style={{ marginRight: 12 }} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Ex.: arroz, frango, achocolatado"
          placeholderTextColor={colors.dim}
          selectionColor={colors.cyan}
          autoCorrect={false}
          className="flex-1 text-white font-bold text-base"
          style={{ height: '100%' }}
        />
        {carregando && <ActivityIndicator color={colors.cyan} />}
      </View>

      <View className="flex-row mb-6" style={{ gap: 8 }}>
        {FONTES.map((f) => (
          <Chip key={f.chave} label={f.rotulo} selected={fonte === f.chave} onPress={() => setFonte(f.chave)} ajustar />
        ))}
      </View>

      {termo.length >= 2 && !erro && (
        <View className="mb-3">
          <SectionLabel tone="muted">{`Resultados (${resultados.length})`}</SectionLabel>
        </View>
      )}

      {termo.length < 2 && recentes.length > 0 && (
        <View className="flex-row justify-between items-center mb-3">
          <SectionLabel tone="muted">Recentes</SectionLabel>
          <TouchableOpacity onPress={() => { setRecentes([]); salvarRecentes(usuarioId, []); }} hitSlop={10}>
            <Text className="text-cyan text-xs font-bold">Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ gap: 10 }}>
        {termo.length < 2 && recentes.map(renderLinha)}
        {resultados.map(renderLinha)}

        {erro && <Text className="text-center mt-4" style={{ color: colors.danger }}>{erro}</Text>}

        {!erro && avisos.map((aviso) => (
          <Text key={aviso} className="text-muted text-xs text-center mt-1">{aviso}</Text>
        ))}

        {!erro && !carregando && termo.length >= 2 && resultados.length === 0 && (
          <View className="items-center mt-6" style={{ gap: 12 }}>
            <MiniTile size={56}>
              <Search color={colors.cyan} size={24} strokeWidth={2} />
            </MiniTile>
            <Text className="text-muted text-center">Nenhum alimento encontrado.</Text>
          </View>
        )}

      </View>

      {resultados.length > 0 && (
        <Text className="text-dim text-[11px] text-center mt-6">
          Fontes: TACO (NEPA/UNICAMP) e Open Food Facts (dados colaborativos, podem conter imprecisões).
        </Text>
      )}
    </Screen>
  );
}
