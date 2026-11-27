import React, { useEffect, useState } from 'react';
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

// Texto de cada nível de força da senha
const ROTULOS = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
// Cor de cada nível de força da senha
const CORES = ['', colors.danger, '#F59E0B', colors.cyan, colors.ok];

// Situação do @usuário digitado
type SituacaoUsuario = 'vazio' | 'curto' | 'verificando' | 'livre' | 'ocupado' | 'erro';

// Deixa só o que vale num @usuário: minúsculas, números, ponto e sublinhado (o @ já está fixo no campo)
const limparUsuario = (texto: string) => texto.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 20);

// Tela de cadastro
export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState('');
  const [situacaoUsuario, setSituacaoUsuario] = useState<SituacaoUsuario>('vazio');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const navigation = useNavigation();
  const { iniciarSessao } = useApp();

  const forca = senha ? avaliarSenha(senha) : 0;

  // Confere com o servidor, enquanto a pessoa digita, se o @usuário está livre
  useEffect(() => {
    if (!usuario) return setSituacaoUsuario('vazio');
    if (usuario.length < 3) return setSituacaoUsuario('curto');
    setSituacaoUsuario('verificando');
    let atual = true;
    const espera = setTimeout(async () => {
      try {
        const API_URL = process.env.EXPO_PUBLIC_API_URL;
        const resposta = await fetch(`${API_URL}/usuarios/disponivel?usuario=${encodeURIComponent(usuario)}`);
        const dados = await resposta.json();
        if (atual) setSituacaoUsuario(dados.disponivel ? 'livre' : 'ocupado');
      } catch {
        if (atual) setSituacaoUsuario('erro');
      }
    }, 400);
    return () => { atual = false; clearTimeout(espera); };
  }, [usuario]);

  // Mensagem e cor embaixo do campo de usuário
  const aviso = {
    vazio: { texto: 'De 3 a 20 caracteres: letras, números, ponto ou sublinhado. Não dá para trocar depois.', cor: colors.dim },
    curto: { texto: 'Use pelo menos 3 caracteres.', cor: colors.dim },
    verificando: { texto: 'Verificando...', cor: colors.dim },
    livre: { texto: 'Esse usuário está disponível.', cor: colors.ok },
    ocupado: { texto: 'Esse usuário já está em uso. Tente outro.', cor: colors.danger },
    erro: { texto: 'Não foi possível verificar agora. Confira a conexão.', cor: colors.danger },
  }[situacaoUsuario];

  // Valida os dados e cria a conta pela API
  const handleCadastro = async () => {
    if (!nome.trim() || !usuario || !email.trim() || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos para continuar.');
      return;
    }
    if (usuario.length < 3) {
      Alert.alert('Usuário inválido', 'Escolha um usuário com pelo menos 3 caracteres.');
      return;
    }
    if (situacaoUsuario === 'ocupado') {
      Alert.alert('Usuário em uso', 'Esse @usuário já existe. Escolha outro.');
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

    try {
      const API_URL = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/usuarios/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: nome.trim(),
          usuario,
          email: email.toLowerCase().trim(),
          senha: senha
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Cadastro de sucesso! Token:", data.token);
        await iniciarSessao(data.usuario, data.token, data.refresh_token);
      } else {
        Alert.alert('Erro no cadastro', data.detail || 'Não foi possível criar a conta.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    }
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

        <View>
          <Field
            label="Usuário"
            prefixo="@"
            placeholder="seu.usuario"
            value={usuario}
            onChangeText={(texto) => setUsuario(limparUsuario(texto))}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text className="text-xs mt-2 px-1" style={{ color: aviso.cor }}>{aviso.texto}</Text>
        </View>

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
