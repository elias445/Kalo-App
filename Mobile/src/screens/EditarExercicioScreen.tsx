import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Trash2, Dumbbell, ArrowDown } from 'lucide-react-native';
import Screen from '../components/Screen';
import HeroCard from '../components/HeroCard';
import { GradientButton, OutlineButton } from '../components/Buttons';
import { BackButton, IconTile, MiniTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { CATALOGO, Exercicio, ExercicioSugerido, GRUPOS } from '../data/treino';
import { colors } from '../theme';

export default function EditarExercicioScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { plano, salvarExercicio, removerExercicio } = useApp();

  const dia: string = route.params.dia;
  const atual: Exercicio | undefined = route.params.exercicio;
  const substituindo = !!atual;

  const [escolhido, setEscolhido] = useState<ExercicioSugerido | null>(null);

  const nomesNoDia = plano[dia].exercicios.map((e) => e.nome);

  // Substituir: recomendados do mesmo grupo muscular. Adicionar: grupos já treinados no dia (ou todos, se o dia estiver vazio).
  const gruposAdicionar = Array.from(new Set(plano[dia].exercicios.map((e) => e.grupo)));
  const grupos = substituindo ? [atual!.grupo] : gruposAdicionar.length ? gruposAdicionar : GRUPOS;

  const recomendados = (grupo: string) => CATALOGO.filter((e) => e.grupo === grupo && !nomesNoDia.includes(e.nome));
  const secoes = grupos.map((grupo) => ({ grupo, itens: recomendados(grupo) })).filter((s) => s.itens.length > 0);

  const confirmar = () => {
    if (!escolhido) return;
    salvarExercicio(dia, { ...escolhido, id: atual?.id });
    navigation.goBack();
  };

  const excluir = () => {
    Alert.alert('Remover exercício', `Remover "${atual?.nome}" do treino?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          removerExercicio(dia, atual!.id);
          navigation.goBack();
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

      {secoes.length === 0 && (
        <Text className="text-muted text-center my-8">Não há mais recomendações disponíveis para este grupo.</Text>
      )}

      {secoes.map(({ grupo, itens }) => (
        <View key={grupo} className="mb-6">
          <View className="mb-3">
            <SectionLabel tone="muted">{substituindo ? `Recomendados para ${grupo}` : grupo}</SectionLabel>
          </View>
          <View style={{ gap: 10 }}>
            {itens.map((item) => {
              const ativo = escolhido?.nome === item.nome;
              return (
                <TouchableOpacity
                  key={item.nome}
                  activeOpacity={0.8}
                  onPress={() => setEscolhido(item)}
                  className="flex-row items-center bg-surface px-4 py-3.5"
                  style={{
                    borderRadius: 22, borderWidth: 1,
                    borderColor: ativo ? 'rgba(0,209,255,0.6)' : colors.line,
                    backgroundColor: ativo ? 'rgba(0,209,255,0.06)' : colors.surface,
                  }}
                >
                  <MiniTile size={44}>
                    <Text className="text-cyan font-extrabold text-lg">{item.nome.charAt(0).toUpperCase()}</Text>
                  </MiniTile>
                  <View className="flex-1 mx-3">
                    <Text className="text-white font-bold text-lg" numberOfLines={1}>{item.nome}</Text>
                    <Text className="text-muted text-sm font-bold mt-0.5">{item.series} × {item.reps}</Text>
                  </View>
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
        </View>
      ))}

      {escolhido ? (
        <GradientButton label={substituindo ? 'Substituir exercício' : 'Adicionar exercício'} onPress={confirmar} />
      ) : (
        <Text className="text-dim text-xs text-center mb-2">Selecione um exercício recomendado</Text>
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
    </Screen>
  );
}
