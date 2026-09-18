import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function PesquisaAlimentosScreen() {
  const alimentos = [
    { nome: 'Arroz', gramas: '100' },
    { nome: 'Feijão', gramas: '100' },
    { nome: 'Macarrão', gramas: '100' },
    { nome: 'Banana', gramas: '100' },
  ];

  return (
    <View className="flex-1 bg-[#13151A]">
      <ScrollView className="flex-1 px-6 pt-16">
        
        <View className="bg-[#2A2E39] h-12 rounded-xl flex-row items-center px-4 mb-8">
          <TextInput 
            className="flex-1 text-white text-base font-bold"
            placeholder="Pesquisar alimento"
            placeholderTextColor="#FFF"
          />
          <Text className="text-white text-xl">🔍</Text>
        </View>

        {alimentos.map((item, index) => (
          <View key={index} className="border border-[#2A2E39] rounded-xl p-4 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-white font-bold text-lg mb-2">{item.nome}</Text>
              <View className="flex-row items-center gap-2">
                <View className="bg-[#2A2E39] px-4 py-1 rounded-full border border-gray-600">
                  <Text className="text-white font-bold">{item.gramas}</Text>
                </View>
                <Text className="text-white font-bold">g</Text>
              </View>
            </View>
            <TouchableOpacity className="border border-white w-10 h-10 items-center justify-center">
              <Text className="text-white text-2xl font-light">+</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}