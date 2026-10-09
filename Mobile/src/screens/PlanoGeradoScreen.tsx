import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, ArrowRight, Moon } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import { GradientButton } from '../components/Buttons';
import { Badge, ProgressBar, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { DIAS, diaDeHoje, estimarTreino } from '../data/treino';
import { colors, gradients } from '../theme';

const ORDEM_SEMANA = [...DIAS.slice(1), DIAS[0]]; // Seg ... Dom

export default function PlanoGeradoScreen() {
  const navigation = useNavigation();
  const { perfil, metas, plano } = useApp();
  const hoje = diaDeHoje();

  const iniciar = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
  };

  // Participação de cada macro nas calorias (carboidrato e proteína: 4 kcal/g, gordura: 9 kcal/g)
  const macros = [
    { nome: 'Carboidratos', valor: metas.carboidrato, kcal: metas.carboidrato * 4 },
    { nome: 'Proteínas', valor: metas.proteina, kcal: metas.proteina * 4 },
    { nome: 'Gorduras', valor: metas.gordura, kcal: metas.gordura * 9 },
  ].map((m) => ({ ...m, parte: m.kcal / metas.calorias }));

  return (
    <Screen>
      <View className="flex-row justify-end mb-6">
        <Badge label="PASSO 2 de 2" tone="cyan" />
      </View>
      <View className="mb-8">
        <ProgressBar progress={1} height={4} />
      </View>

      <SectionLabel dot>Plano personalizado</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2">Seu plano está pronto!</Text>
      <Text className="text-muted text-sm mt-2 mb-6">Objetivo: {perfil.objetivo}</Text>

      <HeroCard padding={26} style={{ marginBottom: 16 }} contentStyle={{ alignItems: 'center' }}>
        <View style={{ position: 'absolute', right: -14, top: -16, opacity: 0.1 }}>
          <Flame color="#FFFFFF" size={130} strokeWidth={1.4} />
        </View>
        <View
          className="items-center justify-center mb-3"
          style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: 'rgba(0,209,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' }}
        >
          <Flame color={colors.cyan} size={26} strokeWidth={2} />
        </View>
        <Text className="text-muted text-xs font-bold" style={{ letterSpacing: 1.8 }}>META DIÁRIA</Text>
        <View className="flex-row items-end mt-1">
          <Text className="text-white font-extrabold" style={{ fontSize: 52, lineHeight: 60, letterSpacing: -1.5 }}>{metas.calorias}</Text>
          <Text className="text-muted font-bold text-lg mb-3 ml-1.5">kcal</Text>
        </View>
      </HeroCard>

      <View className="flex-row mb-8" style={{ gap: 10 }}>
        {macros.map((m) => (
          <Card key={m.nome} className="flex-1 items-center px-3 py-5 rounded-2xl">
            <Text className="text-white font-extrabold" style={{ fontSize: 26, letterSpacing: -0.5 }}>
              {m.valor}
              <Text className="text-muted font-bold" style={{ fontSize: 14 }}> g</Text>
            </Text>
            <Text className="text-muted text-xs font-bold mt-1" numberOfLines={1}>{m.nome}</Text>
            <View className="w-full mt-4">
              <ProgressBar progress={m.parte} height={4} />
            </View>
            <Text className="text-dim text-[11px] font-bold mt-2">{Math.round(m.parte * 100)}% das kcal</Text>
          </Card>
        ))}
      </View>

      <SectionLabel tone="muted">Treino da semana</SectionLabel>
      <Card className="px-4 py-1 mt-3 mb-8">
        {ORDEM_SEMANA.map((dia, index) => {
          const { titulo, exercicios } = plano[dia];
          const descanso = exercicios.length === 0;
          const ehHoje = dia === hoje;
          const { minutos } = estimarTreino(exercicios);
          const circulo = (
            <Text style={{ color: ehHoje ? '#FFFFFF' : descanso ? colors.dim : colors.cyan, fontWeight: '800', fontSize: 12 }}>{dia}</Text>
          );
          return (
            <View
              key={dia}
              className="flex-row items-center py-3"
              style={index !== ORDEM_SEMANA.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
            >
              {ehHoje ? (
                <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}>
                  {circulo}
                </LinearGradient>
              ) : (
                <View
                  className="items-center justify-center"
                  style={{
                    width: 44, height: 44, borderRadius: 15, borderWidth: 1,
                    borderColor: descanso ? colors.line : 'rgba(0,209,255,0.25)',
                    backgroundColor: descanso ? 'transparent' : 'rgba(0,209,255,0.10)',
                  }}
                >
                  {circulo}
                </View>
              )}
              <View className="flex-1 ml-4">
                <Text className="font-bold text-base" style={{ color: descanso ? colors.dim : '#FFFFFF' }}>{titulo}</Text>
                <Text className="text-muted text-xs mt-0.5">
                  {descanso ? 'Recuperação' : `${exercicios.length} exercícios  •  ~${minutos} min`}
                </Text>
              </View>
              {descanso ? <Moon color={colors.dim} size={18} strokeWidth={2} /> : ehHoje ? <Badge label="Hoje" tone="cyan" /> : null}
            </View>
          );
        })}
      </Card>

      <GradientButton label="Começar" onPress={iniciar} icon={<ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />} />
    </Screen>
  );
}
