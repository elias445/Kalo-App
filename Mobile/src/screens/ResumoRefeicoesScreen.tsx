import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Plus } from 'lucide-react-native';

export default function ResumoRefeicoesScreen() {
  const navigation = useNavigation();

  const irParaPesquisa = () => {
    navigation.navigate('PesquisaAlimentos' as never); 
  };

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <ScrollView className={`flex-1 px-6 ${Platform.OS === 'android' ? 'pt-16' : 'pt-8'}`}>
        
        <TouchableOpacity 
          onPress={irParaPesquisa}
          className="bg-[#1C1F26] h-14 rounded-xl flex-row justify-between items-center px-4 mb-10 border border-[#2A2E39]"
        >
          <Text className="text-white font-bold text-base">Pesquisar alimento</Text>
          <Search color="#9CA3AF" size={20} strokeWidth={2} />
        </TouchableOpacity>

        <View className="mb-6 border-b border-[#2A2E39] pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-xl mb-1">• Café da manhã</Text>
            <Text className="text-gray-400 text-sm font-medium">Pão francês, Ovos...</Text>
            <Text className="text-white font-bold text-sm mt-1">350 kcal</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
             <Plus color="#FFFFFF" size={28} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="mb-6 border-b border-[#2A2E39] pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-xl mb-1">• Almoço</Text>
            <Text className="text-gray-400 text-sm font-medium">Arroz, Feijão, Carne, Salada...</Text>
            <Text className="text-white font-bold text-sm mt-1">550 kcal</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
             <Plus color="#FFFFFF" size={28} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="mb-8 border-b border-[#2A2E39] pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-bold text-xl mb-1">• Jantar</Text>
            <Text className="text-gray-400 text-sm font-medium">Inhame, Charque</Text>
            <Text className="text-white font-bold text-sm mt-1">450 kcal</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
             <Plus color="#FFFFFF" size={28} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-center mt-4">
          <Text className="text-white font-bold text-lg">Total consumido:</Text>
          <Text className="text-white font-bold text-lg">1350 kcal</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}