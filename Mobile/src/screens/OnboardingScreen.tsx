import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, Zap, Target } from 'lucide-react-native';
import Screen from '../components/Screen';
import { NumberRow } from '../components/Field';
import OptionSheet from '../components/OptionSheet';
import { GradientButton } from '../components/Buttons';
import { BackButton, Badge, Chip, ProgressBar } from '../components/UI';
import { useApp } from '../context/AppContext';
import { OBJETIVOS, SEXOS } from '../data/perfil';
import { colors } from '../theme';

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { perfil, pesoAtual, atualizarPerfil, registrarPeso } = useApp();

  const [sexo, setSexo] = useState(perfil.sexo);
  const [idade, setIdade] = useState(perfil.idade);
  const [altura, setAltura] = useState(perfil.altura);
  const [peso, setPeso] = useState(String(pesoAtual).replace('.', ','));
  const [objetivo, setObjetivo] = useState(perfil.objetivo);
  const [sheetAberto, setSheetAberto] = useState(false);

  const gerarPlano = () => {
    const pesoNumero = parseFloat(peso.replace(',', '.'));
    if (!Number(idade) || !Number(altura) || !pesoNumero || !objetivo) {
      Alert.alert('Dados incompletos', 'Preencha idade, altura, peso e objetivo para gerar seu plano.');
      return;
    }
    atualizarPerfil({ sexo, idade, altura, objetivo });
    if (pesoNumero !== pesoAtual) registrarPeso(pesoNumero);
    navigation.navigate('PlanoGerado' as never);
  };

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge label="PASSO 1 de 2" tone="cyan" />
      </View>

      <View className="mb-8">
        <ProgressBar progress={0.5} height={4} />
      </View>

      <Text className="text-white text-3xl font-extrabold">Dados Biométricos</Text>
      <Text className="text-muted text-sm mt-2 mb-8" style={{ lineHeight: 20 }}>
        Personalize as métricas fundamentais para o cálculo calórico e prescrição de carga.
      </Text>

      <Text className="text-white text-sm font-bold mb-3">Sexo Biológico</Text>
      <View className="flex-row mb-5" style={{ gap: 10 }}>
        {SEXOS.map((opcao) => (
          <Chip key={opcao} label={opcao} selected={sexo === opcao} onPress={() => setSexo(opcao)} flex />
        ))}
      </View>

      <View style={{ gap: 12 }} className="mb-7">
        <NumberRow title="Idade" unit="anos" value={idade} onChangeText={setIdade} />
        <NumberRow title="Altura" unit="cm" value={altura} onChangeText={setAltura} />
        <NumberRow title="Peso atual" unit="kg" value={peso} onChangeText={setPeso} />
      </View>

      <Text className="text-white text-sm font-bold mb-3">Qual o seu objetivo?</Text>
      <TouchableOpacity
        onPress={() => setSheetAberto(true)}
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-5 mb-10"
        style={{ height: 64, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}
      >
        <View className="flex-row items-center flex-1 mr-2" style={{ gap: 12 }}>
          <View
            className="items-center justify-center"
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
          >
            <Target color={colors.cyan} size={18} strokeWidth={2} />
          </View>
          <Text className="text-white font-bold text-sm flex-1" numberOfLines={1}>{objetivo}</Text>
        </View>
        <ChevronDown color={colors.cyan} size={20} strokeWidth={2.2} />
      </TouchableOpacity>

      <GradientButton
        variant="cyan"
        uppercase
        label="Gerar plano de treino"
        onPress={gerarPlano}
        icon={<Zap color={colors.ink} size={18} fill={colors.ink} />}
      />
      <Text className="text-dim text-xs text-center mt-4">Cálculo baseado na equação de Mifflin-St Jeor</Text>

      <OptionSheet
        visible={sheetAberto}
        title="Selecione o objetivo"
        options={OBJETIVOS.map((o) => o.nome)}
        selected={objetivo}
        onSelect={(opcao) => { setObjetivo(opcao); setSheetAberto(false); }}
        onClose={() => setSheetAberto(false)}
      />
    </Screen>
  );
}
