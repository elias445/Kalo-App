import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, Mail, Lock, ArrowRight } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { BackButton, SectionLabel } from '../components/UI';
import { useApp } from '../context/AppContext';
import { colors } from '../theme';

// Força da senha: 1 ponto para cada critério atendido
const avaliarSenha = (senha: string) => {
  let pontos = 0;
  if (senha.length >= 6) pontos++;
  if (senha.length >= 10) pontos++;
  if (/[A-Z]/.test(senha) && /[a-z]/.test(senha)) pontos++;
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) pontos++;
  return pontos;
};

const ROTULOS = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const CORES = ['', colors.danger, '#F59E0B', colors.cyan, colors.ok];

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigation = useNavigation();
  const { atualizarPerfil } = useApp();

  const forca = senha ? avaliarSenha(senha) : 0;

  const handleCadastro = () => {
    if (!nome.trim() || !email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('E-mail inválido', 'Informe um e-mail válido.');
      return;
    }
    if (senha.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert('Senhas diferentes', 'A confirmação de senha não confere.');
      return;
    }
    atualizarPerfil({ nome: nome.trim() });
    navigation.navigate('Onboarding' as never);
  };

  return (
    <Screen>
      <View className="flex-row mb-8">
        <BackButton />
      </View>

      <SectionLabel dot>Comece agora</SectionLabel>
      <Text className="text-white text-3xl font-extrabold mt-2">Crie sua conta</Text>
      <Text className="text-muted text-sm mt-2 mb-8">
        Leva menos de um minuto para montar seu plano de treino e nutrição.
      </Text>

      <View style={{ gap: 18 }}>
        <Field label="Nome" icon={User} placeholder="Seu nome" value={nome} onChangeText={setNome} />
        <Field
          label="Email"
          icon={Mail}
          placeholder="seu.email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View>
          <Field label="Senha" icon={Lock} placeholder="Mínimo 6 caracteres" value={senha} onChangeText={setSenha} secureTextEntry autoCapitalize="none" />
          {senha.length > 0 && (
            <View className="flex-row items-center mt-3 px-1" style={{ gap: 6 }}>
              {[1, 2, 3, 4].map((n) => (
                <View
                  key={n}
                  style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= forca ? CORES[forca] : 'rgba(255,255,255,0.08)' }}
                />
              ))}
              <Text className="text-xs font-bold ml-2" style={{ color: CORES[forca] || colors.muted, minWidth: 62, textAlign: 'right' }}>
                {ROTULOS[forca] || 'Muito fraca'}
              </Text>
            </View>
          )}
        </View>

        <Field
          label="Confirmar senha"
          icon={Lock}
          placeholder="Repita a senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          autoCapitalize="none"
        />

        <View className="mt-2">
          <GradientButton label="Criar conta" onPress={handleCadastro} icon={<ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />} />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} className="items-center mt-8 py-2">
        <Text className="text-muted text-sm">
          Já tem conta? <Text style={{ color: colors.cyan, fontWeight: '700' }}>Entrar</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
