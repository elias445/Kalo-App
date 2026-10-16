import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import { GradientButton } from '../components/Buttons';
import { BackButton, Badge, Chip, SectionLabel } from '../components/UI';
import { ICONES_REFEICAO } from '../components/iconesRefeicao';
import { useApp } from '../context/AppContext';
import { useRefeicoes } from '../context/RefeicoesContext';
import { registrarRecente } from '../services/recentes';
import { AlimentoBusca, calcularKcal, porcao } from '../data/alimentos';
import { colors } from '../theme';

type Unidade = 'g' | 'porcao' | 'embalagem';

const EXTRAS: { chave: string; rotulo: string; unidade: 'g' | 'mg'; recuo?: boolean }[] = [
  { chave: 'gordura_saturada', rotulo: 'Gorduras saturadas', unidade: 'g', recuo: true },
  { chave: 'gordura_monoinsaturada', rotulo: 'Gorduras monoinsaturadas', unidade: 'g', recuo: true },
  { chave: 'gordura_poliinsaturada', rotulo: 'Gorduras poliinsaturadas', unidade: 'g', recuo: true },
  { chave: 'gordura_trans', rotulo: 'Gorduras trans', unidade: 'g', recuo: true },
  { chave: 'acucares', rotulo: 'Açúcares', unidade: 'g', recuo: true },
  { chave: 'fibra', rotulo: 'Fibras', unidade: 'g' },
  { chave: 'colesterol', rotulo: 'Colesterol', unidade: 'mg' },
  { chave: 'sodio', rotulo: 'Sódio', unidade: 'mg' },
  { chave: 'potassio', rotulo: 'Potássio', unidade: 'mg' },
  { chave: 'calcio', rotulo: 'Cálcio', unidade: 'mg' },
  { chave: 'magnesio', rotulo: 'Magnésio', unidade: 'mg' },
  { chave: 'ferro', rotulo: 'Ferro', unidade: 'mg' },
  { chave: 'zinco', rotulo: 'Zinco', unidade: 'mg' },
  { chave: 'vitamina_c', rotulo: 'Vitamina C', unidade: 'mg' },
];

const formatar = (n: number) => {
  const arredondado = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(arredondado).replace('.', ',');
};

export default function DetalheAlimentoScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const alimento: AlimentoBusca = route.params.alimento;
  const refeicao: string = route.params.refeicao;
  const Icone = ICONES_REFEICAO[refeicao];

  const { metas, usuarioId } = useApp();
  const { adicionarAlimento } = useRefeicoes();

  const [quantidade, setQuantidade] = useState('100');
  const [unidade, setUnidade] = useState<Unidade>('g');

  const unidades: { chave: Unidade; rotulo: string; gramasPorUnidade: number }[] = [
    { chave: 'g', rotulo: 'Gramas (g)', gramasPorUnidade: 1 },
  ];
  if (alimento.porcao_g) {
    unidades.push({ chave: 'porcao', rotulo: `Porção (${alimento.porcao_g} g)`, gramasPorUnidade: alimento.porcao_g });
  }
  if (alimento.embalagem_g) {
    unidades.push({ chave: 'embalagem', rotulo: `Embalagem (${alimento.embalagem_g} g)`, gramasPorUnidade: alimento.embalagem_g });
  }

  const atual = unidades.find((u) => u.chave === unidade) ?? unidades[0];
  const numero = Number(quantidade.replace(',', '.')) || 0;
  const gramas = numero * atual.gramasPorUnidade;

  const kcal = calcularKcal(alimento.kcal_100g, gramas);
  const origem = alimento.fonte === 'TACO' ? 'TACO' : alimento.categoria ?? 'Industrializado';
  const percentualMeta = metas.calorias ? Math.round((kcal / metas.calorias) * 100) : 0;

  const trocarUnidade = (nova: Unidade) => {
    setUnidade(nova);
    setQuantidade(nova === 'g' ? '100' : '1');
  };

  const nutrientesExtras = EXTRAS.map((extra) => {
    const valor100 = extra.chave === 'fibra' ? alimento.nutrientes?.fibra ?? (alimento.fibra_100g || undefined) : alimento.nutrientes?.[extra.chave];
    return { ...extra, valor100 };
  }).filter((extra) => typeof extra.valor100 === 'number');

  const adicionar = async () => {
    if (!gramas || gramas > 10000) {
      Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }
    await adicionarAlimento(refeicao, alimento, gramas);
    await registrarRecente(usuarioId, alimento);
    navigation.goBack();
  };

  const principais = [
    { rotulo: 'Calorias', valor: `${kcal}`, sufixo: ` kcal (${percentualMeta}%)` },
    { rotulo: 'Carboidratos', valor: formatar(porcao(alimento.carboidrato_100g, gramas)), sufixo: ' g' },
    { rotulo: 'Proteínas', valor: formatar(porcao(alimento.proteina_100g, gramas)), sufixo: ' g' },
    { rotulo: 'Gorduras', valor: formatar(porcao(alimento.gordura_100g, gramas)), sufixo: ' g' },
  ];

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge
          tone="cyan"
          label={`Adicionando em ${refeicao}`}
          icon={Icone ? <Icone color={colors.cyan} size={13} strokeWidth={2.4} /> : undefined}
        />
      </View>

      <HeroCard style={{ marginBottom: 20 }}>
        <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.6 }}>{origem.toUpperCase()}</Text>
        <Text className="text-white font-extrabold mt-1" style={{ fontSize: 22, lineHeight: 28 }}>{alimento.nome}</Text>
        <View className="flex-row items-end mt-4">
          <Text className="text-white font-extrabold" style={{ fontSize: 40, lineHeight: 46, letterSpacing: -1 }}>{kcal}</Text>
          <Text className="text-muted font-bold text-base mb-2 ml-1.5">kcal</Text>
          <Text className="text-muted text-sm mb-2 ml-3">para {formatar(gramas)} g</Text>
        </View>
      </HeroCard>

      <View className="mb-3">
        <SectionLabel tone="muted">Quantidade</SectionLabel>
      </View>
      <View
        className="flex-row items-center px-4 mb-3"
        style={{ height: 56, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' }}
      >
        <TextInput
          value={quantidade}
          onChangeText={setQuantidade}
          keyboardType="decimal-pad"
          selectionColor={colors.cyan}
          className="flex-1 text-white font-extrabold text-xl"
          style={{ height: '100%' }}
        />
        <Text className="text-muted font-bold">{unidade === 'g' ? 'g' : unidade === 'porcao' ? 'porções' : 'embalagens'}</Text>
      </View>

      {unidades.length > 1 && (
        <View className="flex-row flex-wrap mb-2" style={{ gap: 8 }}>
          {unidades.map((u) => (
            <Chip key={u.chave} label={u.rotulo} selected={unidade === u.chave} onPress={() => trocarUnidade(u.chave)} ajustar />
          ))}
        </View>
      )}

      <View className="flex-row flex-wrap mt-4 mb-6" style={{ gap: 10 }}>
        {principais.map((p) => (
          <Card key={p.rotulo} className="p-4 rounded-[20px]" style={{ width: '48%' }}>
            <Text className="text-muted text-xs font-bold">{p.rotulo}</Text>
            <Text className="text-white font-extrabold text-xl mt-1" numberOfLines={1} adjustsFontSizeToFit>
              {p.valor}
              <Text className="text-muted text-xs font-bold">{p.sufixo}</Text>
            </Text>
          </Card>
        ))}
      </View>

      <View className="mb-3">
        <SectionLabel tone="muted">Informação nutricional</SectionLabel>
      </View>
      <Card className="px-5 py-2 mb-4">
        <View className="flex-row justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
          <Text className="text-white font-bold">Quantidade</Text>
          <Text className="text-white font-bold">{formatar(gramas)} g</Text>
        </View>
        {[
          { rotulo: 'Energia', valor: `${kcal} kcal`, forte: true },
          { rotulo: 'Carboidratos', valor: `${formatar(porcao(alimento.carboidrato_100g, gramas))} g`, forte: true },
          { rotulo: 'Proteínas', valor: `${formatar(porcao(alimento.proteina_100g, gramas))} g`, forte: true },
          { rotulo: 'Gorduras totais', valor: `${formatar(porcao(alimento.gordura_100g, gramas))} g`, forte: true },
        ].map((linha) => (
          <View key={linha.rotulo} className="flex-row justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
            <Text className="text-white font-bold">{linha.rotulo}</Text>
            <Text className="text-white font-bold">{linha.valor}</Text>
          </View>
        ))}
        {nutrientesExtras.map((extra, i) => (
          <View
            key={extra.chave}
            className="flex-row justify-between py-3"
            style={i !== nutrientesExtras.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
          >
            <Text className="text-muted" style={{ paddingLeft: extra.recuo ? 14 : 0 }}>{extra.rotulo}</Text>
            <Text className="text-muted">{formatar(porcao(extra.valor100 as number, gramas))} {extra.unidade}</Text>
          </View>
        ))}
      </Card>

      <Text className="text-dim text-[11px] text-center mb-6">
        {alimento.fonte === 'TACO'
          ? 'Fonte: TACO (NEPA/UNICAMP). Valores para alimentos em preparo padrão.'
          : 'Fonte: Open Food Facts (dados colaborativos, podem conter imprecisões).'}
      </Text>

      <GradientButton
        label="Adicionar ao diário"
        onPress={adicionar}
        icon={<Plus color="#FFFFFF" size={20} strokeWidth={2.6} />}
      />
    </Screen>
  );
}
