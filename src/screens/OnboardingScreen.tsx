import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function OnboardingScreen() {
  const [objetivo, setObjetivo] = useState('Emagrecer');

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <ScrollView className="flex-1 px-6 pt-8">
        
        <TouchableOpacity className="mb-6 w-10">
          <Text className="text-gray-400 text-xl font-bold">{'<'}</Text>
        </TouchableOpacity>

        
        <Text className="text-white text-2xl font-bold mb-8">Configure seu Perfil</Text>

        <View className="flex-row flex-wrap justify-between mb-8">
          <View className="w-[48%] mb-4">
            <Text className="text-gray-400 text-xs mb-1 ml-1">Peso</Text>
            <TextInput
              className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
              placeholder="kg"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />
          </View>

          <View className="w-[48%] mb-4">
            <Text className="text-gray-400 text-xs mb-1 ml-1">Altura</Text>
            <TextInput
              className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
              placeholder="cm"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />
          </View>

          
          <View className="w-[48%] mb-4">
            <Text className="text-gray-400 text-xs mb-1 ml-1">Idade</Text>
            <TextInput
              className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
              placeholder="Anos"
              placeholderTextColor="#555"
              keyboardType="numeric"
            />
          </View>

          
          <View className="w-[48%] mb-4">
            <Text className="text-gray-400 text-xs mb-1 ml-1">Sexo</Text>
            <TouchableOpacity className="w-full h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 flex-row justify-between items-center">
              <Text className="text-gray-500 text-sm">Selecione</Text>
              <Text className="text-gray-400 text-xs">▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        
        <View className="flex flex-col gap-3 mb-12">
          {['Emagrecer', 'Manter', 'Hipertrofia'].map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => setObjetivo(item)}
              className={`w-full h-12 rounded-xl items-center justify-center border ${
                objetivo === item 
                  ? 'bg-[#00C2FF] border-[#00C2FF]' 
                  : 'bg-[#1C1F26] border-[#2A2E39]'
              }`}
            >
              <Text className={`font-bold text-base ${objetivo === item ? 'text-[#13151A]' : 'text-white'}`}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        
        <TouchableOpacity className="w-full h-12 bg-[#00C2FF] rounded-full items-center justify-center active:bg-[#009FCC] mb-10">
          <Text className="text-[#13151A] font-bold text-lg">Gerar Plano</Text>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}