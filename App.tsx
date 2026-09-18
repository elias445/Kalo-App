import "./global.css";
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Telas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ResumoRefeicoesScreen from './src/screens/ResumoRefeicoesScreen';
import PesquisaAlimentosScreen from './src/screens/PesquisaAlimentosScreen';
import PerfilScreen from './src/screens/PerfilScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DummyScreen() {
  return <View className="flex-1 bg-[#13151A]" />;
}

function DiarioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      <Stack.Screen name="ResumoRefeicoes" component={ResumoRefeicoesScreen} />
      
      <Stack.Screen name="PesquisaAlimentos" component={PesquisaAlimentosScreen} />
    </Stack.Navigator>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1C1F26',
          borderTopColor: '#2A2E39',
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#00C2FF',
        tabBarInactiveTintColor: '#555',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🏠</Text>, tabBarLabel: 'Início' }}
      />
      
      <Tab.Screen 
        name="DiarioTab" 
        component={DiarioStack} 
        options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🍽️</Text>, tabBarLabel: 'Diário' }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
         options={{ tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>👤</Text>, tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('home');

  const ciclarTela = () => {
    if (telaAtual === 'login') setTelaAtual('onboarding');
    else if (telaAtual === 'onboarding') setTelaAtual('home');
    else setTelaAtual('login');
  };

  return (
    <View className="flex-1 bg-[#13151A]">
      {telaAtual === 'login' && <LoginScreen />}
      {telaAtual === 'onboarding' && <OnboardingScreen />}
      
      {telaAtual === 'home' && (
        <NavigationContainer>
          <AppTabs />
        </NavigationContainer>
      )}

      <TouchableOpacity 
        onPress={ciclarTela}
        className="absolute bottom-24 right-5 bg-[#00C2FF] p-4 rounded-full shadow-lg z-50"
      >
        <Text className="text-[#13151A] font-bold">Trocar Tela</Text>
      </TouchableOpacity>
    </View>
  );
}