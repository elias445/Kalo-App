import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions, Switch, Alert } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { LinearGradient } from 'expo-linear-gradient';
import { User, LogOut, Pencil, ScanFace, Plus, Dumbbell, Flame, TrendingDown, TrendingUp, Bell, Clock } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { Badge, IconButton, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { configurarLembretesDiarios, PreferenciasNotificacao, PREFERENCIAS_PADRAO } from '../services/notifications';
import { colors, gradients, glow } from '../theme';

// Refeições configuráveis no perfil (mesmo padrão da tela de onboarding)
type ChaveRefeicao = {
  nome: string;
  emoji: string;
  ativo: keyof PreferenciasNotificacao;
  hora: keyof PreferenciasNotificacao;
  minuto: keyof PreferenciasNotificacao;
};
const REFEICOES_PERFIL: ChaveRefeicao[] = [
  { nome: 'Café da Manhã', emoji: '☕', ativo: 'cafe_ativo', hora: 'cafe_hora', minuto: 'cafe_minuto' },
  { nome: 'Lanche da Manhã', emoji: '🍎', ativo: 'lanche_manha_ativo', hora: 'lanche_manha_hora', minuto: 'lanche_manha_minuto' },
  { nome: 'Almoço', emoji: '🥗', ativo: 'almoco_ativo', hora: 'almoco_hora', minuto: 'almoco_minuto' },
  { nome: 'Lanche da Tarde', emoji: '🥪', ativo: 'lanche_tarde_ativo', hora: 'lanche_tarde_hora', minuto: 'lanche_tarde_minuto' },
  { nome: 'Jantar', emoji: '🍽️', ativo: 'jantar_ativo', hora: 'jantar_hora', minuto: 'jantar_minuto' },
  { nome: 'Ceia', emoji: '🥛', ativo: 'ceia_ativo', hora: 'ceia_hora', minuto: 'ceia_minuto' },
];
const ajustarHora = (h: number, delta: number) => ((h + delta + 24) % 24);
const ajustarMinuto = (m: number, delta: number) => ((m + delta + 60) % 60);

// Nomes dos meses para o calendário
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
// Iniciais dos dias da semana
const CABECALHO_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Peso com 1 casa decimal e vírgula
const formatarKg = (n: number) => n.toFixed(1).replace('.', ',');

// Tela de perfil: peso, estatísticas, frequência de treino e lembretes de refeição
export default function PerfilScreen() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const { perfil, pesos, pesoAtual, frequencia, carregarFrequencia, carregarPesosUsuario, biometriaHabilitada, habilitarBiometria, encerrarSessao, usuarioId } = useApp();

  // Estado das preferências de notificação
  const [prefs, setPrefs] = useState<PreferenciasNotificacao>({ ...PREFERENCIAS_PADRAO });
  const [salvandoPrefs, setSalvandoPrefs] = useState(false);

  // Atualiza a frequência e o histórico de peso sempre que a aba é aberta
  useFocusEffect(
    useCallback(() => {
      carregarFrequencia();
      if (usuarioId) {
        carregarPesosUsuario(usuarioId);
        // Carrega as preferências de notificação do servidor
        apiFetch(`/notificacoes/${usuarioId}`)
          .then((dados) => { if (dados) setPrefs(dados as PreferenciasNotificacao); })
          .catch(() => { }); // Silencia: mantém os padrões
      }
    }, [carregarFrequencia, carregarPesosUsuario, usuarioId])
  );

  // Encerra a sessão e o Auth Gate volta para login
  const handleLogout = async () => {
    await encerrarSessao();
  };

  // Ativa ou informa que biometria já está ligada
  const handleBiometria = () => {
    if (biometriaHabilitada) {
      Alert.alert('Biometria', 'A autenticação por biometria já está ativada.');
    } else {
      habilitarBiometria();
    }
  };

  // Alterna o toggle de ativo/desativado de um lembrete
  const alternarAtivo = (chave: keyof PreferenciasNotificacao) => {
    setPrefs((p) => ({ ...p, [chave]: !p[chave] }));
  };

  // Altera a hora de um lembrete
  const alterarHora = (chave: keyof PreferenciasNotificacao, delta: number) => {
    setPrefs((p) => ({ ...p, [chave]: ajustarHora(p[chave] as number, delta) }));
  };

  const alterarMinuto = (chave: keyof PreferenciasNotificacao, delta: number) => {
    setPrefs((p) => ({ ...p, [chave]: ajustarMinuto(p[chave] as number, delta) }));
  };

  // Salva as preferências e reagenda os lembretes
  const salvarPreferencias = async () => {
    if (!usuarioId) return;
    setSalvandoPrefs(true);
    try {
      await apiFetch('/notificacoes/', {
        method: 'PUT',
        body: JSON.stringify({ usuario_id: usuarioId, ...prefs }),
      });
      await configurarLembretesDiarios(usuarioId);
      Alert.alert('Lembretes', 'Lembretes atualizados com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar os lembretes. Tente novamente.');
    } finally {
      setSalvandoPrefs(false);
    }
  };

  // Dados e medidas do gráfico de peso
  const valores = pesos.map((p) => p.value);
  const pesoInicial = pesos.length > 0 ? pesos[0].value : pesoAtual;
  const variacao = pesos.length > 1 ? pesoAtual - pesoInicial : 0;
  const emQueda = variacao <= 0;
  const eixoMin = valores.length > 0 ? Math.floor((Math.min(...valores) - 2) / 5) * 5 : Math.max(0, Math.floor((pesoAtual - 2) / 5) * 5);
  const eixoSecoes = valores.length > 0 ? Math.max(1, Math.ceil((Math.max(...valores) - eixoMin) / 5)) : 1;
  const larguraRotulosY = 52;
  const larguraGrafico = width - 48 - 36 - larguraRotulosY - 8;
  const espacamento = pesos.length > 1 ? (larguraGrafico - 28) / (pesos.length - 1) : 0;

  // Dados do calendário do mês atual
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();

  // Frequência real vinda do servidor: dias treinados, consistência (feitos dividido pelos planejados) e sequência
  const treinou = (d: number) => !!frequencia?.dias_treinados.includes(d);
  const totalTreinados = frequencia?.total_treinos_mes ?? 0;
  const consistencia = frequencia?.consistencia ?? 100;
  const sequencia = frequencia?.sequencia ?? 0;

  // Calendário em semanas de 7 colunas, de domingo a sábado
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
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton onPress={handleBiometria}>
            <ScanFace color={biometriaHabilitada ? colors.cyan : colors.muted} size={18} strokeWidth={2} />
          </IconButton>
          <IconButton onPress={handleLogout} style={{ borderColor: 'rgba(244,63,94,0.3)' }}>
            <LogOut color={colors.danger} size={18} strokeWidth={2} style={{ marginLeft: 2 }} />
          </IconButton>
        </View>
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
          <Text className="text-white font-extrabold text-xl mt-0.5">{frequencia?.total_treinos ?? 0}</Text>
        </Card>
        <Card className="flex-1 items-center py-4 rounded-2xl">
          <Flame color={colors.cyan} size={18} strokeWidth={2} />
          <Text className="text-muted text-[10px] font-bold mt-2" style={{ letterSpacing: 1.4 }}>SEQUÊNCIA</Text>
          <Text className="text-white font-extrabold text-xl mt-0.5">{sequencia} <Text className="text-muted text-xs">{sequencia === 1 ? 'dia' : 'dias'}</Text></Text>
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
          {pesos.length > 0 ? (
            <LineChart
              data={pesos.map((p) => ({ value: p.value, label: p.label }))}
              areaChart={pesos.length > 1}
              curved={pesos.length > 1}
              width={larguraGrafico}
              height={140}
              initialSpacing={pesos.length > 1 ? 14 : Math.max(14, larguraGrafico / 2 - 14)}
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
          ) : (
            <View className="py-8 items-center justify-center">
              <Text className="text-muted text-xs">Nenhum peso registrado ainda</Text>
            </View>
          )}
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
                    key={feito ? 'treinado' : 'livre'}
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

      {/* ── Seção: Lembretes de Refeição ── */}
      <Card className="p-[18px] mt-4 mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <SectionLabel tone="muted">Lembretes de refeição</SectionLabel>
          <Bell size={16} color={colors.muted} strokeWidth={2} />
        </View>

        <View style={{ gap: 10 }}>
          {REFEICOES_PERFIL.map((r) => {
            const ativo = prefs[r.ativo] as boolean;
            const hora = prefs[r.hora] as number;
            const minuto = prefs[r.minuto] as number;
            return (
              <View
                key={r.nome}
                style={{
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: ativo ? 'rgba(0,209,255,0.25)' : colors.line,
                  backgroundColor: ativo ? 'rgba(0,209,255,0.04)' : 'transparent',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  opacity: ativo ? 1 : 0.55,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>{r.emoji}</Text>
                    <Text className="text-white font-bold text-sm">{r.nome}</Text>
                    {ativo && (
                      <Text className="text-muted text-xs">
                        {String(hora).padStart(2, '0')}:{String(minuto).padStart(2, '0')}
                      </Text>
                    )}
                  </View>
                  <Switch
                    value={ativo}
                    onValueChange={() => alternarAtivo(r.ativo)}
                    trackColor={{ false: colors.line, true: colors.cyan }}
                    thumbColor={ativo ? colors.ink : colors.muted}
                  />
                </View>
                {ativo && (
                  <View className="flex-row items-center justify-center mt-2" style={{ gap: 6 }}>
                    <Clock size={12} color={colors.dim} />
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <TouchableOpacity onPress={() => alterarHora(r.hora, -1)} className="px-2 py-0.5" activeOpacity={0.7}>
                        <Text className="text-cyan font-bold text-base">‹</Text>
                      </TouchableOpacity>
                      <Text className="text-white font-extrabold text-xs w-6 text-center">{String(hora).padStart(2, '0')}</Text>
                      <TouchableOpacity onPress={() => alterarHora(r.hora, 1)} className="px-2 py-0.5" activeOpacity={0.7}>
                        <Text className="text-cyan font-bold text-base">›</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-muted text-xs font-bold">:</Text>
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <TouchableOpacity onPress={() => alterarMinuto(r.minuto, -5)} className="px-2 py-0.5" activeOpacity={0.7}>
                        <Text className="text-cyan font-bold text-base">‹</Text>
                      </TouchableOpacity>
                      <Text className="text-white font-extrabold text-xs w-6 text-center">{String(minuto).padStart(2, '0')}</Text>
                      <TouchableOpacity onPress={() => alterarMinuto(r.minuto, 5)} className="px-2 py-0.5" activeOpacity={0.7}>
                        <Text className="text-cyan font-bold text-base">›</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={salvarPreferencias}
          activeOpacity={0.8}
          className="mt-5 items-center justify-center"
          style={{
            height: 48, borderRadius: 16,
            backgroundColor: salvandoPrefs ? colors.surface : 'rgba(0,209,255,0.12)',
            borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)',
          }}
        >
          <Text className="text-cyan font-bold text-sm">
            {salvandoPrefs ? 'Salvando...' : 'Salvar lembretes'}
          </Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
}
