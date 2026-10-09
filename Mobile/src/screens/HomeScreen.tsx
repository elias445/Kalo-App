import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Bell, Dumbbell, Clock, Flame, Layers, Moon, Wheat, Beef, Droplet } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import RingProgress from '../components/RingProgress';
import { Badge, IconButton, InfoChip, MiniTile, ProgressBar, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { diaDeHoje, estimarTreino } from '../data/treino';
import { colors } from '../theme';

const SEMANA = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

const milhar = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export default function HomeScreen() {
  const { perfil, metas, totalConsumido, plano } = useApp();

  const hoje = new Date();
  const dataTexto = `${SEMANA[hoje.getDay()]}, ${hoje.getDate()} DE ${MESES[hoje.getMonth()]}`;
  const primeiroNome = perfil.nome.trim().split(' ')[0];

  const restantes = metas.calorias - totalConsumido;
  const progresso = totalConsumido / metas.calorias;

  // Macros consumidos estimados de forma proporcional às calorias já registradas
  const proporcao = Math.min(1, progresso);
  const macros = [
    { nome: 'Carboidratos', meta: metas.carboidrato, Icone: Wheat },
    { nome: 'Proteínas', meta: metas.proteina, Icone: Beef },
    { nome: 'Gorduras', meta: metas.gordura, Icone: Droplet },
  ].map((m) => ({ ...m, atual: Math.round(m.meta * proporcao) }));

  const treino = plano[diaDeHoje()];
  const descanso = treino.exercicios.length === 0;
  const estimativa = estimarTreino(treino.exercicios);

  return (
    <Screen tabbed>
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <SectionLabel dot>{dataTexto}</SectionLabel>
          <Text className="text-white text-3xl font-extrabold mt-2">Olá, {primeiroNome}!</Text>
        </View>
        <IconButton onPress={() => Alert.alert('Notificações', 'Você não tem notificações novas.')}>
          <Bell color={colors.muted} size={20} strokeWidth={2} />
        </IconButton>
      </View>

      <HeroCard padding={20} style={{ marginBottom: 16 }} contentStyle={{ alignItems: 'center' }}>
        <RingProgress size={240} stroke={16} progress={progresso}>
          <View className="items-center">
            <Text className="text-muted text-xs font-bold" style={{ letterSpacing: 2 }}>CALORIAS</Text>
            <View className="flex-row items-end mt-1">
              <Text className="text-white font-extrabold" style={{ fontSize: 38, letterSpacing: -1 }}>{milhar(totalConsumido)}</Text>
              <Text className="text-muted font-bold text-base mb-1.5 ml-1">/ {milhar(metas.calorias)}</Text>
            </View>
            <View className="mt-2">
              <Badge
                tone={restantes >= 0 ? 'cyan' : 'violet'}
                label={restantes >= 0 ? `Restam ${milhar(restantes)} kcal` : `${milhar(-restantes)} kcal acima`}
              />
            </View>
            <Text className="text-muted text-sm font-semibold mt-2.5">
              Meta diária: <Text className="text-white font-bold">{milhar(metas.calorias)} kcal</Text>
            </Text>
          </View>
        </RingProgress>
      </HeroCard>

      <View className="flex-row mb-4" style={{ gap: 10 }}>
        {macros.map((m) => (
          <Card key={m.nome} className="flex-1 p-3.5 rounded-[22px]">
            <MiniTile size={34}>
              <m.Icone color={colors.cyan} size={17} strokeWidth={2} />
            </MiniTile>
            <Text className="text-muted text-xs font-bold mt-3" numberOfLines={1}>{m.nome}</Text>
            <Text className="text-white font-extrabold text-xl mt-0.5">{m.atual}<Text className="text-muted text-sm">g</Text></Text>
            <Text className="text-dim text-[11px] mt-0.5 mb-2.5">de {m.meta}g</Text>
            <ProgressBar progress={m.atual / m.meta} height={4} />
          </Card>
        ))}
      </View>

      <HeroCard padding={20}>
        <View style={{ position: 'absolute', right: -6, top: -10, opacity: 0.1 }}>
          {descanso ? <Moon color="#FFFFFF" size={110} strokeWidth={1.4} /> : <Dumbbell color="#FFFFFF" size={110} strokeWidth={1.4} />}
        </View>
        <SectionLabel dot>Treino de hoje</SectionLabel>
        <Text className="text-white font-extrabold mt-2" style={{ fontSize: 26, lineHeight: 32 }}>
          {descanso ? 'Dia de descanso' : treino.titulo}
        </Text>
        {descanso ? (
          <Text className="text-muted text-sm mt-2">Recupere-se bem: o sono também é parte do treino.</Text>
        ) : (
          <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
            <InfoChip icon={<Clock color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${estimativa.minutos} min`} />
            <InfoChip icon={<Flame color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`~${estimativa.kcal} kcal`} />
            <InfoChip icon={<Layers color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${treino.exercicios.length} exercícios`} />
          </View>
        )}
      </HeroCard>
    </Screen>
  );
}
