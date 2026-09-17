import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#1a1a1a]">
      <ScrollView className="flex-1 px-6 pt-12">
        

        <Text className="text-white text-2xl font-bold mb-8">Dados Biométricos</Text>

        <View className="flex flex-col gap-6 mb-12">
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg">Sexo</Text>
            <TouchableOpacity className="bg-white rounded-xl w-32 h-10 px-3 flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm"></Text>
              <Text className="text-gray-800 text-xs">▼</Text>
            </TouchableOpacity>
          </View>

          
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg">Idade</Text>
            <TextInput
              className="bg-white rounded-xl w-32 h-10 px-3 text-black text-center text-base"
              keyboardType="numeric"
            />
          </View>

          
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg">Altura (cm)</Text>
            <TextInput
              className="bg-white rounded-xl w-32 h-10 px-3 text-black text-center text-base"
              keyboardType="numeric"
            />
          </View>

          
          <View className="flex-row justify-between items-center">
            <Text className="text-white text-lg">Peso (kg)</Text>
            <TextInput
              className="bg-white rounded-xl w-32 h-10 px-3 text-black text-center text-base"
              keyboardType="numeric"
            />
          </View>
        </View>

        
        <Text className="text-white text-2xl font-bold mb-4">Qual o seu objetivo?</Text>
        <TouchableOpacity className="bg-white rounded-xl w-full h-12 px-4 flex-row justify-between items-center mb-10">
          <Text className="text-gray-500"></Text>
          <Text className="text-gray-800 text-xs">▼</Text>
        </TouchableOpacity>

        
        <TouchableOpacity className="w-full h-14 bg-[#3a3a3a] rounded-xl items-center justify-center active:bg-[#4a4a4a]">
          <Text className="text-white font-bold text-lg">Gerar plano de treino</Text>
        </TouchableOpacity>
        
    
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}