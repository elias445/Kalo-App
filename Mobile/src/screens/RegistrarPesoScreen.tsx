import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Scale, Minus, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react-native';
import Screen from '../components/Screen';
import HeroCard from '../components/HeroCard';
import { GradientButton } from '../components/Buttons';
import { BackButton, Badge, IconTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const paraNumero = (texto: string) => parseFloat(texto.replace(',', '.'));
const formatar = (n: number) => n.toFixed(1).replace('.', ',');

export default function RegistrarPesoScreen() {
  const navigation = useNavigation();
  const { pesoAtual, registrarPeso } = useApp();
  const [peso, setPeso] = useState(formatar(pesoAtual));

  const hoje = new Date();
  const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

  const valor = paraNumero(peso);
  const valido = !!valor && valor >= 20 && valor <= 400;
  const diferenca = valido ? valor - pesoAtual : 0;

  const ajustar = (delta: number) => {
    const base = valido ? valor : pesoAtual;
    setPeso(formatar(Math.max(20, Math.round((base + delta) * 10) / 10)));
  };

  const salvar = () => {
    if (!valido) {
      Alert.alert('Peso inválido', 'Informe um peso entre 20 e 400 kg.');
      return;
    }
    registrarPeso(Math.round(valor * 10) / 10);
    navigation.goBack();
  };

  return (
    <Screen contentStyle={{ flexGrow: 1 }}>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <View className="flex-1 justify-center pb-10">
        <View className="items-center mb-8">
          <IconTile size={68}>
            <Scale color={colors.cyan} size={30} strokeWidth={1.8} />
          </IconTile>
          <Text className="text-white text-3xl font-extrabold mt-6">Registrar peso</Text>
          <Text className="text-muted text-sm mt-2">{dataFormatada}</Text>
        </View>

        <HeroCard padding={24} contentStyle={{ alignItems: 'center' }} style={{ marginBottom: 14 }}>
          <SectionLabel tone="muted">Peso de hoje</SectionLabel>
          <View className="flex-row items-center justify-center mt-4" style={{ gap: 14 }}>
            <TouchableOpacity
              onPress={() => ajustar(-0.1)}
              activeOpacity={0.7}
              className="bg-surface2 border border-line items-center justify-center"
              style={{ width: 46, height: 46, borderRadius: 15 }}
            >
              <Minus color="#FFFFFF" size={20} strokeWidth={2.4} />
            </TouchableOpacity>
            <View className="flex-row items-end">
              <TextInput
                value={peso}
                onChangeText={setPeso}
                keyboardType="decimal-pad"
                selectionColor={colors.cyan}
                className="text-white font-extrabold text-center"
                style={{ fontSize: 48, lineHeight: 56, width: 120, padding: 0 }}
              />
              <Text className="text-muted font-bold text-lg mb-2">kg</Text>
            </View>
            <TouchableOpacity
              onPress={() => ajustar(0.1)}
              activeOpacity={0.7}
              className="bg-surface2 border border-line items-center justify-center"
              style={{ width: 46, height: 46, borderRadius: 15 }}
            >
              <Plus color="#FFFFFF" size={20} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
          <View className="mt-4" style={{ minHeight: 30 }}>
            {valido && Math.abs(diferenca) >= 0.05 ? (
              <Badge
                tone={diferenca < 0 ? 'ok' : 'violet'}
                label={`${diferenca > 0 ? '+' : ''}${formatar(diferenca)} kg desde o último registro`}
                icon={diferenca < 0 ? <ArrowDownRight color={colors.ok} size={13} strokeWidth={3} /> : <ArrowUpRight color="#A78BFA" size={13} strokeWidth={3} />}
              />
            ) : null}
          </View>
        </HeroCard>
        <Text className="text-dim text-xs text-center mb-8">Último registro: {formatar(pesoAtual)} kg</Text>

        <GradientButton label="Salvar" onPress={salvar} />
      </View>
    </Screen>
  );
}
