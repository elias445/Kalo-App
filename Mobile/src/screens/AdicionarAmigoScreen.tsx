import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AtSign, Check, Send, Share2, UserPlus } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Field from '../components/Field';
import HeroCard from '../components/HeroCard';
import { GradientButton } from '../components/Buttons';
import { Avatar, BackButton, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { SUGESTOES } from '../data/comunidade';
import { colors } from '../theme';

export default function AdicionarAmigoScreen() {
  const navigation = useNavigation();
  const { perfil, amigos, adicionarAmigo } = useApp();
  const [usuario, setUsuario] = useState('');

  const codigo = `${perfil.nome.trim().split(' ')[0].toUpperCase().slice(0, 5)}-4821`;
  const jaConvidado = (u: string) => amigos.some((a) => a.usuario === u);

  const compartilhar = async () => {
    try {
      await Share.share({ message: `Vem treinar comigo no Kalo! Use meu código ${codigo} para entrar no meu desafio.` });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente novamente em instantes.');
    }
  };

  const enviar = () => {
    const limpo = usuario.trim().replace(/^@/, '').toLowerCase();
    if (!limpo) {
      Alert.alert('Informe o usuário', 'Digite o @usuário do seu amigo.');
      return;
    }
    if (jaConvidado(limpo)) {
      Alert.alert('Já adicionado', 'Esse usuário já está na sua lista de amigos.');
      return;
    }
    adicionarAmigo(limpo, limpo);
    setUsuario('');
    Alert.alert('Convite enviado', `@${limpo} vai receber o seu convite.`);
  };

  return (
    <Screen>
      <View className="flex-row mb-6">
        <BackButton />
      </View>

      <SectionLabel dot>Comunidade</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2 mb-6">Adicionar amigo</Text>

      <HeroCard style={{ marginBottom: 24 }} contentStyle={{ alignItems: 'center' }}>
        <Text className="text-muted text-[11px] font-bold" style={{ letterSpacing: 1.6 }}>SEU CÓDIGO DE CONVITE</Text>
        <Text className="text-white font-extrabold mt-3 mb-5" style={{ fontSize: 32, letterSpacing: 3 }} numberOfLines={1}>{codigo}</Text>
        <View className="w-full">
          <GradientButton label="Compartilhar convite" onPress={compartilhar} icon={<Share2 color="#FFFFFF" size={18} strokeWidth={2.4} />} />
        </View>
      </HeroCard>

      <View className="mb-3">
        <SectionLabel tone="muted">Buscar por usuário</SectionLabel>
      </View>
      <View className="flex-row items-center mb-8" style={{ gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field
            icon={AtSign}
            placeholder="usuario"
            value={usuario}
            onChangeText={setUsuario}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={enviar}
          />
        </View>
        <TouchableOpacity
          onPress={enviar}
          activeOpacity={0.8}
          className="items-center justify-center"
          style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(0,209,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.4)' }}
        >
          <Send color={colors.cyan} size={20} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      <View className="mb-3">
        <SectionLabel tone="muted">Sugestões</SectionLabel>
      </View>
      <View style={{ gap: 10 }}>
        {SUGESTOES.map((s) => {
          const enviado = jaConvidado(s.usuario);
          return (
            <Card key={s.usuario} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
              <Avatar nome={s.nome} size={46} />
              <View className="flex-1 mx-3">
                <Text className="text-white font-bold text-base" numberOfLines={1}>{s.nome}</Text>
                <Text className="text-muted text-xs mt-0.5">@{s.usuario}</Text>
              </View>
              <TouchableOpacity
                disabled={enviado}
                onPress={() => adicionarAmigo(s.nome, s.usuario)}
                activeOpacity={0.8}
                className="flex-row items-center"
                style={{
                  gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 12, borderWidth: 1,
                  borderColor: enviado ? 'rgba(34,197,94,0.45)' : 'rgba(0,209,255,0.4)',
                  backgroundColor: enviado ? 'rgba(34,197,94,0.10)' : 'rgba(0,209,255,0.10)',
                }}
              >
                {enviado ? <Check color={colors.ok} size={15} strokeWidth={3} /> : <UserPlus color={colors.cyan} size={15} strokeWidth={2.4} />}
                <Text style={{ color: enviado ? colors.ok : colors.cyan, fontWeight: '800', fontSize: 12 }}>{enviado ? 'Enviado' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
