import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus, Trash2, UtensilsCrossed } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import { OutlineButton } from '../components/Buttons';
import { ICONES_REFEICAO } from '../components/iconesRefeicao';
import { BackButton, IconButton, IconTile, InfoChip, MiniTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

export default function DetalheRefeicaoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const refeicao: string = route.params?.refeicao ?? 'Refeição';
  const { refeicoes, removerAlimento, metas } = useApp();
  const Icone = ICONES_REFEICAO[refeicao] ?? UtensilsCrossed;

  const itens = refeicoes[refeicao] ?? [];
  const total = itens.reduce((soma, item) => soma + item.kcal, 0);
  const gramasTotais = itens.reduce((soma, item) => soma + item.gramas, 0);

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <HeroCard style={{ marginBottom: 24 }}>
        <View style={{ position: 'absolute', right: -8, top: -12, opacity: 0.1 }}>
          <Icone color="#FFFFFF" size={120} strokeWidth={1.4} />
        </View>
        <View className="flex-row items-center" style={{ gap: 14 }}>
          <IconTile size={52}>
            <Icone color={colors.cyan} size={24} strokeWidth={2} />
          </IconTile>
          <View>
            <SectionLabel>Refeição</SectionLabel>
            <Text className="text-white text-2xl font-extrabold mt-1">{refeicao}</Text>
          </View>
        </View>
        <View className="flex-row items-end mt-5">
          <Text className="text-white font-extrabold" style={{ fontSize: 40, lineHeight: 46, letterSpacing: -1 }}>{total}</Text>
          <Text className="text-muted font-bold text-base mb-2 ml-1.5">kcal</Text>
        </View>
        <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
          <InfoChip icon={<UtensilsCrossed color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${itens.length} ${itens.length === 1 ? 'alimento' : 'alimentos'}`} />
          <InfoChip icon={<Text className="text-cyan text-xs font-extrabold">g</Text>} texto={`${gramasTotais} g`} />
          <InfoChip icon={<Text className="text-cyan text-xs font-extrabold">%</Text>} texto={`${Math.round((total / metas.calorias) * 100)}% da meta`} />
        </View>
      </HeroCard>

      {itens.length === 0 ? (
        <Card className="items-center p-8 mb-6">
          <IconTile size={64}>
            <UtensilsCrossed color={colors.cyan} size={28} strokeWidth={1.8} />
          </IconTile>
          <Text className="text-white font-bold text-lg mt-5">Nada por aqui ainda</Text>
          <Text className="text-muted text-sm text-center mt-2">Nenhum alimento registrado nesta refeição.</Text>
        </Card>
      ) : (
        <>
          <View className="mb-3">
            <SectionLabel tone="muted">Alimentos</SectionLabel>
          </View>
          <View style={{ gap: 10 }} className="mb-6">
            {itens.map((item) => (
              <Card key={item.id} className="flex-row items-center p-4 rounded-[22px]">
                <MiniTile size={44}>
                  <Text className="text-cyan font-extrabold text-lg">{item.nome.charAt(0).toUpperCase()}</Text>
                </MiniTile>
                <View className="flex-1 mx-3">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{item.nome}</Text>
                  <Text className="text-muted text-xs mt-0.5">{item.gramas} g</Text>
                </View>
                <Text className="text-cyan font-extrabold text-sm mr-3">{item.kcal} kcal</Text>
                <IconButton size={38} onPress={() => removerAlimento(refeicao, item.id)} style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
                  <Trash2 color={colors.danger} size={16} strokeWidth={2} />
                </IconButton>
              </Card>
            ))}
          </View>
        </>
      )}

      <OutlineButton
        label="Adicionar alimento"
        icon={<Plus color={colors.cyan} size={20} strokeWidth={2.4} />}
        onPress={() => navigation.navigate('PesquisaAlimentos', { refeicao })}
      />
    </Screen>
  );
}
