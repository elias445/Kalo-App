import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#13151A]">
      <ScrollView className="flex-1 px-4 pt-14">
        
        
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-white text-xl font-bold">Menu</Text>
          <Text className="text-[#00C2FF] text-3xl font-extrabold tracking-widest">Kalo</Text>
          <View className="w-10 h-10 bg-[#1C1F26] rounded-full items-center justify-center border border-[#2A2E39]">
            <Text className="text-[#00C2FF] font-bold">🔔</Text>
          </View>
        </View>

        
        <View className="bg-[#1C1F26] rounded-3xl p-6 items-center border border-[#2A2E39] mb-6 shadow-lg">
          <Text className="text-white text-lg font-bold mb-6">Calorias</Text>
          
          
          <View className="w-48 h-48 rounded-full border-[12px] border-[#00C2FF] items-center justify-center mb-6">
            <Text className="text-white text-4xl font-extrabold">2300</Text>
            <Text className="text-gray-400 text-sm">Calorias</Text>
          </View>

          
          <View className="flex-row justify-between w-full px-4">
            <View className="items-center">
              <Text className="text-white font-bold text-lg">265</Text>
              <Text className="text-gray-400 text-xs">Carbos</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">15%</Text>
              <Text className="text-gray-400 text-xs">Gordura</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">3%</Text>
              <Text className="text-gray-400 text-xs">Macro</Text>
            </View>
          </View>
        </View>

        
        <Text className="text-white text-lg font-bold mb-4">Treino de Hoje</Text>
        <TouchableOpacity className="bg-[#1C1F26] rounded-2xl p-5 border border-[#2A2E39] flex-row justify-between items-center mb-10 active:bg-[#2A2E39]">
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-[#00C2FF]/10 rounded-xl items-center justify-center">
              <Text className="text-[#00C2FF] text-xl">💪</Text>
            </View>
            <View>
              <Text className="text-white font-bold text-base">Hipertrofia</Text>
              <Text className="text-gray-400 text-sm">Peito e Tríceps • 60 min</Text>
            </View>
          </View>
          <Text className="text-[#00C2FF] font-bold text-xl">{'>'}</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}