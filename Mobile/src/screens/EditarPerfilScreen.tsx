import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field, { NumberRow } from '../components/Field';
import SeletorDias from '../components/SeletorDias';
import { GradientButton } from '../components/Buttons';
import { BackButton, Chip, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { DIAS_TREINO, NIVEIS, OBJETIVOS, SEXOS } from '../data/perfil';
import { gradients } from '../theme';

// Tela para editar os dados do perfil (mudar objetivo, nível ou dias refaz o plano de treino)
export default function EditarPerfilScreen() {
  const navigation = useNavigation();
  const { perfil, atualizarPerfil, recarregarPlano } = useApp();

  const [nome, setNome] = useState(perfil.nome);
  const [sexo, setSexo] = useState(perfil.sexo);
  const [idade, setIdade] = useState(perfil.idade);
  const [altura, setAltura] = useState(perfil.altura);
  const [objetivo, setObjetivo] = useState(perfil.objetivo);
  const [nivel, setNivel] = useState(perfil.nivel);
  const [diasSemana, setDiasSemana] = useState<string[]>(perfil.diasSemana);
  const [salvando, setSalvando] = useState(false);

  const iniciais = nome.trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';

  // Dias escolhidos na ordem da semana, para comparar e enviar
  const diasOrdenados = DIAS_TREINO.filter((d) => diasSemana.includes(d));
  const mudouNivel = nivel !== perfil.nivel;
  const mudouDias = diasOrdenados.join(',') !== DIAS_TREINO.filter((d) => perfil.diasSemana.includes(d)).join(',');
  const refazPlano = objetivo !== perfil.objetivo || mudouNivel || mudouDias;

  // Envia o perfil ao servidor (que refaz o plano se for o caso) e atualiza o app
  const enviar = async () => {
    if (salvando) return;
    setSalvando(true);
    try {
      const resposta = await apiFetch('/usuarios/perfil', {
        method: 'PUT',
        body: JSON.stringify({
          nome: nome.trim(),
          sexo,
          idade: Number(idade),
          altura: Number(altura),
          objetivo,
          nivel_experiencia: mudouNivel ? nivel : undefined,
          dias_semana: mudouDias ? diasOrdenados : undefined,
        }),
      });
      if (!resposta?.id) throw new Error('O servidor não confirmou a alteração');

      atualizarPerfil({ nome: nome.trim(), sexo, idade, altura, objetivo, nivel, diasSemana: diasOrdenados });
      if (resposta.plano_refeito) await recarregarPlano();
      navigation.goBack();
    } catch (erro) {
      console.error('Erro ao salvar o perfil:', erro);
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Verifique a conexão e tente de novo.');
    } finally {
      setSalvando(false);
    }
  };

  // Valida os dados e, se o plano de treino for refeito, pede confirmação antes de salvar
  const salvar = () => {
    if (!nome.trim()) {
      Alert.alert('Nome obrigatório', 'Informe seu nome.');
      return;
    }
    if (!Number(idade) || !Number(altura)) {
      Alert.alert('Dados inválidos', 'Informe idade e altura válidas.');
      return;
    }
    if (diasSemana.length < 2 || diasSemana.length > 6) {
      Alert.alert('Dias de treino', 'Escolha de 2 a 6 dias da semana para treinar.');
      return;
    }
    if (refazPlano) {
      Alert.alert(
        'Refazer o plano de treino?',
        'Mudar o objetivo, o nível ou os dias cria um plano novo. As trocas que você fez no plano atual serão substituídas, mas seus treinos já registrados continuam.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Continuar', onPress: enviar },
        ]
      );
      return;
    }
    enviar();
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
      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        {OBJETIVOS.map((o) => (
          <Chip key={o.nome} label={o.nome} selected={objetivo === o.nome} onPress={() => setObjetivo(o.nome)} />
        ))}
      </View>

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Nível de experiência</SectionLabel>
      </View>
      <View className="flex-row" style={{ gap: 10 }}>
        {NIVEIS.map((opcao) => (
          <Chip key={opcao} label={opcao} selected={nivel === opcao} onPress={() => setNivel(opcao)} flex ajustar />
        ))}
      </View>

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Dias de treino</SectionLabel>
      </View>
      <SeletorDias selecionados={diasSemana} onChange={setDiasSemana} />

      {refazPlano && (
        <Text className="text-muted text-xs text-center mt-6">O plano de treino será refeito ao salvar.</Text>
      )}

      <View className="mt-8">
        <GradientButton label={salvando ? 'Salvando...' : 'Salvar alterações'} onPress={salvar} />
      </View>
    </Screen>
  );
}
