import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Bell, Clock } from 'lucide-react-native';
import Screen from '../components/Screen';
import { GradientButton } from '../components/Buttons';
import { BackButton, Badge, ProgressBar } from '../components/UI';
import { useApp } from '../context/AppContext';
import { apiFetch } from '../services/api';
import { configurarLembretesDiarios, PreferenciasNotificacao, PREFERENCIAS_PADRAO } from '../services/notifications';
import { colors } from '../theme';

// Refeições configuráveis com chaves tipadas para acessar as preferências
type ChaveRefeicao = {
  nome: string;
  emoji: string;
  ativo: keyof PreferenciasNotificacao;
  hora: keyof PreferenciasNotificacao;
  minuto: keyof PreferenciasNotificacao;
};

const REFEICOES: ChaveRefeicao[] = [
  { nome: 'Café da Manhã', emoji: '☕', ativo: 'cafe_ativo', hora: 'cafe_hora', minuto: 'cafe_minuto' },
  { nome: 'Lanche da Manhã', emoji: '🍎', ativo: 'lanche_manha_ativo', hora: 'lanche_manha_hora', minuto: 'lanche_manha_minuto' },
  { nome: 'Almoço', emoji: '🥗', ativo: 'almoco_ativo', hora: 'almoco_hora', minuto: 'almoco_minuto' },
  { nome: 'Lanche da Tarde', emoji: '🥪', ativo: 'lanche_tarde_ativo', hora: 'lanche_tarde_hora', minuto: 'lanche_tarde_minuto' },
  { nome: 'Jantar', emoji: '🍽️', ativo: 'jantar_ativo', hora: 'jantar_hora', minuto: 'jantar_minuto' },
  { nome: 'Ceia', emoji: '🥛', ativo: 'ceia_ativo', hora: 'ceia_hora', minuto: 'ceia_minuto' },
];

// Ajusta a hora ciclicamente (0-23)
const ajustarHora = (h: number, delta: number) => ((h + delta + 24) % 24);
// Ajusta o minuto em passos de 5 (0-55)
const ajustarMinuto = (m: number, delta: number) => ((m + delta + 60) % 60);

// Tela de configuração de lembretes de refeição (pós-onboarding)
export default function OnboardingNotificacoesScreen() {
  const navigation = useNavigation();
  const { usuarioId } = useApp();
  const [prefs, setPrefs] = useState<PreferenciasNotificacao>({ ...PREFERENCIAS_PADRAO });
  const [salvando, setSalvando] = useState(false);

  // Alterna o toggle de ativo/desativado de uma refeição
  const alternarAtivo = (chave: keyof PreferenciasNotificacao) => {
    setPrefs((p) => ({ ...p, [chave]: !p[chave] }));
  };

  // Altera o horário de uma refeição
  const alterarHora = (chave: keyof PreferenciasNotificacao, delta: number) => {
    setPrefs((p) => ({ ...p, [chave]: ajustarHora(p[chave] as number, delta) }));
  };

  const alterarMinuto = (chave: keyof PreferenciasNotificacao, delta: number) => {
    setPrefs((p) => ({ ...p, [chave]: ajustarMinuto(p[chave] as number, delta) }));
  };

  // Salva as preferências e agenda os lembretes
  const salvarEContinuar = async () => {
    if (!usuarioId) return;
    setSalvando(true);
    try {
      await apiFetch('/notificacoes/', {
        method: 'PUT',
        body: JSON.stringify({ usuario_id: usuarioId, ...prefs }),
      });
      await configurarLembretesDiarios(usuarioId);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os lembretes. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Pula e entra no app sem configurar notificações
  const pular = () => {
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
  };

  return (
    <Screen>
      <View className="flex-row justify-between items-center mb-6">
        <BackButton />
        <Badge label="CONFIGURAÇÃO FINAL" tone="cyan" />
      </View>

      <View className="mb-8">
        <ProgressBar progress={1} height={4} />
      </View>

      <Text className="text-white text-3xl font-extrabold">Lembretes de Refeição</Text>
      <Text className="text-muted text-sm mt-2 mb-8" style={{ lineHeight: 20 }}>
        Configure quando receber lembretes. Desative as refeições que não fazem parte da sua rotina.
      </Text>

      <View style={{ gap: 12, marginBottom: 32 }}>
        {REFEICOES.map((r) => {
          const ativo = prefs[r.ativo] as boolean;
          const hora = prefs[r.hora] as number;
          const minuto = prefs[r.minuto] as number;

          return (
            <View
              key={r.nome}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: ativo ? 'rgba(0,209,255,0.25)' : colors.line,
                backgroundColor: colors.surface,
                padding: 16,
                opacity: ativo ? 1 : 0.5,
              }}
            >
              {/* Cabeçalho: emoji + nome + toggle */}
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <View
                    style={{
                      width: 36, height: 36, borderRadius: 12,
                      backgroundColor: ativo ? 'rgba(0,209,255,0.10)' : 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: ativo ? 'rgba(0,209,255,0.25)' : colors.line,
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{r.emoji}</Text>
                  </View>
                  <Text className="text-white font-bold text-sm">{r.nome}</Text>
                </View>
                <Switch
                  value={ativo}
                  onValueChange={() => alternarAtivo(r.ativo)}
                  trackColor={{ false: colors.line, true: colors.cyan }}
                  thumbColor={ativo ? colors.ink : colors.muted}
                />
              </View>

              {/* Seletor de horário: só aparece quando ativo */}
              {ativo && (
                <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
                  <Clock size={14} color={colors.muted} />
                  {/* Horas */}
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => alterarHora(r.hora, -1)} className="px-3 py-1" activeOpacity={0.7}>
                      <Text className="text-cyan font-bold text-lg">‹</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-extrabold text-base w-7 text-center">
                      {String(hora).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity onPress={() => alterarHora(r.hora, 1)} className="px-3 py-1" activeOpacity={0.7}>
                      <Text className="text-cyan font-bold text-lg">›</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-muted font-bold">:</Text>
                  {/* Minutos */}
                  <View className="flex-row items-center" style={{ gap: 6 }}>
                    <TouchableOpacity onPress={() => alterarMinuto(r.minuto, -5)} className="px-3 py-1" activeOpacity={0.7}>
                      <Text className="text-cyan font-bold text-lg">‹</Text>
                    </TouchableOpacity>
                    <Text className="text-white font-extrabold text-base w-7 text-center">
                      {String(minuto).padStart(2, '0')}
                    </Text>
                    <TouchableOpacity onPress={() => alterarMinuto(r.minuto, 5)} className="px-3 py-1" activeOpacity={0.7}>
                      <Text className="text-cyan font-bold text-lg">›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <GradientButton
        variant="cyan"
        uppercase
        label={salvando ? 'Salvando...' : 'Ativar lembretes'}
        onPress={salvarEContinuar}
        icon={<Bell color={colors.ink} size={18} />}
      />
      <TouchableOpacity onPress={pular} className="mt-4 items-center" activeOpacity={0.7}>
        <Text className="text-muted text-sm">Pular por agora</Text>
      </TouchableOpacity>
    </Screen>
  );
}
