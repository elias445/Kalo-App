import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, Dumbbell, Flame, Swords, Target } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Field from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { Avatar, BackButton, Chip, MiniTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { DURACOES_DESAFIO, REGRAS_PONTOS } from '../data/comunidade';
import { colors } from '../theme';

// Tela para criar um novo desafio entre amigos
export default function NovoDesafioScreen() {
  const navigation = useNavigation();
  const { amizades, criarDesafio } = useApp();

  const amigos = amizades.amigos;

  const [nome, setNome] = useState('');
  const [duracao, setDuracao] = useState(30);
  const [selecionados, setSelecionados] = useState<string[]>(amigos.map((a) => a.id));
  const [criando, setCriando] = useState(false);

  // Marca ou desmarca um participante
  const alternar = (id: string) =>
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  // Valida e cria o desafio no servidor (os amigos recebem um convite para aceitar)
  const criar = async () => {
    if (criando) return;
    if (!nome.trim()) {
      Alert.alert('Dê um nome ao desafio', 'Informe um nome para o desafio.');
      return;
    }
    if (selecionados.length === 0) {
      Alert.alert('Escolha participantes', 'Selecione pelo menos um amigo para competir com você.');
      return;
    }
    setCriando(true);
    const resultado = await criarDesafio(nome.trim(), duracao, selecionados);
    setCriando(false);
    if (!resultado.ok) {
      Alert.alert('Não foi possível criar', resultado.erro ?? 'Verifique a conexão e tente de novo.');
      return;
    }
    navigation.goBack();
  };

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <SectionLabel dot>Comunidade</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2 mb-8">Novo desafio</Text>

      <Field label="Nome do desafio" icon={Swords} placeholder="Ex: Verão em dia" value={nome} onChangeText={setNome} maxLength={60} />

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Duração</SectionLabel>
      </View>
      <View className="flex-row" style={{ gap: 10 }}>
        {DURACOES_DESAFIO.map((d) => (
          <Chip key={d} label={`${d} dias`} selected={duracao === d} onPress={() => setDuracao(d)} flex />
        ))}
      </View>

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Pontuação</SectionLabel>
      </View>
      <Card className="px-4 py-1">
        {REGRAS_PONTOS.map((r, i) => (
          <View
            key={r.titulo}
            className="flex-row items-center py-3"
            style={i !== REGRAS_PONTOS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
          >
            <MiniTile size={38}>
              {i === 0 ? <Dumbbell color={colors.cyan} size={18} strokeWidth={2} /> : i === 1 ? <Target color={colors.cyan} size={18} strokeWidth={2} /> : <Flame color={colors.cyan} size={18} strokeWidth={2} />}
            </MiniTile>
            <View className="flex-1 mx-3">
              <Text className="text-white font-bold text-sm">{r.titulo}</Text>
            </View>
            <Text className="text-cyan font-extrabold text-sm">{r.pontos}</Text>
          </View>
        ))}
      </Card>
      <Text className="text-dim text-xs mt-2 px-1">
        A meta de calorias vale nos dias em que o consumo fica entre 90% e 110% da sua meta diária.
      </Text>

      <View className="mt-7 mb-3 flex-row justify-between items-center">
        <SectionLabel tone="muted">Convidar amigos</SectionLabel>
        <Text className="text-muted text-xs font-bold">{selecionados.length} selecionados</Text>
      </View>
      <View style={{ gap: 10 }} className="mb-8">
        {amigos.map((a) => {
          const ativo = selecionados.includes(a.id);
          return (
            <TouchableOpacity
              key={a.id}
              activeOpacity={0.8}
              onPress={() => alternar(a.id)}
              className="flex-row items-center px-4 py-3"
              style={{
                borderRadius: 22, borderWidth: 1,
                borderColor: ativo ? 'rgba(0,209,255,0.55)' : colors.line,
                backgroundColor: ativo ? 'rgba(0,209,255,0.06)' : colors.surface,
              }}
            >
              <Avatar nome={a.nome} size={42} />
              <View className="flex-1 mx-3">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{a.nome}</Text>
                <Text className="text-muted text-xs mt-0.5">@{a.usuario}</Text>
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

      <Text className="text-dim text-xs text-center mb-4">
        Cada amigo recebe um convite e só entra no ranking depois de aceitar.
      </Text>
      <GradientButton label={criando ? 'Criando...' : 'Criar desafio'} onPress={criar} icon={<Swords color="#FFFFFF" size={20} strokeWidth={2.4} />} />
    </Screen>
  );
}
