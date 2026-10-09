import React from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut, Pencil, Plus, Dumbbell, Flame, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { Badge, IconButton, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors, gradients, glow } from '../theme';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const CABECALHO_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Histórico simulado (até existir registro real): dias de treino fixos na semana (Seg, Ter, Qui, Sex, Sáb)
// e uma falta a cada dia 9/18/27 para a consistência não ficar sempre em 100%.
const DIAS_DE_TREINO = [1, 2, 4, 5, 6];
const treinoPlanejado = (data: Date) => DIAS_DE_TREINO.includes(data.getDay());
const treinouEm = (data: Date) => treinoPlanejado(data) && data.getDate() % 9 !== 0;

const formatarKg = (n: number) => n.toFixed(1).replace('.', ',');

export default function PerfilScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { perfil, pesos, pesoAtual } = useApp();

  const handleLogout = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }));
  };

  // --- Peso ---
  const variacao = pesoAtual - pesos[0].value;
  const emQueda = variacao <= 0;
  const valores = pesos.map((p) => p.value);
  const eixoMin = Math.floor((Math.min(...valores) - 2) / 5) * 5;
  const eixoSecoes = Math.max(1, Math.ceil((Math.max(...valores) - eixoMin) / 5));
  const larguraRotulosY = 52;
  const larguraGrafico = width - 48 - 36 - larguraRotulosY - 8;
  const espacamento = pesos.length > 1 ? (larguraGrafico - 28) / (pesos.length - 1) : 0;

  // --- Frequência (mês atual) ---
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaHoje = hoje.getDate();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  const treinou = (d: number) => d < diaHoje && treinouEm(new Date(ano, mes, d));
  const diasPassados = Array.from({ length: diaHoje - 1 }, (_, i) => i + 1);
  const planejadosPassados = diasPassados.filter((d) => treinoPlanejado(new Date(ano, mes, d))).length;
  const totalTreinados = diasPassados.filter(treinou).length;
  const consistencia = planejadosPassados ? Math.round((totalTreinados / planejadosPassados) * 100) : 100;

  // Sequência: treinos planejados cumpridos em seguida, até a primeira falta (dias de descanso não quebram)
  let sequencia = 0;
  for (let i = 1; i <= 365; i++) {
    const data = new Date(ano, mes, diaHoje - i);
    if (!treinoPlanejado(data)) continue;
    if (!treinouEm(data)) break;
    sequencia++;
  }

  // Semanas de 7 colunas (domingo a sábado), completadas com células vazias
  const celulas: (number | null)[] = [
    ...Array.from({ length: primeiroDiaSemana }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  while (celulas.length % 7 !== 0) celulas.push(null);
  const semanas = Array.from({ length: celulas.length / 7 }, (_, i) => celulas.slice(i * 7, i * 7 + 7));

  return (
    <Screen tabbed>
      <View className="flex-row justify-between items-center mb-6">
        <IconButton onPress={() => navigation.navigate('EditarPerfil')}>
          <Pencil color={colors.muted} size={18} strokeWidth={2} />
        </IconButton>
        <SectionLabel tone="muted">Perfil de atleta</SectionLabel>
        <IconButton onPress={handleLogout} style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
          <LogOut color={colors.danger} size={18} strokeWidth={2} style={{ marginLeft: 2 }} />
        </IconButton>
      </View>

      <View className="items-center mb-6">
        <View style={[{ width: 108, height: 108, borderRadius: 54 }, glow(colors.cyan, 0.45, 22)]}>
          <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: 108, height: 108, borderRadius: 54, alignItems: 'center', justifyContent: 'center' }}>
            <View className="bg-ink items-center justify-center" style={{ width: 98, height: 98, borderRadius: 49 }}>
              <View className="bg-surface2 items-center justify-center" style={{ width: 90, height: 90, borderRadius: 45 }}>
                <User color={colors.cyan} size={44} strokeWidth={2} />
              </View>
            </View>
          </LinearGradient>
        </View>
        <View className="flex-row items-center mt-5" style={{ gap: 6 }}>
          <Text className="text-white text-2xl font-extrabold">{perfil.nome}</Text>
        </View>
        <Text className="text-cyan text-xs font-bold mt-1.5">Meta: {perfil.objetivo}</Text>
      </View>

      <View className="flex-row mb-4" style={{ gap: 10 }}>
        <Card className="flex-1 items-center py-4 rounded-2xl">
          <Dumbbell color={colors.cyan} size={18} strokeWidth={2} />
          <Text className="text-muted text-[10px] font-bold mt-2" style={{ letterSpacing: 1.4 }}>TREINOS</Text>
          <Text className="text-white font-extrabold text-xl mt-0.5">142</Text>
        </Card>
        <Card className="flex-1 items-center py-4 rounded-2xl">
          <Flame color={colors.cyan} size={18} strokeWidth={2} />
          <Text className="text-muted text-[10px] font-bold mt-2" style={{ letterSpacing: 1.4 }}>MÉDIA/DIA</Text>
          <Text className="text-white font-extrabold text-xl mt-0.5">640 <Text className="text-muted text-xs">kcal</Text></Text>
        </Card>
        <Card className="flex-1 items-center py-4 rounded-2xl">
          {emQueda ? <TrendingDown color={colors.cyan} size={18} strokeWidth={2} /> : <TrendingUp color={colors.cyan} size={18} strokeWidth={2} />}
          <Text className="text-muted text-[10px] font-bold mt-2" style={{ letterSpacing: 1.4 }}>VARIAÇÃO</Text>
          <Text className="text-cyan font-extrabold text-xl mt-0.5">{variacao > 0 ? '+' : ''}{formatarKg(variacao)} <Text className="text-muted text-xs">kg</Text></Text>
        </Card>
      </View>

      <Card highlight className="p-[18px] mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <SectionLabel tone="muted">Peso corporal</SectionLabel>
          <TouchableOpacity
            onPress={() => navigation.navigate('RegistrarPeso')}
            activeOpacity={0.8}
            className="flex-row items-center"
            style={{ gap: 4, paddingHorizontal: 12, height: 32, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,209,255,0.35)', backgroundColor: 'rgba(0,209,255,0.08)' }}
          >
            <Plus color={colors.cyan} size={14} strokeWidth={3} />
            <Text className="text-cyan text-xs font-bold">Registrar</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-baseline mb-4" style={{ gap: 6 }}>
          <Text className="text-white font-extrabold" style={{ fontSize: 36, lineHeight: 44 }}>{formatarKg(pesoAtual)}</Text>
          <Text className="text-muted font-bold" style={{ fontSize: 16, lineHeight: 22 }}>kg</Text>
        </View>

        <View style={{ marginLeft: -6 }}>
          <LineChart
            data={pesos.map((p) => ({ value: p.value, label: p.label }))}
            areaChart
            curved
            width={larguraGrafico}
            height={140}
            initialSpacing={14}
            endSpacing={14}
            spacing={espacamento}
            thickness={3}
            color={colors.cyan}
            startFillColor={colors.cyan}
            endFillColor={colors.cyan}
            startOpacity={0.3}
            endOpacity={0.01}
            dataPointsColor={colors.cyan}
            dataPointsRadius={4}
            hideRules
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelWidth={larguraRotulosY}
            yAxisLabelSuffix=" kg"
            yAxisTextStyle={{ color: colors.dim, fontSize: 10 }}
            xAxisLabelTextStyle={{ color: colors.dim, fontSize: 10 }}
            yAxisOffset={eixoMin}
            stepValue={5}
            noOfSections={eixoSecoes}
            disableScroll
          />
        </View>
      </Card>

      <Card className="p-[18px]">
        <View className="flex-row justify-between items-center mb-1">
          <SectionLabel tone="muted">Frequência de treino</SectionLabel>
          <Badge tone="cyan" label={`${totalTreinados} treinos`} icon={<Flame color={colors.cyan} size={12} strokeWidth={2.4} />} />
        </View>
        <Text className="text-dim text-xs mb-4">Treinos do mês de {MESES[mes]}</Text>

        <View className="flex-row mb-2">
          {CABECALHO_SEMANA.map((d, i) => (
            <Text key={i} className="text-white text-sm font-bold text-center" style={{ flex: 1 }}>{d}</Text>
          ))}
        </View>

        {semanas.map((semana, linha) => (
          <View key={linha} className="flex-row" style={{ height: 40 }}>
            {semana.map((dia, coluna) => {
              if (dia === null) return <View key={coluna} style={{ flex: 1 }} />;
              const feito = treinou(dia);
              return (
                <View key={coluna} className="items-center justify-center" style={{ flex: 1 }}>
                  <View
                    className="items-center justify-center"
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: feito ? colors.cyan : 'transparent' }}
                  >
                    <Text className="font-bold text-sm" style={{ color: feito ? colors.ink : colors.muted }}>{dia}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <View className="flex-row mt-4" style={{ gap: 14 }}>
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.cyan }} />
            <Text className="text-muted text-[11px]">Treinado</Text>
          </View>
          <View className="flex-row items-center" style={{ gap: 5 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.dim }} />
            <Text className="text-muted text-[11px]">Descanso</Text>
          </View>
        </View>

        <View className="flex-row mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
          <View className="flex-1 items-center">
            <Text className="text-muted text-[10px] font-bold" style={{ letterSpacing: 1.4 }}>CONSISTÊNCIA</Text>
            <Text className="text-cyan font-extrabold text-xl mt-1">{consistencia}%</Text>
          </View>
          <View style={{ width: 1, backgroundColor: colors.line }} />
          <View className="flex-1 items-center">
            <Text className="text-muted text-[10px] font-bold" style={{ letterSpacing: 1.4 }}>SEQUÊNCIA</Text>
            <Text className="text-cyan font-extrabold text-xl mt-1">{sequencia} <Text className="text-muted text-xs">{sequencia === 1 ? 'dia' : 'dias'}</Text></Text>
          </View>
        </View>
      </Card>
    </Screen>
  );
}
