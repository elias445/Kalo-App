import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Coffee, Apple, Utensils, Sandwich, Soup, Moon } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import RingProgress from '../components/RingProgress';
import { Badge, IconButton, SectionLabel } from '../components/UI';
import { REFEICOES, useApp } from '../context/AppContext';
import { colors } from '../theme';

const ICONES: Record<string, LucideIcon> = {
  'Café da manhã': Coffee,
  'Lanche da manhã': Apple,
  'Almoço': Utensils,
  'Lanche da tarde': Sandwich,
  'Jantar': Soup,
  'Ceia': Moon,
};

const milhar = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function ResumoRefeicoesScreen() {
  const navigation = useNavigation<any>();
  const { refeicoes, metas, totalConsumido } = useApp();

  const progresso = totalConsumido / metas.calorias;
  const restantes = metas.calorias - totalConsumido;

  // As refeições formam uma grade de 2 colunas que ocupa o espaço restante (sem scroll)
  const linhas = [0, 2, 4].map((i) => REFEICOES.slice(i, i + 2));

  return (
    <Screen tabbed scroll={false} contentStyle={{ paddingBottom: 16 }}>
      <View className="mb-5">
        <SectionLabel dot>Nutrição diária</SectionLabel>
        <Text className="text-white text-3xl font-extrabold mt-1">Refeições</Text>
      </View>

      <View
        className="bg-surface mb-4"
        style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
      >
        <LinearGradient
          colors={['rgba(10,92,255,0.38)', 'rgba(0,209,255,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: 'row', alignItems: 'center', padding: 18, gap: 18 }}
        >
          <RingProgress size={96} stroke={10} progress={progresso}>
            <Text className="text-white font-extrabold text-lg">{Math.round(progresso * 100)}%</Text>
          </RingProgress>
          <View className="flex-1">
            <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.6 }}>TOTAL CONSUMIDO</Text>
            <View className="flex-row items-end mt-1">
              <Text className="text-white font-extrabold" style={{ fontSize: 34, lineHeight: 40, letterSpacing: -1 }}>{milhar(totalConsumido)}</Text>
              <Text className="text-muted font-bold text-sm mb-1.5 ml-1">kcal</Text>
            </View>
            <Text className="text-muted text-xs mb-2">Meta diária: {milhar(metas.calorias)} kcal</Text>
            <Badge
              tone={restantes >= 0 ? 'cyan' : 'violet'}
              label={restantes >= 0 ? `Restam ${milhar(restantes)} kcal` : `${milhar(-restantes)} kcal acima`}
            />
          </View>
        </LinearGradient>
      </View>

      <View style={{ flex: 1, gap: 12 }}>
        {linhas.map((linha, i) => (
          <View key={i} className="flex-row" style={{ flex: 1, gap: 12 }}>
            {linha.map((nome) => {
              const itens = refeicoes[nome] ?? [];
              const kcal = itens.reduce((soma, item) => soma + item.kcal, 0);
              const Icone = ICONES[nome];
              return (
                <TouchableOpacity
                  key={nome}
                  activeOpacity={0.8}
                  style={{ flex: 1, minHeight: 0 }}
                  onPress={() => navigation.navigate('DetalheRefeicao', { refeicao: nome })}
                >
                  <Card highlight={kcal > 0} className="justify-between p-4 rounded-[24px]" style={{ flex: 1 }}>
                    <View className="flex-row items-center justify-between">
                      <View
                        className="items-center justify-center"
                        style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
                      >
                        <Icone color={colors.cyan} size={20} strokeWidth={2} />
                      </View>
                      <IconButton size={36} onPress={() => navigation.navigate('PesquisaAlimentos', { refeicao: nome })}>
                        <Plus color={colors.cyan} size={18} strokeWidth={2.6} />
                      </IconButton>
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base" numberOfLines={1}>{nome}</Text>
                      <View className="flex-row items-end mt-1">
                        <Text className="text-white font-extrabold" style={{ fontSize: 26, lineHeight: 30, letterSpacing: -0.5 }}>{kcal}</Text>
                        <Text className="text-muted font-bold text-xs mb-1 ml-1">kcal</Text>
                      </View>
                      <Text className="text-muted text-xs mt-0.5">
                        {itens.length === 0 ? 'Nada registrado' : `${itens.length} ${itens.length === 1 ? 'alimento' : 'alimentos'}`}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </Screen>
  );
}
