import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ResumoRefeicoesScreen() {
  const navigation = useNavigation();

  const irParaPesquisa = () => {
    navigation.navigate('PesquisaAlimentos' as never); 
  };

  return (
    <View className="flex-1 bg-[#13151A]">
      <ScrollView className="flex-1 px-6 pt-16">
        
        <TouchableOpacity 
          onPress={irParaPesquisa}
          className="bg-[#2A2E39] h-12 rounded-xl justify-center items-center mb-10"
        >
          <Text className="text-white font-bold text-base">Pesquisar alimento</Text>
        </TouchableOpacity>

        <View className="mb-6 border-b border-[#2A2E39] pb-4">
          <Text className="text-white font-bold text-lg mb-1">• Café da manhã:</Text>
          <Text className="text-gray-400 text-sm">Pão francês, Ovos...</Text>
          <Text className="text-white font-bold text-sm mt-1">350 kcal</Text>
        </View>

        
        <View className="mb-6 border-b border-[#2A2E39] pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-lg mb-1">• Almoço</Text>
            <Text className="text-gray-400 text-sm">Arroz, Feijão, Carne, Salada...</Text>
            <Text className="text-white font-bold text-sm mt-1">550 kcal</Text>
          </View>
          <TouchableOpacity>
             <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        </View>

        
        <View className="mb-8 border-b border-[#2A2E39] pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-lg mb-1">• Jantar</Text>
            <Text className="text-gray-400 text-sm">Inhame, Charque</Text>
            <Text className="text-white font-bold text-sm mt-1">450 kcal</Text>
          </View>
          <TouchableOpacity>
             <Text className="text-white text-3xl font-light">+</Text>
          </TouchableOpacity>
        </View>

        
        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-white font-bold text-lg">Total consumido:</Text>
          <Text className="text-white font-bold text-lg">1350 kcal</Text>
        </View>

      </ScrollView>
    </View>
  );
}