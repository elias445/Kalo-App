import "./global.css";
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AppProvider } from './src/context/AppContext';
import { colors } from './src/theme';
import TabBar from './src/components/TabBar';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PlanoGeradoScreen from './src/screens/PlanoGeradoScreen';
import ResumoRefeicoesScreen from './src/screens/ResumoRefeicoesScreen';
import PesquisaAlimentosScreen from './src/screens/PesquisaAlimentosScreen';
import DetalheRefeicaoScreen from './src/screens/DetalheRefeicaoScreen';
import DetalheAlimentoScreen from './src/screens/DetalheAlimentoScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import ComunidadeScreen from './src/screens/ComunidadeScreen';
import AdicionarAmigoScreen from './src/screens/AdicionarAmigoScreen';
import NovoDesafioScreen from './src/screens/NovoDesafioScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import RegistrarPesoScreen from './src/screens/RegistrarPesoScreen';
import CronogramaTreinoScreen from './src/screens/CronogramaTreinoScreen';
import EditarExercicioScreen from './src/screens/EditarExercicioScreen';
import TreinoDoDiaScreen from './src/screens/TreinoDoDiaScreen';
import { RefeicoesProvider } from './src/context/RefeicoesContext';

// Navegador em pilha (telas empilhadas)
const Stack = createNativeStackNavigator();
// Navegador de abas (barra inferior)
const Tab = createBottomTabNavigator();

// Tema escuro do Kalo para a navegação
const temaKalo = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.ink,
    card: colors.surface,
    border: colors.line,
    primary: colors.cyan,
  },
};

// Opções comuns das telas: sem cabeçalho e transição suave
const opcoesStack = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.ink },
  animation: 'fade' as const,
};

// Telas da aba Dieta
function DiarioStack() {
  return (
    <Stack.Navigator screenOptions={opcoesStack}>
      <Stack.Screen name="ResumoRefeicoes" component={ResumoRefeicoesScreen} />
      <Stack.Screen name="PesquisaAlimentos" component={PesquisaAlimentosScreen} />
      <Stack.Screen name="DetalheRefeicao" component={DetalheRefeicaoScreen} />
      <Stack.Screen name="DetalheAlimento" component={DetalheAlimentoScreen} />
    </Stack.Navigator>
  );
}

// Abas principais do app
function AppTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.ink } }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Treino" component={CronogramaTreinoScreen} />
      <Tab.Screen name="Comunidade" component={ComunidadeScreen} />
      <Tab.Screen name="DiarioTab" component={DiarioStack} />
      <Tab.Screen name="Perfil" component={PerfilScreen} />
    </Tab.Navigator>
  );
}

// Raiz do app: estados globais e navegação
export default function App() {
  return (
    <AppProvider>
      <RefeicoesProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={temaKalo}>
        {/* Fluxo principal: login, onboarding e app */}
        <Stack.Navigator screenOptions={opcoesStack} initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Cadastro" component={CadastroScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="PlanoGerado" component={PlanoGeradoScreen} />
          <Stack.Screen name="Main" component={AppTabs} />
          <Stack.Screen name="TreinoDoDia" component={TreinoDoDiaScreen} />
          <Stack.Screen name="EditarExercicio" component={EditarExercicioScreen} />
          <Stack.Screen name="RegistrarPeso" component={RegistrarPesoScreen} />
          <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
          <Stack.Screen name="AdicionarAmigo" component={AdicionarAmigoScreen} />
          <Stack.Screen name="NovoDesafio" component={NovoDesafioScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      </RefeicoesProvider>
    </AppProvider>
  );
}
