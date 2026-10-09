import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Check, Clock, Flame, Layers, Dumbbell } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import RingProgress from '../components/RingProgress';
import { GradientButton } from '../components/Buttons';
import { BackButton, Badge, InfoChip, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { diaDeHoje, estimarTreino, formatarCarga } from '../data/treino';
import { colors } from '../theme';

export default function TreinoDoDiaScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { plano } = useApp();

  const dia: string = route.params?.dia ?? diaDeHoje();
  const treino = plano[dia];
  const exercicios = treino.exercicios;
  const estimativa = estimarTreino(exercicios);

  const [concluidos, setConcluidos] = useState<number[]>([]);

  const alternar = (id: number) =>
    setConcluidos((atual) => (atual.includes(id) ? atual.filter((item) => item !== id) : [...atual, id]));

  const total = exercicios.length;
  const progresso = total ? concluidos.length / total : 0;

  const finalizar = () => {
    if (concluidos.length < total) {
      Alert.alert('Treino incompleto', `Você concluiu ${concluidos.length} de ${total} exercícios. Deseja finalizar mesmo assim?`, [
        { text: 'Continuar treino', style: 'cancel' },
        { text: 'Finalizar', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    Alert.alert('Treino concluído!', 'Parabéns! Seu treino foi registrado.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
  };

  return (
    <Screen>
      <View className="flex-row items-center justify-between mb-6">
        <BackButton />
        <Badge label={dia} tone="muted" />
      </View>

      <HeroCard style={{ marginBottom: 24 }} contentStyle={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <View className="flex-1">
          <SectionLabel dot>{dia === diaDeHoje() ? 'Treino de hoje' : 'Treino'}</SectionLabel>
          <Text className="text-white font-extrabold mt-2" style={{ fontSize: 26, lineHeight: 32 }}>{treino.titulo}</Text>
          <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
            <InfoChip icon={<Clock color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${estimativa.minutos} min`} />
            <InfoChip icon={<Flame color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`~${estimativa.kcal} kcal`} />
            <InfoChip icon={<Layers color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${total} exercícios`} />
          </View>
        </View>
        <RingProgress size={92} stroke={9} progress={progresso}>
          <Text className="text-white font-extrabold text-base">{concluidos.length}/{total}</Text>
        </RingProgress>
      </HeroCard>

      <View className="mb-3">
        <SectionLabel tone="muted">Exercícios</SectionLabel>
      </View>

      <View style={{ gap: 12 }} className="mb-8">
        {exercicios.map((ex, i) => {
          const feito = concluidos.includes(ex.id);
          return (
            <TouchableOpacity key={ex.id} activeOpacity={0.8} onPress={() => alternar(ex.id)}>
              <Card
                highlight={feito}
                className="flex-row items-center p-4 rounded-[22px]"
                style={{ opacity: feito ? 0.85 : 1 }}
              >
                <View
                  className="items-center justify-center"
                  style={{
                    width: 46, height: 46, borderRadius: 15, borderWidth: 1,
                    backgroundColor: feito ? colors.cyan : 'rgba(0,209,255,0.10)',
                    borderColor: feito ? colors.cyan : 'rgba(0,209,255,0.25)',
                  }}
                >
                  {feito ? (
                    <Check color={colors.ink} size={22} strokeWidth={3.2} />
                  ) : (
                    <Text className="text-cyan font-extrabold text-base">{String(i + 1).padStart(2, '0')}</Text>
                  )}
                </View>
                <View className="flex-1 mx-4">
                  <Text
                    className="font-extrabold text-lg"
                    numberOfLines={2}
                    style={{ color: feito ? colors.muted : '#FFFFFF', textDecorationLine: feito ? 'line-through' : 'none' }}
                  >
                    {ex.nome}
                  </Text>
                  <View className="flex-row items-center mt-2" style={{ gap: 8 }}>
                    <View className="bg-surface2 border border-line" style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 9 }}>
                      <Text className="text-white text-sm font-extrabold">{ex.series} × {ex.reps}</Text>
                    </View>
                    <Dumbbell color={colors.muted} size={12} strokeWidth={2.2} />
                    <Text className="text-muted text-xs font-bold">{formatarCarga(ex.carga)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}
        {total === 0 && <Text className="text-muted text-center">Nenhum exercício neste dia.</Text>}
      </View>

      {total > 0 && (
        <GradientButton label="Concluir treino" onPress={finalizar} icon={<Check color="#FFFFFF" size={20} strokeWidth={3} />} />
      )}
    </Screen>
  );
}
