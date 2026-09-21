import React from 'react';
import { View, Text, ScrollView, SafeAreaView, Platform } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Dumbbell } from 'lucide-react-native';

export default function HomeScreen() {
  const caloriasConsumidas = 1250;
  const caloriasMeta = 2100;
  const caloriasRestantes = caloriasMeta - caloriasConsumidas;

  const pieData = [
    { value: caloriasConsumidas, color: '#00C2FF' }, 
    { value: caloriasRestantes, color: '#2A2E39' },  
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <ScrollView className={`flex-1 px-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-4'}`}>
        
        <View className="items-center justify-center mb-6">
          <Text className="text-[#00C2FF] text-3xl font-extrabold tracking-widest">Kalo</Text>
        </View>
        
        <View className="items-center mb-8 mt-2">
          <PieChart
            donut
            innerRadius={90}
            radius={120}
            data={pieData}
            innerCircleColor="#13151A" 
            centerLabelComponent={() => {
              return (
                <View className="items-center justify-center">
                  <Text className="text-white text-lg font-bold mb-1">Calorias</Text>
                  <Text className="text-white text-3xl font-extrabold mb-1">
                    {caloriasConsumidas}/{caloriasMeta}
                  </Text>
                  <Text className="text-gray-400 text-sm font-medium">Meta: {caloriasMeta}</Text>
                </View>
              );
            }}
          />
        </View>

        <View className="flex-row justify-between w-full mb-10">
          <View className="bg-[#1C1F26] border border-[#2A2E39] rounded-2xl w-[31%] py-5 items-center shadow-lg">
            <Text className="text-white font-bold text-base">Carbo.</Text>
            <Text className="text-gray-400 text-sm mt-1">150g</Text>
          </View>
          <View className="bg-[#1C1F26] border border-[#2A2E39] rounded-2xl w-[31%] py-5 items-center shadow-lg">
            <Text className="text-white font-bold text-base">Prot.</Text>
            <Text className="text-gray-400 text-sm mt-1">100g</Text>
          </View>
          <View className="bg-[#1C1F26] border border-[#2A2E39] rounded-2xl w-[31%] py-5 items-center shadow-lg">
            <Text className="text-white font-bold text-base">Gord.</Text>
            <Text className="text-gray-400 text-sm mt-1">50g</Text>
          </View>
        </View>

        <View className="bg-[#1C1F26] border border-[#2A2E39] rounded-3xl p-8 items-center w-full shadow-lg mb-10">
          <Text className="text-white font-extrabold text-2xl mb-2">Treino de hoje</Text>
          <Text className="text-gray-400 text-lg mb-6">Costas & Bíceps</Text>
          <View className="w-20 h-20 bg-[#00C2FF]/10 rounded-full items-center justify-center">
            <Dumbbell color="#00C2FF" size={40} strokeWidth={2} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}