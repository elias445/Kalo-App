import "./global.css";
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

export default function App() {

  const [telaAtual, setTelaAtual] = useState('login');

  return (
    <View className="flex-1">
      
      {telaAtual === 'login' ? <LoginScreen /> : <OnboardingScreen />}

      <TouchableOpacity 
        onPress={() => setTelaAtual(telaAtual === 'login' ? 'onboarding' : 'login')}
        className="absolute bottom-5 right-5 bg-blue-600 p-4 rounded-full shadow-lg z-50"
      >
        <Text className="text-white font-bold">
          Trocar Tela
        </Text>
      </TouchableOpacity>
      
    </View>
  );
}