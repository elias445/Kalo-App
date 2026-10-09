import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Plus, Moon, Clock, Flame, Layers, Dumbbell } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import { OutlineButton } from '../components/Buttons';
import { IconButton, IconTile, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { DIAS, diaDeHoje, estimarTreino } from '../data/treino';
import { colors, gradients, glow } from '../theme';

function Info({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.line }}
    >
      {icon}
      <Text className="text-white text-xs font-bold">{texto}</Text>
    </View>
  );
}

export default function CronogramaTreinoScreen() {
  const navigation = useNavigation<any>();
  const { plano } = useApp();
  const hoje = diaDeHoje();
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  const treino = plano[diaSelecionado];
  const descanso = treino.exercicios.length === 0;
  const estimativa = estimarTreino(treino.exercicios);

  // Número do dia do mês de cada dia da semana atual (domingo a sábado)
  const agora = new Date();
  const datas = DIAS.map((_, i) => {
    const d = new Date(agora);
    d.setDate(agora.getDate() - agora.getDay() + i);
    return d.getDate();
  });

  return (
    <Screen tabbed>
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-1 mr-4">
          <Text className="text-white text-2xl font-extrabold">Cronograma de treino</Text>
          <Text className="text-muted text-sm mt-1">Plano semanal estruturado</Text>
        </View>
        <IconButton onPress={() => navigation.navigate('EditarExercicio', { dia: diaSelecionado })}>
          <Plus color="#FFFFFF" size={22} strokeWidth={2.2} />
        </IconButton>
      </View>

      <View className="flex-row mb-7" style={{ gap: 6 }}>
        {DIAS.map((dia, i) => {
          const ativo = dia === diaSelecionado;
          const temTreino = plano[dia].exercicios.length > 0;
          const conteudo = (
            <>
              <Text style={{ color: ativo ? '#FFFFFF' : colors.muted, fontSize: 11, fontWeight: '700' }}>{dia}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 4 }}>{datas[i]}</Text>
              <View
                style={{
                  width: 5, height: 5, borderRadius: 3, marginTop: 6,
                  backgroundColor: temTreino ? (ativo ? '#FFFFFF' : colors.cyan) : 'transparent',
                }}
              />
            </>
          );
          return (
            <TouchableOpacity key={dia} activeOpacity={0.8} onPress={() => setDiaSelecionado(dia)} style={[{ flex: 1 }, ativo ? glow(colors.brand, 0.5, 12) : undefined]}>
              {ativo ? (
                <LinearGradient
                  colors={gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ height: 78, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
                >
                  {conteudo}
                </LinearGradient>
              ) : (
                <View
                  className="bg-surface items-center justify-center"
                  style={{ height: 78, borderRadius: 18, borderWidth: 1, borderColor: dia === hoje ? 'rgba(0,209,255,0.5)' : colors.line }}
                >
                  {conteudo}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View
        className="bg-surface mb-6"
        style={{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
      >
        <LinearGradient
          colors={['rgba(10,92,255,0.38)', 'rgba(0,209,255,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 22 }}
        >
          <View style={{ position: 'absolute', right: -6, top: -10, opacity: 0.1 }}>
            {descanso ? <Moon color="#FFFFFF" size={120} strokeWidth={1.4} /> : <Dumbbell color="#FFFFFF" size={120} strokeWidth={1.4} />}
          </View>
          <SectionLabel dot>{diaSelecionado === hoje ? 'Treino de hoje' : 'Divisão do dia'}</SectionLabel>
          <Text className="text-white font-extrabold mt-2" style={{ fontSize: 30, lineHeight: 36 }}>{treino.titulo}</Text>
          {descanso ? (
            <Text className="text-muted text-sm mt-3">Dia de recuperação. Seu corpo cresce no descanso.</Text>
          ) : (
            <View className="flex-row flex-wrap mt-4" style={{ gap: 8 }}>
              <Info icon={<Clock color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${estimativa.minutos} min`} />
              <Info icon={<Flame color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`~${estimativa.kcal} kcal`} />
              <Info icon={<Layers color={colors.cyan} size={13} strokeWidth={2.4} />} texto={`${treino.exercicios.length} exercícios`} />
            </View>
          )}
        </LinearGradient>
      </View>

      {descanso ? (
        <>
          <Card className="items-center p-8 mb-5">
            <IconTile size={64}>
              <Moon color={colors.cyan} size={28} strokeWidth={1.8} />
            </IconTile>
            <Text className="text-white font-bold text-lg mt-5">Nenhum exercício programado</Text>
            <Text className="text-muted text-sm text-center mt-2">Quer treinar mesmo assim? Adicione um exercício.</Text>
          </Card>
          <OutlineButton
            label="Adicionar exercício"
            icon={<Plus color={colors.cyan} size={20} strokeWidth={2.4} />}
            onPress={() => navigation.navigate('EditarExercicio', { dia: diaSelecionado })}
          />
        </>
      ) : (
        <View style={{ gap: 12 }}>
          {treino.exercicios.map((ex, i) => (
            <Card key={ex.id} className="flex-row items-center p-4 rounded-[22px]">
              <View
                className="items-center justify-center"
                style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
              >
                <Text className="text-cyan font-extrabold text-base">{String(i + 1).padStart(2, '0')}</Text>
              </View>
              <View className="flex-1 mx-4">
                <Text className="text-white font-extrabold text-xl" numberOfLines={2}>{ex.nome}</Text>
                <View className="flex-row items-center mt-2" style={{ gap: 10 }}>
                  <View className="bg-surface2 border border-line" style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 }}>
                    <Text className="text-white text-base font-extrabold">{ex.series} × {ex.reps}</Text>
                  </View>
                  <Text className="text-muted text-xs font-bold">{ex.grupo}</Text>
                </View>
              </View>
              <IconButton size={42} onPress={() => navigation.navigate('EditarExercicio', { dia: diaSelecionado, exercicio: ex })}>
                <Pencil color={colors.muted} size={17} strokeWidth={2} />
              </IconButton>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
