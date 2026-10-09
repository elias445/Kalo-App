import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trophy, UserPlus, Crown, Flame, Heart, Swords, Users, Dumbbell, Target } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import { OutlineButton } from '../components/Buttons';
import { Avatar, Badge, IconButton, IconTile, MiniTile, ProgressBar, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { ATIVIDADES, EU, REGRAS_PONTOS } from '../data/comunidade';
import { colors } from '../theme';

type Aba = 'Ranking' | 'Amigos' | 'Atividade';
const ABAS: Aba[] = ['Ranking', 'Amigos', 'Atividade'];

const MEDALHAS = ['#F5B301', '#B8C1D1', '#D98A4E'];

type Posicao = { id: string; nome: string; pontos: number; treinos: number; sequencia: number; eu?: boolean };

const milhar = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function Podio({ posicoes }: { posicoes: Posicao[] }) {
  // Ordem visual: 2º, 1º, 3º
  const ordem = [1, 0, 2];
  const alturas = [96, 72, 56];
  return (
    <View className="flex-row items-end mb-5" style={{ gap: 10 }}>
      {ordem.map((i) => {
        const p = posicoes[i];
        if (!p) return <View key={i} style={{ flex: 1 }} />;
        const cor = MEDALHAS[i];
        return (
          <View key={p.id} className="items-center" style={{ flex: 1 }}>
            {i === 0 && <Crown color={cor} size={22} strokeWidth={2.2} style={{ marginBottom: 4 }} />}
            <Avatar nome={p.nome} size={i === 0 ? 68 : 56} anel={cor} />
            <Text className="text-white font-bold text-sm mt-2" numberOfLines={1}>{p.eu ? 'Você' : p.nome.split(' ')[0]}</Text>
            <Text className="text-cyan font-extrabold text-xs mt-0.5 mb-2">{milhar(p.pontos)} pts</Text>
            <View
              className="items-center justify-center w-full"
              style={{
                height: alturas[i],
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                borderWidth: 1,
                borderBottomWidth: 0,
                borderColor: `${cor}55`,
                backgroundColor: `${cor}22`,
              }}
            >
              <Text style={{ color: cor, fontSize: 30, fontWeight: '800' }}>{i + 1}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function ComunidadeScreen() {
  const navigation = useNavigation<any>();
  const { perfil, amigos, desafio } = useApp();
  const [aba, setAba] = useState<Aba>('Ranking');
  const [curtidas, setCurtidas] = useState<Record<string, boolean>>({});

  const ranking = useMemo<Posicao[]>(() => {
    const participantes = desafio.participantes
      .map((id) => amigos.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => !!a)
      .map((a) => ({ id: a.id, nome: a.nome, pontos: a.pontos, treinos: a.treinos, sequencia: a.sequencia }));
    return [{ id: EU.id, nome: perfil.nome, pontos: EU.pontos, treinos: EU.treinos, sequencia: EU.sequencia, eu: true }, ...participantes]
      .sort((a, b) => b.pontos - a.pontos);
  }, [amigos, desafio, perfil.nome]);

  const minhaPosicao = ranking.findIndex((p) => p.eu) + 1;
  const progressoDias = desafio.diaAtual / desafio.duracao;
  const restantes = ranking.slice(3);

  return (
    <Screen tabbed>
      <View className="flex-row justify-between items-start mb-6">
        <View>
          <SectionLabel dot>Comunidade</SectionLabel>
          <Text className="text-white text-3xl font-extrabold mt-2">Desafios</Text>
        </View>
        <IconButton onPress={() => navigation.navigate('AdicionarAmigo')}>
          <UserPlus color={colors.cyan} size={20} strokeWidth={2.2} />
        </IconButton>
      </View>

      <HeroCard style={{ marginBottom: 20 }}>
        <View style={{ position: 'absolute', right: -8, top: -12, opacity: 0.1 }}>
          <Trophy color="#FFFFFF" size={120} strokeWidth={1.4} />
        </View>
        <View className="flex-row items-center justify-between">
          <SectionLabel dot>Desafio ativo</SectionLabel>
          <Badge tone="cyan" label={`Dia ${desafio.diaAtual} de ${desafio.duracao}`} />
        </View>
        <Text className="text-white font-extrabold mt-3" style={{ fontSize: 26, lineHeight: 32 }}>{desafio.nome}</Text>
        <View className="mt-4 mb-5">
          <ProgressBar progress={progressoDias} height={6} />
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <IconTile size={48}>
              <Trophy color={colors.cyan} size={22} strokeWidth={2} />
            </IconTile>
            <View>
              <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.4 }}>SUA POSIÇÃO</Text>
              <Text className="text-white font-extrabold text-xl">{minhaPosicao}º lugar</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.4 }}>PONTOS</Text>
            <Text className="text-cyan font-extrabold text-xl">{milhar(EU.pontos)}</Text>
          </View>
        </View>
      </HeroCard>

      <View
        className="flex-row bg-surface mb-6"
        style={{ borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 4, gap: 4 }}
      >
        {ABAS.map((nome) => {
          const ativo = aba === nome;
          return (
            <TouchableOpacity
              key={nome}
              activeOpacity={0.8}
              onPress={() => setAba(nome)}
              className="items-center justify-center"
              style={{
                flex: 1, height: 40, borderRadius: 14, borderWidth: 1,
                borderColor: ativo ? 'rgba(0,209,255,0.4)' : 'transparent',
                backgroundColor: ativo ? 'rgba(0,209,255,0.12)' : 'transparent',
              }}
            >
              <Text style={{ color: ativo ? colors.cyan : colors.muted, fontWeight: '700', fontSize: 13 }}>{nome}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {aba === 'Ranking' && (
        <>
          <Podio posicoes={ranking} />

          {restantes.length > 0 && (
            <View style={{ gap: 10 }} className="mb-6">
              {restantes.map((p, i) => (
                <Card key={p.id} highlight={p.eu} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                  <Text className="text-muted font-extrabold text-base" style={{ width: 28 }}>{i + 4}</Text>
                  <Avatar nome={p.nome} size={42} anel={p.eu ? colors.cyan : undefined} />
                  <View className="flex-1 mx-3">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>{p.eu ? `${p.nome} (você)` : p.nome}</Text>
                    <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
                      <Dumbbell color={colors.muted} size={11} strokeWidth={2.2} />
                      <Text className="text-muted text-xs">{p.treinos} treinos</Text>
                      <Flame color={colors.muted} size={11} strokeWidth={2.2} style={{ marginLeft: 6 }} />
                      <Text className="text-muted text-xs">{p.sequencia} dias</Text>
                    </View>
                  </View>
                  <Text className="text-cyan font-extrabold text-base">{milhar(p.pontos)}</Text>
                </Card>
              ))}
            </View>
          )}

          <View className="mb-3">
            <SectionLabel tone="muted">Como pontua</SectionLabel>
          </View>
          <Card className="px-5 py-1 mb-6">
            {REGRAS_PONTOS.map((r, i) => (
              <View
                key={r.titulo}
                className="flex-row items-center justify-between py-3.5"
                style={i !== REGRAS_PONTOS.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
              >
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <MiniTile size={34}>
                    {i === 0 ? <Dumbbell color={colors.cyan} size={16} strokeWidth={2} /> : i === 1 ? <Target color={colors.cyan} size={16} strokeWidth={2} /> : <Flame color={colors.cyan} size={16} strokeWidth={2} />}
                  </MiniTile>
                  <Text className="text-white font-bold text-sm">{r.titulo}</Text>
                </View>
                <Text className="text-cyan font-extrabold text-sm">{r.pontos}</Text>
              </View>
            ))}
          </Card>

          <OutlineButton
            label="Criar novo desafio"
            icon={<Swords color={colors.cyan} size={20} strokeWidth={2.2} />}
            onPress={() => navigation.navigate('NovoDesafio')}
          />
        </>
      )}

      {aba === 'Amigos' && (
        <>
          <View className="mb-3">
            <SectionLabel tone="muted">{`${amigos.filter((a) => a.status === 'ativo').length} amigos`}</SectionLabel>
          </View>
          <View style={{ gap: 10 }} className="mb-6">
            {amigos.map((a) => (
              <Card key={a.id} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                <Avatar nome={a.nome} size={46} />
                <View className="flex-1 mx-3">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{a.nome}</Text>
                  <Text className="text-muted text-xs mt-0.5">@{a.usuario}</Text>
                </View>
                {a.status === 'pendente' ? (
                  <Badge tone="muted" label="Convite enviado" />
                ) : (
                  <View className="items-end">
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <Flame color={colors.cyan} size={13} strokeWidth={2.4} />
                      <Text className="text-white font-extrabold text-sm">{a.sequencia}</Text>
                    </View>
                    <Text className="text-muted text-[11px] mt-0.5">dias seguidos</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
          <OutlineButton
            label="Adicionar amigo"
            icon={<UserPlus color={colors.cyan} size={20} strokeWidth={2.2} />}
            onPress={() => navigation.navigate('AdicionarAmigo')}
          />
        </>
      )}

      {aba === 'Atividade' && (
        <View style={{ gap: 12 }}>
          {ATIVIDADES.map((a) => {
            const curtiu = !!curtidas[a.id];
            return (
              <Card key={a.id} className="p-4 rounded-[22px]">
                <View className="flex-row items-center">
                  <Avatar nome={a.autor} size={44} />
                  <View className="flex-1 mx-3">
                    <Text className="text-white text-sm" numberOfLines={2}>
                      <Text className="font-extrabold">{a.autor}</Text> {a.acao}
                    </Text>
                    <Text className="text-muted text-xs mt-0.5">{a.tempo}</Text>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center" style={{ gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.line }}>
                    <Users color={colors.cyan} size={13} strokeWidth={2.4} />
                    <Text className="text-white text-xs font-bold">{a.detalhe}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setCurtidas((atual) => ({ ...atual, [a.id]: !atual[a.id] }))}
                    activeOpacity={0.7}
                    className="flex-row items-center"
                    style={{
                      gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 12, borderWidth: 1,
                      borderColor: curtiu ? 'rgba(0,209,255,0.5)' : colors.line,
                      backgroundColor: curtiu ? 'rgba(0,209,255,0.12)' : 'transparent',
                    }}
                  >
                    <Heart color={curtiu ? colors.cyan : colors.muted} size={15} strokeWidth={2.2} fill={curtiu ? colors.cyan : 'transparent'} />
                    <Text style={{ color: curtiu ? colors.cyan : colors.muted, fontWeight: '800', fontSize: 12 }}>{a.curtidas + (curtiu ? 1 : 0)}</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
