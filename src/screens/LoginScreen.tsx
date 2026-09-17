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
      className="flex-1 bg-[#121212] justify-center px-6 w-full"
    >
      <View className="items-center mb-10">
        <Text className="text-white text-5xl font-extrabold tracking-wider">
          Kalo
        </Text>
      </View>

     
      <View className="flex flex-col gap-4 w-full">
        
        <View>
          <Text className="text-white text-sm font-medium mb-2 ml-1">Email</Text>
          <TextInput
            className="w-full h-12 bg-[#1e1e1e] border border-[#333] rounded-xl px-4 text-white text-base"
            placeholder="Digite seu email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        
        <View className="mt-4">
          <Text className="text-white text-sm font-medium mb-2 ml-1">Senha</Text>
          <TextInput
            className="w-full h-12 bg-[#1e1e1e] border border-[#333] rounded-xl px-4 text-white text-base"
            placeholder="Digite sua senha"
            placeholderTextColor="#777"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        
        <TouchableOpacity 
          onPress={handleLogin}
          className="w-full h-12 bg-white rounded-xl items-center justify-center mt-8 shadow-md active:bg-gray-200"
        >
          <Text className="text-black font-bold text-base">Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}