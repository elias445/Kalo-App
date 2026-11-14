import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Trash2, Dumbbell, ArrowDown, Search, Info } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import HeroCard from '../components/HeroCard';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { BackButton, Chip, IconButton, IconTile, MiniTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { Exercicio, ExercicioCatalogo } from '../data/treino';
import { colors } from '../theme';

// Tela para substituir ou adicionar um exercício do catálogo
export default function EditarExercicioScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { plano, salvarExercicio, removerExercicio } = useApp();

  const dia: string = route.params.dia;
  const atual: Exercicio | undefined = route.params.exercicio;
  // Com um exercício recebido é substituição; sem ele, é adição
  const substituindo = !!atual;

  const noDia = plano[dia].exercicios;
  // Substituir: só o mesmo grupo muscular. Adicionar: começa no grupo já treinado no dia
  const [grupo, setGrupo] = useState<string>(atual ? atual.grupo : noDia[0]?.grupo ?? '');
  const [grupos, setGrupos] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<ExercicioCatalogo[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<ExercicioCatalogo | null>(null);
  const [salvando, setSalvando] = useState(false);

  const termo = busca.trim();

  // Busca no catálogo do servidor 350 ms depois de parar de digitar e ignora respostas antigas
  useEffect(() => {
    let cancelado = false;
    setCarregando(true);

    const espera = setTimeout(async () => {
      try {
        const parametros = `limite=30&grupo=${encodeURIComponent(grupo)}&q=${encodeURIComponent(termo)}`;
        const dados = await apiFetch(`/exercicios/buscar?${parametros}`);
        if (cancelado) return;
        if (!Array.isArray(dados?.resultados)) throw new Error('Resposta inesperada do servidor');
        setResultados(
          dados.resultados.map((r: any) => ({
            id: r.id,
            nome: r.nome,
            grupo: r.grupo,
            musculos: r.musculos ?? [],
            musculosSecundarios: r.musculos_secundarios ?? [],
            equipamento: r.equipamento ?? [],
            imagemUrl: r.imagem_url ?? null,
            descricao: r.descricao ?? null,
            idioma: r.idioma ?? 'pt',
          }))
        );
        setGrupos(dados.grupos ?? []);
        setErro(null);
      } catch {
        if (cancelado) return;
        setResultados([]);
        setErro('Não foi possível buscar agora. Verifique sua conexão e tente de novo.');
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }, 350);

    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [grupo, termo]);

  // Esconde os exercícios que já estão no dia
  const idsNoDia = noDia.map((e) => e.exercicioId);
  const disponiveis = resultados.filter((r) => !idsNoDia.includes(r.id));

  // Salva o exercício escolhido no plano
  const confirmar = async () => {
    if (!escolhido || salvando) return;
    setSalvando(true);
    const salvou = await salvarExercicio(dia, escolhido, atual?.id);
    setSalvando(false);
    if (salvou) {
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Não foi possível salvar o exercício. Verifique a conexão e tente de novo.');
    }
  };

  // Pede confirmação e remove o exercício
  const excluir = () => {
    Alert.alert('Remover exercício', `Remover "${atual?.nome}" do treino?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const removeu = await removerExercicio(atual!.id);
          if (removeu) {
            navigation.goBack();
          } else {
            Alert.alert('Erro', 'Não foi possível remover o exercício. Tente de novo.');
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <SectionLabel dot>{dia}</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2 mb-6">
        {substituindo ? 'Substituir exercício' : 'Adicionar exercício'}
      </Text>

      {substituindo && (
        <>
          <HeroCard padding={18}>
            <View className="flex-row items-center" style={{ gap: 14 }}>
              <IconTile size={52}>
                <Dumbbell color={colors.cyan} size={24} strokeWidth={2} />
              </IconTile>
              <View className="flex-1">
                <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.6 }}>EXERCÍCIO ATUAL</Text>
                <Text className="text-white font-extrabold text-xl mt-1" numberOfLines={2}>{atual!.nome}</Text>
                <Text className="text-muted text-sm font-bold mt-1">{atual!.series} × {atual!.reps}  •  {atual!.grupo}</Text>
              </View>
            </View>
          </HeroCard>
          <View className="items-center my-3">
            <View
              className="items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' }}
            >
              <ArrowDown color={colors.cyan} size={16} strokeWidth={2.6} />
            </View>
          </View>
        </>
      )}

      <View className="mb-4">
        <Field
          icon={Search}
          placeholder="Buscar exercício (ex.: supino)"
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
          right={carregando ? <ActivityIndicator color={colors.cyan} /> : undefined}
        />
      </View>

      {!substituindo && (
        <View className="flex-row flex-wrap mb-5" style={{ gap: 8 }}>
          {['', ...grupos].map((g) => (
            <Chip key={g || 'todos'} label={g || 'Todos'} selected={grupo === g} onPress={() => setGrupo(g)} ajustar />
          ))}
        </View>
      )}

      <View className="mb-3">
        <SectionLabel tone="muted">{substituindo ? `Recomendados para ${atual!.grupo}` : grupo || 'Todos os grupos'}</SectionLabel>
      </View>

      {erro && <Text className="text-center my-6" style={{ color: colors.danger }}>{erro}</Text>}
      {!erro && !carregando && disponiveis.length === 0 && (
        <Text className="text-muted text-center my-8">Nenhum exercício encontrado.</Text>
      )}

      <View style={{ gap: 10 }} className="mb-6">
        {disponiveis.map((item) => {
          const ativo = escolhido?.id === item.id;
          const detalhe = item.equipamento.join(' · ') || item.musculos.join(' · ');
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => setEscolhido(item)}
              className="flex-row items-center bg-surface px-4 py-3.5"
              style={{
                borderRadius: 22, borderWidth: 1,
                borderColor: ativo ? 'rgba(0,209,255,0.6)' : colors.line,
                backgroundColor: ativo ? 'rgba(0,209,255,0.06)' : colors.surface,
              }}
            >
              {item.imagemUrl ? (
                <Image source={{ uri: item.imagemUrl }} resizeMode="cover" style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.surface2 }} />
              ) : (
                <MiniTile size={48}>
                  <Text className="text-cyan font-extrabold text-lg">{item.nome.charAt(0).toUpperCase()}</Text>
                </MiniTile>
              )}
              <View className="flex-1 mx-3">
                <Text className="text-white font-bold text-base" numberOfLines={2}>{item.nome}</Text>
                <Text className="text-muted text-xs font-bold mt-0.5" numberOfLines={1}>
                  {grupo === '' ? `${item.grupo}${detalhe ? '  •  ' : ''}` : ''}{detalhe}
                </Text>
              </View>
              <IconButton size={36} onPress={() => navigation.navigate('DetalheExercicio', { exercicio: item })} style={{ marginRight: 10 }}>
                <Info color={colors.muted} size={17} strokeWidth={2.2} />
              </IconButton>
              <View
                className="items-center justify-center"
                style={{
                  width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
                  borderColor: ativo ? colors.cyan : 'rgba(255,255,255,0.18)',
                  backgroundColor: ativo ? colors.cyan : 'transparent',
                }}
              >
                {ativo && <Check color={colors.ink} size={16} strokeWidth={3.2} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {escolhido ? (
        <GradientButton label={substituindo ? 'Substituir exercício' : 'Adicionar exercício'} onPress={confirmar} />
      ) : (
        <Text className="text-dim text-xs text-center mb-2">Selecione um exercício</Text>
      )}

      {substituindo && (
        <OutlineButton
          tone="danger"
          label="Remover exercício"
          icon={<Trash2 color={colors.danger} size={18} strokeWidth={2.2} />}
          onPress={excluir}
          style={{ marginTop: 12 }}
        />
      )}

      <Text className="text-dim text-[11px] text-center mt-6">Exercícios: wger.de (licença CC-BY-SA)</Text>
    </Screen>
  );
}
