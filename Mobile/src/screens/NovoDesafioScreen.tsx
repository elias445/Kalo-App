import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, Dumbbell, Flame, Swords, Target } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Field from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { Avatar, BackButton, Chip, MiniTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

const DURACOES = [7, 14, 30, 60];

export default function NovoDesafioScreen() {
  const navigation = useNavigation();
  const { amigos, criarDesafio } = useApp();

  const amigosAtivos = amigos.filter((a) => a.status === 'ativo');

  const [nome, setNome] = useState('');
  const [duracao, setDuracao] = useState(30);
  const [selecionados, setSelecionados] = useState<string[]>(amigosAtivos.map((a) => a.id));
  const [regras, setRegras] = useState({ treino: true, calorias: true, sequencia: true });

  const alternar = (id: string) =>
    setSelecionados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));

  const criar = () => {
    if (!nome.trim()) {
      Alert.alert('Dê um nome ao desafio', 'Informe um nome para o desafio.');
      return;
    }
    if (selecionados.length === 0) {
      Alert.alert('Escolha participantes', 'Selecione pelo menos um amigo para competir com você.');
      return;
    }
    criarDesafio(nome.trim(), duracao, selecionados);
    navigation.goBack();
  };

  const linhasRegras = [
    { chave: 'treino' as const, titulo: 'Treino concluído', pontos: '+50', Icone: Dumbbell },
    { chave: 'calorias' as const, titulo: 'Meta de calorias cumprida', pontos: '+30', Icone: Target },
    { chave: 'sequencia' as const, titulo: 'Sequência de treinos', pontos: '+10 por dia', Icone: Flame },
  ];

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <SectionLabel dot>Comunidade</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2 mb-8">Novo desafio</Text>

      <Field label="Nome do desafio" icon={Swords} placeholder="Ex: Verão em dia" value={nome} onChangeText={setNome} />

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Duração</SectionLabel>
      </View>
      <View className="flex-row" style={{ gap: 10 }}>
        {DURACOES.map((d) => (
          <Chip key={d} label={`${d} dias`} selected={duracao === d} onPress={() => setDuracao(d)} flex />
        ))}
      </View>

      <View className="mt-7 mb-3">
        <SectionLabel tone="muted">Pontuação</SectionLabel>
      </View>
      <Card className="px-4 py-1">
        {linhasRegras.map((r, i) => (
          <View
            key={r.chave}
            className="flex-row items-center py-3"
            style={i !== linhasRegras.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
          >
            <MiniTile size={38}>
              <r.Icone color={colors.cyan} size={18} strokeWidth={2} />
            </MiniTile>
            <View className="flex-1 mx-3">
              <Text className="text-white font-bold text-sm">{r.titulo}</Text>
              <Text className="text-cyan text-xs font-bold mt-0.5">{r.pontos}</Text>
            </View>
            <Switch
              value={regras[r.chave]}
              onValueChange={(v) => setRegras((atual) => ({ ...atual, [r.chave]: v }))}
              trackColor={{ false: '#2A2E39', true: 'rgba(0,209,255,0.5)' }}
              thumbColor={regras[r.chave] ? colors.cyan : '#8B94A7'}
            />
          </View>
        ))}
      </Card>

      <View className="mt-7 mb-3 flex-row justify-between items-center">
        <SectionLabel tone="muted">Participantes</SectionLabel>
        <Text className="text-muted text-xs font-bold">{selecionados.length} selecionados</Text>
      </View>
      <View style={{ gap: 10 }} className="mb-8">
        {amigosAtivos.map((a) => {
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

      <GradientButton label="Criar desafio" onPress={criar} icon={<Swords color="#FFFFFF" size={20} strokeWidth={2.4} />} />
    </Screen>
  );
}
