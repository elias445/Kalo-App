import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { SquarePen } from 'lucide-react-native';

export default function CronogramaTreinoScreen() {
  const [diaSelecionado, setDiaSelecionado] = useState('Seg');
  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const exercicios = [
    { id: 1, nome: 'Supino reto', series: '3x12' },
    { id: 2, nome: 'Supino inclinado', series: '3x12' },
    { id: 3, nome: 'Fly', series: '3x12' },
    { id: 4, nome: 'Crossover', series: '3x12' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <ScrollView className={`flex-1 px-6 ${Platform.OS === 'android' ? 'pt-12' : 'pt-6'}`}>

        <Text className="text-white text-3xl font-extrabold text-center mb-8 mt-4">
          Cronograma de treino
        </Text>

        <View className="flex-row justify-between mb-8">
          {diasDaSemana.map((dia) => (
            <TouchableOpacity
              key={dia}
              onPress={() => setDiaSelecionado(dia)}
              className={`px-3 py-1.5 rounded-full border ${
                diaSelecionado === dia 
                  ? 'border-[#00C2FF]' 
                  : 'border-gray-300'
              }`}
            >
              <Text 
                className={`font-bold text-sm ${
                  diaSelecionado === dia ? 'text-[#00C2FF]' : 'text-white'
                }`}
              >
                {dia}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-white text-2xl font-bold text-center mb-6">
          Peito
        </Text>

        {exercicios.map((ex) => (
          <View 
            key={ex.id} 
            className="bg-[#1C1F26] border border-gray-400 rounded-2xl p-5 flex-row justify-between items-center mb-4"
          >
            <View>
              <Text className="text-white font-bold text-lg mb-1">{ex.nome}</Text>
              <Text className="text-white font-bold text-base">{ex.series}</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 items-center justify-center">
              <SquarePen color="#FFFFFF" size={26} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}