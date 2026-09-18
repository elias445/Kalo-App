import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function PerfilScreen() {
 
  const diasTreinados = [2, 3, 4, 5, 10, 11, 12, 13, 16, 17, 18, 23, 25, 27, 30, 31];
  
  const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <View className="flex-1 bg-[#13151A]">
      <ScrollView className="flex-1 px-6 pt-16">
        
        <View className="items-center mb-6">
          <View className="w-24 h-24 bg-[#1C1F26] rounded-full items-center justify-center border-2 border-[#00C2FF] mb-3 shadow-lg">
             <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold">Seu Nome</Text>
        </View>


        <View className="h-[1px] bg-[#2A2E39] w-full mb-8" />

        <Text className="text-white text-xl font-bold text-center mb-4">Peso corporal</Text>
        <View className="bg-[#1C1F26] rounded-3xl p-5 border border-[#2A2E39] mb-8 shadow-lg">
          
          <View className="flex-row items-end h-40">
            <View className="justify-between h-full pr-3 border-r border-[#2A2E39] py-2">
              <Text className="text-gray-400 text-xs font-bold mb-1">Kg</Text>
              <Text className="text-gray-400 text-xs">80</Text>
              <Text className="text-gray-400 text-xs">75</Text>
              <Text className="text-gray-400 text-xs">70</Text>
              <Text className="text-gray-400 text-xs">65</Text>
              <Text className="text-gray-400 text-xs">60</Text>
            </View>

            <View className="flex-1 h-full relative justify-end pb-2 border-b border-[#2A2E39]">
               <View className="w-3 h-3 rounded-full bg-[#00C2FF] absolute" style={{ bottom: '90%', left: '10%' }} />
               <View className="w-3 h-3 rounded-full bg-[#00C2FF] absolute" style={{ bottom: '70%', left: '30%' }} />
               <View className="w-3 h-3 rounded-full bg-[#00C2FF] absolute" style={{ bottom: '50%', left: '50%' }} />
               <View className="w-3 h-3 rounded-full bg-[#00C2FF] absolute" style={{ bottom: '35%', left: '70%' }} />
               <View className="w-3 h-3 rounded-full bg-[#00C2FF] absolute" style={{ bottom: '20%', left: '90%' }} />
            </View>
          </View>

        
          <View className="flex-row justify-between mt-3 pl-8 pr-2">
             <Text className="text-gray-400 text-xs">1/07</Text>
             <Text className="text-gray-400 text-xs">1/08</Text>
             <Text className="text-gray-400 text-xs">1/09</Text>
             <Text className="text-gray-400 text-xs">1/10</Text>
             <Text className="text-gray-400 text-xs">1/11</Text>
          </View>
        </View>

        <Text className="text-white text-xl font-bold text-center mb-4">Frequência de Treino</Text>
        <View className="bg-[#1C1F26] rounded-3xl p-5 border border-[#2A2E39] mb-12 shadow-lg">
           
           <View className="flex-row justify-between mb-4 px-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
                 <Text key={index} className="text-white font-bold w-8 text-center">{dia}</Text>
              ))}
           </View>

           <View className="flex-row flex-wrap gap-y-4 justify-between">
              {diasDoMes.map((dia) => {
                 const treinou = diasTreinados.includes(dia);
                 return (
                   <TouchableOpacity 
                      key={dia} 
                      className={`w-10 h-10 rounded-full items-center justify-center mx-[2px] ${
                        treinou ? 'bg-[#00C2FF]' : 'bg-transparent border border-[#2A2E39]'
                      }`}
                   >
                      <Text className={`font-bold ${treinou ? 'text-[#13151A]' : 'text-gray-400'}`}>
                         {dia}
                      </Text>
                   </TouchableOpacity>
                 );
              })}
              <View className="w-10 h-10 mx-[2px]" />
              <View className="w-10 h-10 mx-[2px]" />
              <View className="w-10 h-10 mx-[2px]" />
              <View className="w-10 h-10 mx-[2px]" />
           </View>
        </View>

      </ScrollView>
    </View>
  );
}