import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Dumbbell } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import MapaMusculos from '../components/MapaMusculos';
import { BackButton, Badge, IconTile, InfoChip, SectionLabel } from '../components/UI';
import { colors } from '../theme';

// Dados que a tela recebe (um exercício do plano ou do catálogo)
type Detalhe = {
  nome: string;
  grupo: string;
  musculos?: string[];
  musculosSecundarios?: string[];
  equipamento?: string[];
  descricao?: string | null;
  imagemUrl?: string | null;
  idioma?: string;
  series?: number;
  reps?: number;
};

// Tela de detalhe do exercício: imagem, descrição, músculos e equipamento
export default function DetalheExercicioScreen() {
  const route = useRoute<any>();
  const exercicio: Detalhe = route.params.exercicio;

  const musculos = exercicio.musculos ?? [];
  const secundarios = exercicio.musculosSecundarios ?? [];
  const equipamento = exercicio.equipamento ?? [];
  // A descrição vem do wger com um passo por linha
  const passos = (exercicio.descricao ?? '').split('\n').map((p) => p.trim()).filter(Boolean);

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge tone="cyan" label={exercicio.grupo} />
      </View>

      <View
        className="items-center justify-center mb-5"
        style={{ height: 240, borderRadius: 24, overflow: 'hidden', backgroundColor: exercicio.imagemUrl ? '#FFFFFF' : colors.surface, borderWidth: 1, borderColor: colors.line }}
      >
        {exercicio.imagemUrl ? (
          <Image source={{ uri: exercicio.imagemUrl }} resizeMode="contain" style={{ width: '100%', height: '100%' }} />
        ) : (
          <IconTile size={72}>
            <Dumbbell color={colors.cyan} size={32} strokeWidth={1.8} />
          </IconTile>
        )}
      </View>

      <Text className="text-white font-extrabold" style={{ fontSize: 26, lineHeight: 32 }}>{exercicio.nome}</Text>

      {exercicio.series != null && exercicio.reps != null && (
        <View className="flex-row mt-3">
          <InfoChip icon={<Dumbbell color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${exercicio.series} × ${exercicio.reps}`} />
        </View>
      )}

      <MapaMusculos principais={musculos} secundarios={secundarios} />

      {musculos.length > 0 && (
        <View className="mt-6">
          <View className="mb-3">
            <SectionLabel tone="muted">Músculos trabalhados</SectionLabel>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {musculos.map((m) => (
              <Badge key={m} tone="cyan" label={m} />
            ))}
            {secundarios.map((m) => (
              <Badge key={`s-${m}`} tone="muted" label={`${m} (secundário)`} />
            ))}
          </View>
        </View>
      )}

      {equipamento.length > 0 && (
        <View className="mt-6">
          <View className="mb-3">
            <SectionLabel tone="muted">Equipamento</SectionLabel>
          </View>
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {equipamento.map((e) => (
              <Badge key={e} tone="violet" label={e} />
            ))}
          </View>
        </View>
      )}

      <View className="mt-6 mb-3">
        <SectionLabel tone="muted">Como executar</SectionLabel>
      </View>
      <Card className="p-5 mb-4">
        {passos.length > 0 ? (
          passos.map((passo, i) => (
            <Text key={i} className="text-white" style={{ fontSize: 15, lineHeight: 23, marginTop: i === 0 ? 0 : 10 }}>
              {passo}
            </Text>
          ))
        ) : (
          <Text className="text-muted text-sm">Este exercício ainda não tem descrição.</Text>
        )}
      </Card>

      {exercicio.idioma === 'en' && passos.length > 0 && (
        <Text className="text-dim text-xs text-center mb-2">Este exercício só tem descrição em inglês na fonte.</Text>
      )}
      <Text className="text-dim text-[11px] text-center mb-6">Fonte: wger.de (licença CC-BY-SA)</Text>
    </Screen>
  );
}
