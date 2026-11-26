import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Alert, ActivityIndicator, TouchableOpacity, FlatList, ScrollView } from 'react-native';
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

// Abas/filtros da tela de pesquisa
type Aba = 'todos' | 'recentes' | 'taco' | 'industrializados';

const ABAS: { chave: Aba; rotulo: string }[] = [
  { chave: 'todos', rotulo: 'Todos' },
  { chave: 'recentes', rotulo: 'Recentes' },
  { chave: 'taco', rotulo: 'Alimentos' },
  { chave: 'industrializados', rotulo: 'Industrializados' },
];

const LIMITE_PAGINA = 20;
const chaveDe = chaveDoAlimento;
// Arredonda para 1 casa e usa vírgula
const formatar = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

// Tela de busca de alimentos (catálogo paginado, recentes e industrializados)
export default function PesquisaAlimentosScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const refeicaoDestino: string = route.params.refeicao;
  const Icone = ICONES_REFEICAO[refeicaoDestino];

  const { adicionarAlimento } = useRefeicoes();
  const { usuarioId } = useApp();

  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<Aba>('todos');
  const [resultados, setResultados] = useState<AlimentoBusca[]>([]);
  const [temMais, setTemMais] = useState(false);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [recentes, setRecentes] = useState<AlimentoBusca[]>([]);
  const [gramas, setGramas] = useState<Record<string, string>>({});
  const [adicionado, marcarAdicionado] = useAdicionado();

  const requisicaoRef = useRef(0);
  const termo = busca.trim();

  // Carrega os pesquisados recentemente ao entrar na tela
  useFocusEffect(
    useCallback(() => {
      carregarRecentes(usuarioId).then(setRecentes);
    }, [usuarioId])
  );

  // Busca uma página no servidor (offset 0 reinicia a lista; >0 acrescenta ao final)
  const carregarPagina = useCallback(
    async (offset: number, acrescentar: boolean) => {
      if (aba === 'recentes') return;
      if (termo.length === 1 || (aba === 'industrializados' && termo.length < 2)) {
        requisicaoRef.current += 1;
        setResultados([]);
        setTemMais(false);
        setAvisos([]);
        setErro(null);
        setCarregando(false);
        setCarregandoMais(false);
        return;
      }

      const idReq = ++requisicaoRef.current;
      if (acrescentar) {
        setCarregandoMais(true);
      } else {
        setCarregando(true);
        setErro(null);
      }

      try {
        const queryTermo = termo ? `&q=${encodeURIComponent(termo)}` : '';
        const dados = await apiFetch(
          `/alimentos/buscar?fonte=${aba}&limite=${LIMITE_PAGINA}&offset=${offset}${queryTermo}`
        );
        if (idReq !== requisicaoRef.current) return;
        if (!Array.isArray(dados?.resultados)) throw new Error('Resposta inesperada do servidor');

        setResultados((atual) => {
          if (!acrescentar) return dados.resultados;
          const vistos = new Set(atual.map(chaveDe));
          const novos = (dados.resultados as AlimentoBusca[]).filter((item) => !vistos.has(chaveDe(item)));
          return [...atual, ...novos];
        });
        setTemMais(Boolean(dados.tem_mais));
        setAvisos(dados.avisos ?? []);
        setErro(null);
      } catch {
        if (idReq !== requisicaoRef.current) return;
        if (!acrescentar) {
          setResultados([]);
          setTemMais(false);
          setAvisos([]);
        }
        setErro('Não foi possível buscar agora. Verifique sua conexão e tente de novo.');
      } finally {
        if (idReq === requisicaoRef.current) {
          setCarregando(false);
          setCarregandoMais(false);
        }
      }
    },
    [aba, termo]
  );

  // Dispara busca imediata ao abrir/trocar aba sem texto, ou com debounce de 400 ms ao digitar
  useEffect(() => {
    if (aba === 'recentes') {
      requisicaoRef.current += 1;
      setCarregando(false);
      setCarregandoMais(false);
      return;
    }

    const atraso = termo.length >= 2 ? 400 : 0;
    const espera = setTimeout(() => {
      carregarPagina(0, false);
    }, atraso);

    return () => clearTimeout(espera);
  }, [aba, termo, carregarPagina]);

  const carregarMais = () => {
    if (aba === 'recentes' || carregando || carregandoMais || !temMais) return;
    carregarPagina(resultados.length, true);
  };

  // Se digitar >= 2 caracteres estando em Recentes, alterna para Todos
  const aoDigitar = (texto: string) => {
    setBusca(texto);
    if (aba === 'recentes' && texto.trim().length >= 2) {
      setAba('todos');
    }
  };

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

  const itensExibidos = aba === 'recentes' ? recentes : resultados;

  const renderVazio = () => {
    if (carregando) return null;
    if (erro) return <Text className="text-center mt-4" style={{ color: colors.danger }}>{erro}</Text>;

    if (aba === 'recentes') {
      return (
        <View className="items-center mt-8" style={{ gap: 12 }}>
          <MiniTile size={56}>
            <Search color={colors.cyan} size={24} strokeWidth={2} />
          </MiniTile>
          <Text className="text-muted text-center">Nenhum alimento adicionado recentemente.</Text>
        </View>
      );
    }

    if (aba === 'industrializados' && termo.length < 2) {
      return (
        <View className="items-center mt-8" style={{ gap: 12 }}>
          <MiniTile size={56}>
            <Search color={colors.cyan} size={24} strokeWidth={2} />
          </MiniTile>
          <Text className="text-muted text-center">Digite pelo menos 2 letras para buscar produtos industrializados.</Text>
        </View>
      );
    }

    if (termo.length === 1) {
      return <Text className="text-muted text-center mt-6">Digite pelo menos 2 caracteres para pesquisar.</Text>;
    }

    return (
      <View className="items-center mt-8" style={{ gap: 12 }}>
        <MiniTile size={56}>
          <Search color={colors.cyan} size={24} strokeWidth={2} />
        </MiniTile>
        <Text className="text-muted text-center">Nenhum alimento encontrado.</Text>
      </View>
    );
  };

  const renderRodape = () => (
    <View className="mt-4">
      {carregandoMais && <ActivityIndicator color={colors.cyan} style={{ marginVertical: 12 }} />}
      {!erro && avisos.map((aviso) => (
        <Text key={aviso} className="text-muted text-xs text-center mt-1">{aviso}</Text>
      ))}
      {aba !== 'recentes' && resultados.length > 0 && (
        <Text className="text-dim text-[11px] text-center mt-4">
          Fontes: TACO (NEPA/UNICAMP) e Open Food Facts (dados colaborativos, podem conter imprecisões).
        </Text>
      )}
    </View>
  );

  return (
    <Screen scroll={false}>
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
          onChangeText={aoDigitar}
          placeholder="Ex.: arroz, frango, achocolatado"
          placeholderTextColor={colors.dim}
          selectionColor={colors.cyan}
          autoCorrect={false}
          className="flex-1 text-white font-bold text-base"
          style={{ height: '100%' }}
        />
        {carregando && <ActivityIndicator color={colors.cyan} />}
      </View>

      <View className="mb-5">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {ABAS.map((item) => (
            <Chip key={item.chave} label={item.rotulo} selected={aba === item.chave} onPress={() => setAba(item.chave)} ajustar />
          ))}
        </ScrollView>
      </View>

      {aba === 'recentes' ? (
        recentes.length > 0 && (
          <View className="flex-row justify-between items-center mb-3">
            <SectionLabel tone="muted">Recentes</SectionLabel>
            <TouchableOpacity onPress={() => { setRecentes([]); salvarRecentes(usuarioId, []); }} hitSlop={10}>
              <Text className="text-cyan text-xs font-bold">Limpar</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        !erro && (resultados.length > 0 || termo.length >= 2) && (
          <View className="mb-3">
            <SectionLabel tone="muted">
              {termo.length >= 2 ? `Resultados (${resultados.length}${temMais ? '+' : ''})` : 'Alimentos cadastrados'}
            </SectionLabel>
          </View>
        )
      )}

      <FlatList
        data={itensExibidos}
        keyExtractor={chaveDe}
        renderItem={({ item }) => renderLinha(item)}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onEndReached={carregarMais}
        onEndReachedThreshold={0.4}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={7}
        ListEmptyComponent={renderVazio}
        ListFooterComponent={renderRodape}
      />
    </Screen>
  );
}
