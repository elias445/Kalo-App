import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field, { NumberRow } from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { BackButton, Chip, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { OBJETIVOS, SEXOS } from '../data/perfil';
import { gradients } from '../theme';

export default function EditarPerfilScreen() {
  const navigation = useNavigation();
  const { perfil, atualizarPerfil } = useApp();

  const [nome, setNome] = useState(perfil.nome);
  const [sexo, setSexo] = useState(perfil.sexo);
  const [idade, setIdade] = useState(perfil.idade);
  const [altura, setAltura] = useState(perfil.altura);
  const [objetivo, setObjetivo] = useState(perfil.objetivo);

  const iniciais = nome.trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

  const salvar = () => {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe seu nome.');
      return;
    }
    if (!Number(idade) || !Number(altura)) {
      Alert.alert('Dados inválidos', 'Informe idade e altura válidas.');
      return;
    }
    atualizarPerfil({ nome: nome.trim(), sexo, idade, altura, objetivo });
    navigation.goBack();
  };

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <View className="items-center mb-8">
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center' }}
        >
          <View className="bg-ink items-center justify-center" style={{ width: 84, height: 84, borderRadius: 42 }}>
            <Text className="text-white font-extrabold" style={{ fontSize: 30 }}>{iniciais}</Text>
          </View>
        </LinearGradient>
        <Text className="text-white text-2xl font-extrabold mt-4">Editar perfil</Text>
        <Text className="text-muted text-sm mt-1">Atualize seus dados e objetivo</Text>
      </View>

      <Field label="Nome" icon={User} value={nome} onChangeText={setNome} />

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Sexo biológico</SectionLabel>
      </View>
      <View className="flex-row" style={{ gap: 10 }}>
        {SEXOS.map((opcao) => (
          <Chip key={opcao} label={opcao} selected={sexo === opcao} onPress={() => setSexo(opcao)} flex />
        ))}
      </View>

      <View style={{ gap: 12 }} className="mt-7">
        <NumberRow title="Idade" unit="anos" value={idade} onChangeText={setIdade} />
        <NumberRow title="Altura" unit="cm" value={altura} onChangeText={setAltura} />
      </View>

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Objetivo</SectionLabel>
      </View>
      <View className="flex-row flex-wrap mb-10" style={{ gap: 10 }}>
        {OBJETIVOS.map((o) => (
          <Chip key={o.nome} label={o.nome} selected={objetivo === o.nome} onPress={() => setObjetivo(o.nome)} />
        ))}
      </View>

      <GradientButton label="Salvar alterações" onPress={salvar} />
    </Screen>
  );
}
