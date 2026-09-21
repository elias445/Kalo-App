import "./global.css";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Dumbbell, Utensils, User } from 'lucide-react-native';

// Telas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import ResumoRefeicoesScreen from './src/screens/ResumoRefeicoesScreen';
import PesquisaAlimentosScreen from './src/screens/PesquisaAlimentosScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import CronogramaTreinoScreen from './src/screens/CronogramaTreinoScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Home color={color} size={30} strokeWidth={1.5} />, 
        }}
      />
      <Tab.Screen 
        name="Treino" 
        component={CronogramaTreinoScreen} 
        options={{ 
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={30} strokeWidth={1.5} />, 
        }}
      />
      <Tab.Screen 
        name="DiarioTab" 
        component={DiarioStack} 
        options={{ 
          tabBarIcon: ({ color }) => <Utensils color={color} size={30} strokeWidth={1.5} />, 
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilScreen} 
         options={{ 
          tabBarIcon: ({ color }) => <User color={color} size={30} strokeWidth={1.5} />, 
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={AppTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}