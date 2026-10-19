import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';

// Tela de login
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const navigation = useNavigation();

  const { iniciarSessao } = useApp();

  // Valida os campos, chama a API e segue para o app ou para o onboarding
  const handleLogin = async () => {
    if (!email.trim() || !senha) {
      Alert.alert('Campos vazios', 'Preencha o e-mail e a senha.');
      return;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('E-mail inválido', 'Por favor, digite um e-mail em formato válido.');
      return;
    }

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.toLowerCase().trim(), 
          senha: senha 
        })
      });

      const data = await response.json();

      if (response.ok) {
        await iniciarSessao(data.usuario, data.token);
        if (data.usuario.onboarding_completo) {
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
        } else {
          navigation.navigate('Onboarding' as never);
        }
      } else {
        const mensagemErro = Array.isArray(data.detail) 
          ? 'Formato de dados inválido. Verifique o e-mail.' 
          : (data.detail || 'Email ou senha incorretos.');
          
        Alert.alert('Acesso negado', mensagemErro);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    }
  };

  // Aviso para recursos ainda não implementados
  const emBreve = (recurso: string) => Alert.alert('Em breve', `${recurso} estará disponível nas próximas versões.`);

  return (
    <Screen contentStyle={{ flexGrow: 1, justifyContent: 'center' }}>
      <View className="items-center mb-10">
        <View className="flex-row items-end mt-6">
          <Text className="text-white text-5xl font-extrabold" style={{ letterSpacing: -1 }}>Kalo</Text>
        </View>
        <Text className="text-muted text-xs font-bold mt-2" style={{ letterSpacing: 2.5 }}>PERFORMANCE & NUTRIÇÃO</Text>
      </View>

      <View style={{ gap: 18 }}>
        <Field
          label="Email"
          icon={Mail}
          placeholder="seu.email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Field
          label="Senha"
          icon={Lock}
          placeholder="••••••••"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!verSenha}
          autoCapitalize="none"
          labelRight={
            <TouchableOpacity onPress={() => emBreve('A recuperação de senha')}>
              <Text className="text-cyan text-xs font-bold">Esqueceu a senha?</Text>
            </TouchableOpacity>
          }
          right={
            <TouchableOpacity onPress={() => setVerSenha((v) => !v)} hitSlop={10}>
              {verSenha ? <EyeOff color={colors.dim} size={20} /> : <Eye color={colors.dim} size={20} />}
            </TouchableOpacity>
          }
        />

        <View className="mt-2">
          <GradientButton label="Entrar" onPress={handleLogin} icon={<ArrowRight color="#FFFFFF" size={20} strokeWidth={2.5} />} />
        </View>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Cadastro' as never)} className="items-center mt-10 py-2">
        <Text className="text-muted text-sm">
          Não possui uma conta? <Text className="text-cyan font-bold">Cadastre-se aqui</Text>
        </Text>
      </TouchableOpacity>
    </Screen>
  );
}
