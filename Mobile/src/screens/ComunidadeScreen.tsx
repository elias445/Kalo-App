import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Trophy, UserPlus, Crown, Flame, Heart, Swords, Users, Dumbbell, Target, Check, X } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import HeroCard from '../components/HeroCard';
import { OutlineButton } from '../components/Buttons';
import { Avatar, Badge, Chip, IconButton, IconTile, MiniTile, ProgressBar, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { LinhaRanking, Pessoa, REGRAS_PONTOS, haQuantoTempo } from '../data/comunidade';
import { colors } from '../theme';

// Abas da tela
type Aba = 'Ranking' | 'Amigos' | 'Atividade';
const ABAS: Aba[] = ['Ranking', 'Amigos', 'Atividade'];

// Cores de ouro, prata e bronze
const MEDALHAS = ['#F5B301', '#B8C1D1', '#D98A4E'];

// Formata número com ponto de milhar
const milhar = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// Botões de aceitar e recusar de um convite
function RespostaConvite({ onAceitar, onRecusar }: { onAceitar: () => void; onRecusar: () => void }) {
  return (
    <View className="flex-row items-center" style={{ gap: 8 }}>
      <TouchableOpacity
        onPress={onRecusar}
        activeOpacity={0.8}
        className="items-center justify-center"
        style={{ width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: colors.line }}
      >
        <X color={colors.muted} size={16} strokeWidth={2.6} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onAceitar}
        activeOpacity={0.8}
        className="flex-row items-center"
        style={{ gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,209,255,0.45)', backgroundColor: 'rgba(0,209,255,0.12)' }}
      >
        <Check color={colors.cyan} size={15} strokeWidth={3} />
        <Text style={{ color: colors.cyan, fontWeight: '800', fontSize: 12 }}>Aceitar</Text>
      </TouchableOpacity>
    </View>
  );
}

// Pódio com os 3 primeiros do ranking
function Podio({ posicoes }: { posicoes: LinhaRanking[] }) {
  // Ordem visual: 2º, 1º e 3º
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

// Tela da Comunidade: desafios, ranking, amigos e atividades
export default function ComunidadeScreen() {
  const navigation = useNavigation<any>();
  const {
    amizades, desafios, feed, carregarComunidade, carregarRanking, curtirAtividade,
    responderConviteAmizade, removerAmizade, responderConviteDesafio,
  } = useApp();
  const [aba, setAba] = useState<Aba>('Ranking');
  const [desafioId, setDesafioId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<LinhaRanking[] | null>(null);

  // Atualiza amigos, desafios e feed sempre que a aba é aberta
  useFocusEffect(useCallback(() => { carregarComunidade(); }, [carregarComunidade]));

  // Desafio que aparece no topo (o escolhido ou o mais recente)
  const selecionado = desafios.ativos.find((d) => d.id === desafioId) ?? desafios.ativos[0];

  // Carrega o ranking do desafio mostrado
  useEffect(() => {
    if (!selecionado) {
      setRanking([]);
      return;
    }
    let atual = true;
    carregarRanking(selecionado.id).then((linhas) => { if (atual) setRanking(linhas ?? []); });
    return () => { atual = false; };
  }, [selecionado?.id, desafios, carregarRanking]);

  const posicoes = ranking ?? [];
  const restantes = posicoes.slice(3);
  const progressoDias = selecionado ? selecionado.dia_atual / selecionado.duracao_dias : 0;

  // Pede confirmação antes de desfazer a amizade
  const confirmarRemocao = (p: Pessoa) =>
    Alert.alert('Desfazer amizade?', `${p.nome} (@${p.usuario}) sai da sua lista de amigos e deixa de ver suas atividades.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desfazer', style: 'destructive', onPress: () => removerAmizade(p.amizade_id) },
    ]);

  // Abre a criação de desafio (só dá para convidar amigos, então avisa se ainda não há nenhum)
  const novoDesafio = () => {
    if (amizades.amigos.length === 0) {
      Alert.alert('Adicione um amigo primeiro', 'Um desafio é entre amigos. Convide alguém e espere o convite ser aceito.', [
        { text: 'Agora não', style: 'cancel' },
        { text: 'Adicionar amigo', onPress: () => navigation.navigate('AdicionarAmigo') },
      ]);
      return;
    }
    navigation.navigate('NovoDesafio');
  };

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

      {desafios.convites.length > 0 && (
        <View className="mb-5" style={{ gap: 10 }}>
          <SectionLabel tone="muted">Convites para desafios</SectionLabel>
          {desafios.convites.map((d) => (
            <Card key={d.id} highlight className="flex-row items-center px-4 py-3.5 rounded-[22px]">
              <IconTile size={44}>
                <Swords color={colors.cyan} size={20} strokeWidth={2} />
              </IconTile>
              <View className="flex-1 mx-3">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{d.nome}</Text>
                <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>{d.criador} • {d.duracao_dias} dias</Text>
              </View>
              <RespostaConvite
                onAceitar={() => responderConviteDesafio(d.id, true)}
                onRecusar={() => responderConviteDesafio(d.id, false)}
              />
            </Card>
          ))}
        </View>
      )}

      {desafios.ativos.length > 1 && (
        <View className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
          {desafios.ativos.map((d) => (
            <Chip key={d.id} label={d.nome} selected={d.id === selecionado?.id} onPress={() => setDesafioId(d.id)} ajustar />
          ))}
        </View>
      )}

      <HeroCard style={{ marginBottom: 20 }}>
        <View style={{ position: 'absolute', right: -8, top: -12, opacity: 0.1 }}>
          <Trophy color="#FFFFFF" size={120} strokeWidth={1.4} />
        </View>
        {selecionado ? (
          <>
            <View className="flex-row items-center justify-between">
              <SectionLabel dot>Desafio ativo</SectionLabel>
              <Badge
                tone={selecionado.encerrado ? 'muted' : 'cyan'}
                label={selecionado.encerrado ? 'Encerrado' : `Dia ${selecionado.dia_atual} de ${selecionado.duracao_dias}`}
              />
            </View>
            <Text className="text-white font-extrabold mt-3" style={{ fontSize: 26, lineHeight: 32 }}>{selecionado.nome}</Text>
            <View className="mt-4 mb-5">
              <ProgressBar progress={selecionado.encerrado ? 1 : progressoDias} height={6} />
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <IconTile size={48}>
                  <Trophy color={colors.cyan} size={22} strokeWidth={2} />
                </IconTile>
                <View>
                  <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.4 }}>SUA POSIÇÃO</Text>
                  <Text className="text-white font-extrabold text-xl">{selecionado.minha_posicao ?? '-'}º lugar</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.4 }}>PONTOS</Text>
                <Text className="text-cyan font-extrabold text-xl">{milhar(selecionado.meus_pontos ?? 0)}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <SectionLabel dot>Desafio ativo</SectionLabel>
            <Text className="text-white font-extrabold mt-3" style={{ fontSize: 24, lineHeight: 30 }}>Nenhum desafio por enquanto</Text>
            <Text className="text-muted text-sm mt-2">
              Convide amigos e crie um desafio para disputar o ranking de treinos, metas e sequência.
            </Text>
          </>
        )}
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
          {selecionado && posicoes.length > 0 && <Podio posicoes={posicoes} />}

          {restantes.length > 0 && (
            <View style={{ gap: 10 }} className="mb-6">
              {restantes.map((p) => (
                <Card key={p.id} highlight={p.eu} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                  <Text className="text-muted font-extrabold text-base" style={{ width: 28 }}>{p.posicao}</Text>
                  <Avatar nome={p.nome} size={42} anel={p.eu ? colors.cyan : undefined} />
                  <View className="flex-1 mx-3">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>{p.eu ? `${p.nome} (você)` : p.nome}</Text>
                    <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
                      <Dumbbell color={colors.muted} size={11} strokeWidth={2.2} />
                      <Text className="text-muted text-xs">{p.treinos} {p.treinos === 1 ? 'treino' : 'treinos'}</Text>
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
            onPress={novoDesafio}
          />
        </>
      )}

      {aba === 'Amigos' && (
        <>
          {amizades.recebidos.length > 0 && (
            <View className="mb-6" style={{ gap: 10 }}>
              <SectionLabel tone="muted">{`${amizades.recebidos.length} ${amizades.recebidos.length === 1 ? 'convite recebido' : 'convites recebidos'}`}</SectionLabel>
              {amizades.recebidos.map((p) => (
                <Card key={p.amizade_id} highlight className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                  <Avatar nome={p.nome} size={46} />
                  <View className="flex-1 mx-3">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>{p.nome}</Text>
                    <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>@{p.usuario}</Text>
                  </View>
                  <RespostaConvite
                    onAceitar={() => responderConviteAmizade(p.amizade_id, true)}
                    onRecusar={() => responderConviteAmizade(p.amizade_id, false)}
                  />
                </Card>
              ))}
            </View>
          )}

          <View className="mb-3">
            <SectionLabel tone="muted">{`${amizades.amigos.length} ${amizades.amigos.length === 1 ? 'amigo' : 'amigos'}`}</SectionLabel>
          </View>
          {amizades.amigos.length === 0 && amizades.enviados.length === 0 && (
            <Text className="text-muted text-sm mb-6">Você ainda não tem amigos por aqui. Convide alguém pelo @usuário ou pelo seu código de convite.</Text>
          )}
          <View style={{ gap: 10 }} className="mb-6">
            {amizades.amigos.map((p) => (
              <Card key={p.amizade_id} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                <Avatar nome={p.nome} size={46} />
                <View className="flex-1 mx-3">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{p.nome}</Text>
                  <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>@{p.usuario}{p.objetivo ? `  •  ${p.objetivo}` : ''}</Text>
                </View>
                <View className="items-end mr-3">
                  <View className="flex-row items-center" style={{ gap: 4 }}>
                    <Flame color={colors.cyan} size={13} strokeWidth={2.4} />
                    <Text className="text-white font-extrabold text-sm">{p.sequencia}</Text>
                  </View>
                  <Text className="text-muted text-[11px] mt-0.5">{p.treinos} {p.treinos === 1 ? 'treino' : 'treinos'}</Text>
                </View>
                <TouchableOpacity onPress={() => confirmarRemocao(p)} activeOpacity={0.7} hitSlop={8}>
                  <X color={colors.dim} size={18} strokeWidth={2.4} />
                </TouchableOpacity>
              </Card>
            ))}
            {amizades.enviados.map((p) => (
              <Card key={p.amizade_id} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
                <Avatar nome={p.nome} size={46} />
                <View className="flex-1 mx-3">
                  <Text className="text-white font-bold text-base" numberOfLines={1}>{p.nome}</Text>
                  <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>@{p.usuario}</Text>
                </View>
                <Badge tone="muted" label="Convite enviado" />
                <TouchableOpacity onPress={() => removerAmizade(p.amizade_id)} activeOpacity={0.7} hitSlop={8} style={{ marginLeft: 12 }}>
                  <X color={colors.dim} size={18} strokeWidth={2.4} />
                </TouchableOpacity>
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
          {feed.length === 0 && (
            <Text className="text-muted text-sm">
              Nada por aqui ainda. Quando você ou seus amigos concluírem um treino, a atividade aparece neste feed.
            </Text>
          )}
          {feed.map((a) => (
            <Card key={a.id} className="p-4 rounded-[22px]">
              <View className="flex-row items-center">
                <Avatar nome={a.autor} size={44} />
                <View className="flex-1 mx-3">
                  <Text className="text-white text-sm" numberOfLines={2}>
                    <Text className="font-extrabold">{a.minha ? 'Você' : a.autor}</Text> {a.acao}
                  </Text>
                  <Text className="text-muted text-xs mt-0.5">{haQuantoTempo(a.criado_em)}</Text>
                </View>
              </View>
              <View className="flex-row items-center justify-between mt-3">
                <View className="flex-row items-center" style={{ gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.line }}>
                  <Users color={colors.cyan} size={13} strokeWidth={2.4} />
                  <Text className="text-white text-xs font-bold">{a.detalhe}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => curtirAtividade(a.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center"
                  style={{
                    gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 12, borderWidth: 1,
                    borderColor: a.curtiu ? 'rgba(0,209,255,0.5)' : colors.line,
                    backgroundColor: a.curtiu ? 'rgba(0,209,255,0.12)' : 'transparent',
                  }}
                >
                  <Heart color={a.curtiu ? colors.cyan : colors.muted} size={15} strokeWidth={2.2} fill={a.curtiu ? colors.cyan : 'transparent'} />
                  <Text style={{ color: a.curtiu ? colors.cyan : colors.muted, fontWeight: '800', fontSize: 12 }}>{a.curtidas}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
