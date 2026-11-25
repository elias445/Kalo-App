import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import Screen from '../components/Screen';
import Field from '../components/Field';
import { GradientButton } from '../components/Buttons';
import { colors } from '../theme';
import { useApp } from '../context/AppContext';
import { getApiUrl, setApiUrl, resetApiUrl } from '../config/api';

// Tela de login
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const navigation = useNavigation();

  const { iniciarSessao, biometriaHabilitada, habilitarBiometria } = useApp();

  // Estados para o Modal oculto de configuração de IP / API URL
  const [modalApiVisible, setModalApiVisible] = useState(false);
  const [tapsCount, setTapsCount] = useState(0);
  const [inputUrl, setInputUrl] = useState(getApiUrl());
  const [testando, setTestando] = useState(false);

  const handleTitleTap = () => {
    const next = tapsCount + 1;
    if (next >= 5) {
      setInputUrl(getApiUrl());
      setModalApiVisible(true);
      setTapsCount(0);
    } else {
      setTapsCount(next);
    }
  };

  const handleTestConnection = async () => {
    setTestando(true);
    try {
      const target = inputUrl.trim().replace(/\/+$/, '');
      const res = await fetch(`${target}/`, { method: 'GET' });
      if (res.ok || res.status < 500) {
        Alert.alert('Sucesso!', 'Conexão estabelecida com o servidor!');
      } else {
        Alert.alert('Atenção', `O servidor respondeu com status ${res.status}.`);
      }
    } catch {
      Alert.alert('Erro de Conexão', 'Não foi possível alcançar o endereço informado.');
    } finally {
      setTestando(false);
    }
  };

  const handleSaveApi = async () => {
    await setApiUrl(inputUrl);
    setModalApiVisible(false);
    Alert.alert('URL Atualizada', 'Endereço da API atualizado com sucesso!');
  };

  const handleResetApi = async () => {
    await resetApiUrl();
    setInputUrl(getApiUrl());
    setModalApiVisible(false);
    Alert.alert('Restaurado', 'URL padrão restaurada com sucesso!');
  };

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
      const API_URL = getApiUrl();
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
        await iniciarSessao(data.usuario, data.token, data.refresh_token);

        // Oferece ativar biometria no primeiro login (se ainda não habilitada)
        if (!biometriaHabilitada) {
          Alert.alert(
            'Desbloquear com biometria',
            'Deseja usar digital ou Face ID para abrir o Kalo nas próximas vezes?',
            [
              { text: 'Agora não', style: 'cancel' },
              { text: 'Ativar', onPress: habilitarBiometria },
            ]
          );
        }

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
        <TouchableOpacity onPress={handleTitleTap} activeOpacity={0.9}>
          <View className="flex-row items-end mt-6">
            <Text className="text-white text-5xl font-extrabold" style={{ letterSpacing: -1 }}>Kalo</Text>
          </View>
        </TouchableOpacity>
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

      <Modal
        visible={modalApiVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalApiVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.line }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Configurar URL da API</Text>
            <Text style={{ color: colors.muted, fontSize: 13, marginBottom: 16 }}>Digite o endereço IP e porta do backend (ex: http://192.168.1.50:8000):</Text>
            
            <TextInput
              style={{ backgroundColor: colors.ink, color: '#FFFFFF', borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 }}
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="http://192.168.X.X:8000"
              placeholderTextColor={colors.dim}
            />

            <View style={{ gap: 10 }}>
              <TouchableOpacity onPress={handleTestConnection} style={{ backgroundColor: 'rgba(0, 209, 255, 0.15)', borderWidth: 1, borderColor: colors.cyan, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.cyan, fontWeight: 'bold' }}>{testando ? 'Testando...' : 'Testar Conexão'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSaveApi} style={{ backgroundColor: colors.cyan, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.ink, fontWeight: 'bold' }}>Salvar URL</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResetApi} style={{ backgroundColor: 'rgba(244,63,94,0.15)', borderWidth: 1, borderColor: colors.danger, borderRadius: 10, padding: 12, alignItems: 'center' }}>
                <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Restaurar Padrão</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalApiVisible(false)} style={{ padding: 10, alignItems: 'center', marginTop: 4 }}>
                <Text style={{ color: colors.muted }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
