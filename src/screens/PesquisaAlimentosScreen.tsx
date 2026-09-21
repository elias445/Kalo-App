import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus, ChevronLeft } from 'lucide-react-native';

export default function PesquisaAlimentosScreen() {
  const navigation = useNavigation();
  
  const alimentos = [
    { nome: 'Arroz', gramas: '100' },
    { nome: 'Feijão', gramas: '100' },
    { nome: 'Macarrão', gramas: '100' },
    { nome: 'Banana', gramas: '100' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <ScrollView className={`flex-1 px-6 ${Platform.OS === 'android' ? 'pt-16' : 'pt-8'}`}>
        
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mb-6 w-10 h-10 justify-center"
        >
          <ChevronLeft color="#9CA3AF" size={32} strokeWidth={2} />
        </TouchableOpacity>

        <View className="bg-[#1C1F26] h-14 rounded-xl flex-row items-center justify-between px-4 mb-8 border border-[#2A2E39]">
          <Text className="text-gray-400 font-bold text-base">Pesquisar alimento</Text>
          <Search color="#9CA3AF" size={20} strokeWidth={2} />
        </View>

        {alimentos.map((item, index) => (
          <View key={index} className="bg-[#1C1F26] rounded-xl p-5 mb-4 flex-row justify-between items-center shadow-lg border border-[#2A2E39]">
            <View>
              <Text className="text-white font-bold text-lg mb-2">{item.nome}</Text>
              <View className="flex-row items-center gap-2">
                <View className="bg-transparent px-4 py-1 rounded-full border border-gray-600">
                  <Text className="text-white font-bold">{item.gramas}</Text>
                </View>
                <Text className="text-white font-bold">g</Text>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 items-center justify-center">
              <Plus color="#FFFFFF" size={28} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}