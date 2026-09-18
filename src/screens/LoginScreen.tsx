import React, { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    console.log('Login efetuado com:', email);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#13151A] justify-center px-6 w-full"
    >
      
      <View className="items-center mb-12">
        <Text className="text-[#00C2FF] text-5xl font-extrabold tracking-wider">
          Kalo
        </Text>
      </View>

      <View className="flex flex-col gap-4 w-full">
        <Text className="text-white text-base font-bold mb-2">Entrar</Text>

        
        <View>
          <Text className="text-gray-400 text-xs font-medium mb-1 ml-1">Email</Text>
          <TextInput
            className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white text-base"
            placeholder="E-mail"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        
        <View className="mt-2">
          <Text className="text-gray-400 text-xs font-medium mb-1 ml-1">Senha</Text>
          <TextInput
            className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white text-base"
            placeholder="********"
            placeholderTextColor="#555"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          className="w-full h-12 bg-[#00C2FF] rounded-full items-center justify-center mt-6 active:bg-[#009FCC]"
        >
          <Text className="text-[#13151A] font-bold text-lg">Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-4">
          <Text className="text-gray-400 text-sm">Criar conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}