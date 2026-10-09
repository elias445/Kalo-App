import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Search } from 'lucide-react-native';
import Screen from '../components/Screen';
import AlimentoRow, { useAdicionado } from '../components/AlimentoRow';
import { BackButton, Badge, MiniTile, SectionLabel } from '../components/UI';
import { ICONES_REFEICAO } from '../components/iconesRefeicao';
import { useApp } from '../context/AppContext';
import { ALIMENTOS, calcularKcal } from '../data/alimentos';
import { colors } from '../theme';

const normalizar = (texto: string) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export default function PesquisaAlimentosScreen() {
  const route = useRoute<any>();
  const refeicaoDestino: string = route.params.refeicao;
  const Icone = ICONES_REFEICAO[refeicaoDestino];
  const { adicionarAlimento } = useApp();

  const [busca, setBusca] = useState('');
  const [gramas, setGramas] = useState<Record<string, string>>({});
  const [adicionado, marcarAdicionado] = useAdicionado();

  const filtrados = ALIMENTOS.filter((a) => normalizar(a.nome).includes(normalizar(busca)));

  const adicionar = (nome: string) => {
    const g = Number(gramas[nome] ?? '100');
    if (!g) {
      Alert.alert('Quantidade inválida', 'Informe a quantidade em gramas.');
      return;
    }
    adicionarAlimento(refeicaoDestino, nome, g);
    marcarAdicionado(nome);
  };

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge
          tone="cyan"
          label={`Adicionando em ${refeicaoDestino}`}
          icon={Icone ? <Icone color={colors.cyan} size={13} strokeWidth={2.4} /> : undefined}
        />
      </View>

      <Text className="text-white text-3xl font-extrabold mb-5">Buscar alimento</Text>

      <View
        className="flex-row items-center px-4 mb-7"
        style={{ height: 56, borderRadius: 18, backgroundColor: colors.surface2, borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' }}
      >
        <Search color={colors.cyan} size={20} strokeWidth={2.4} style={{ marginRight: 12 }} />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Pesquisar alimento"
          placeholderTextColor={colors.dim}
          selectionColor={colors.cyan}
          className="flex-1 text-white font-bold text-base"
          style={{ height: '100%' }}
        />
      </View>

      <View className="mb-3">
        <SectionLabel tone="muted">{`Resultados (${filtrados.length})`}</SectionLabel>
      </View>

      <View style={{ gap: 10 }}>
        {filtrados.map((alimento) => (
          <AlimentoRow
            key={alimento.nome}
            nome={alimento.nome}
            legenda={(gramas[alimento.nome] ?? '100') !== '100' ? `${alimento.kcal100} kcal por 100 g` : undefined}
            kcal={calcularKcal(alimento.kcal100, Number(gramas[alimento.nome] ?? '100') || 0)}
            gramas={gramas[alimento.nome] ?? '100'}
            onGramasChange={(v) => setGramas((atual) => ({ ...atual, [alimento.nome]: v }))}
            onAdd={() => adicionar(alimento.nome)}
            adicionado={adicionado === alimento.nome}
          />
        ))}
        {filtrados.length === 0 && (
          <View className="items-center mt-6" style={{ gap: 12 }}>
            <MiniTile size={56}>
              <Search color={colors.cyan} size={24} strokeWidth={2} />
            </MiniTile>
            <Text className="text-muted text-center">Nenhum alimento encontrado.</Text>
          </View>
        )}
      </View>
    </Screen>
  );
}
