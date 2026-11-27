import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Hash, Send, Share2, UserPlus } from 'lucide-react-native';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Field from '../components/Field';
import HeroCard from '../components/HeroCard';
import { GradientButton } from '../components/Buttons';
import { Avatar, BackButton, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { PessoaBusca } from '../data/comunidade';
import { apiFetch } from '../services/api';
import { colors } from '../theme';

// Deixa só o que vale num @usuário (o @ já está fixo no campo)
const limparUsuario = (texto: string) => texto.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20);

// Tela para convidar amigos por @usuário (com busca) ou por código de convite
export default function AdicionarAmigoScreen() {
  const { amizades, carregarComunidade, convidarAmigo } = useApp();
  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState<PessoaBusca[]>([]);
  const [codigo, setCodigo] = useState('');

  // Garante o código e o @usuário atualizados ao abrir a tela
  useFocusEffect(useCallback(() => { carregarComunidade(); }, [carregarComunidade]));

  const meuCodigo = amizades.eu?.codigo_convite ?? '------';
  const meuUsuario = amizades.eu?.usuario;

  // Procura pessoas pelo começo do @usuário enquanto a pessoa digita
  useEffect(() => {
    if (busca.length < 2) {
      setResultados([]);
      return;
    }
    let atual = true;
    const espera = setTimeout(async () => {
      try {
        const lista = await apiFetch(`/amigos/buscar?q=${encodeURIComponent(busca)}`);
        if (atual) setResultados(Array.isArray(lista) ? lista : []);
      } catch {
        if (atual) setResultados([]);
      }
    }, 350);
    return () => { atual = false; clearTimeout(espera); };
  }, [busca]);

  // Abre o menu de compartilhar do celular
  const compartilhar = async () => {
    try {
      await Share.share({
        message: `Vem treinar comigo no Kalo! Me adicione pelo @${meuUsuario ?? 'usuario'} ou use o código ${meuCodigo}.`,
      });
    } catch {
      Alert.alert('Não foi possível compartilhar', 'Tente novamente em instantes.');
    }
  };

  // Envia o convite para quem foi escolhido na busca
  const convidar = async (pessoa: PessoaBusca) => {
    const resultado = await convidarAmigo({ usuario: pessoa.usuario });
    if (!resultado.ok) {
      Alert.alert('Não foi possível convidar', resultado.erro ?? 'Verifique a conexão e tente de novo.');
      return;
    }
    setResultados((atual) => atual.filter((p) => p.id !== pessoa.id));
    Alert.alert('Convite enviado', `@${pessoa.usuario} vai ver o seu convite na aba Amigos.`);
  };

  // Envia o convite pelo código que o amigo compartilhou
  const usarCodigo = async () => {
    const limpo = codigo.trim().toUpperCase();
    if (limpo.length < 4) {
      Alert.alert('Informe o código', 'Digite o código de convite do seu amigo.');
      return;
    }
    const resultado = await convidarAmigo({ codigo: limpo });
    if (!resultado.ok) {
      Alert.alert('Não foi possível convidar', resultado.erro ?? 'Verifique a conexão e tente de novo.');
      return;
    }
    setCodigo('');
    Alert.alert('Convite enviado', 'Seu amigo vai ver o convite na aba Amigos.');
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
        <Text className="text-white font-extrabold mt-3" style={{ fontSize: 32, letterSpacing: 4 }} numberOfLines={1}>{meuCodigo}</Text>
        {meuUsuario ? <Text className="text-muted text-sm mt-1 mb-5">ou @{meuUsuario}</Text> : <View className="mb-5" />}
        <View className="w-full">
          <GradientButton label="Compartilhar convite" onPress={compartilhar} icon={<Share2 color="#FFFFFF" size={18} strokeWidth={2.4} />} />
        </View>
      </HeroCard>

      <View className="mb-3">
        <SectionLabel tone="muted">Buscar por usuário</SectionLabel>
      </View>
      <Field
        prefixo="@"
        placeholder="usuario"
        value={busca}
        onChangeText={(texto) => setBusca(limparUsuario(texto))}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={{ gap: 10 }} className="mt-3 mb-8">
        {busca.length >= 2 && resultados.length === 0 && (
          <Text className="text-muted text-sm px-1">Ninguém encontrado com esse começo de @usuário.</Text>
        )}
        {resultados.map((p) => (
          <Card key={p.id} className="flex-row items-center px-4 py-3.5 rounded-[22px]">
            <Avatar nome={p.nome} size={46} />
            <View className="flex-1 mx-3">
              <Text className="text-white font-bold text-base" numberOfLines={1}>{p.nome}</Text>
              <Text className="text-muted text-xs mt-0.5">@{p.usuario}</Text>
            </View>
            <TouchableOpacity
              onPress={() => convidar(p)}
              activeOpacity={0.8}
              className="flex-row items-center"
              style={{ gap: 6, paddingHorizontal: 14, height: 38, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,209,255,0.4)', backgroundColor: 'rgba(0,209,255,0.10)' }}
            >
              <UserPlus color={colors.cyan} size={15} strokeWidth={2.4} />
              <Text style={{ color: colors.cyan, fontWeight: '800', fontSize: 12 }}>Adicionar</Text>
            </TouchableOpacity>
          </Card>
        ))}
      </View>

      <View className="mb-3">
        <SectionLabel tone="muted">Tenho um código de convite</SectionLabel>
      </View>
      <View className="flex-row items-center" style={{ gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field
            icon={Hash}
            placeholder="CÓDIGO"
            value={codigo}
            onChangeText={(texto) => setCodigo(texto.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
            autoCapitalize="characters"
            autoCorrect={false}
            onSubmitEditing={usarCodigo}
          />
        </View>
        <TouchableOpacity
          onPress={usarCodigo}
          activeOpacity={0.8}
          className="items-center justify-center"
          style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(0,209,255,0.12)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.4)' }}
        >
          <Send color={colors.cyan} size={20} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
