import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { User, LogOut } from 'lucide-react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

export default function PerfilScreen() {
  const navigation = useNavigation();

  const handleLogout = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })
    );
  };

  const diasTreinados = [2, 3, 4, 5, 10, 11, 12, 13, 16, 17, 18, 23, 25, 27, 30, 31];
  const diasDoMes = Array.from({ length: 31 }, (_, i) => i + 1);

  const lineData = [
    { value: 80, label: '1/07' },
    { value: 77, label: '1/08' },
    { value: 75, label: '1/09' },
    { value: 72, label: '1/10' },
    { value: 68, label: '1/11' },
    { value: 65, label: '1/12' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <View className="flex-1 px-6 justify-center pb-4">
        
        <TouchableOpacity 
          onPress={handleLogout}
          className={`absolute right-6 z-50 ${Platform.OS === 'android' ? 'top-12' : 'top-6'} w-11 h-11 bg-transparent rounded-full items-center justify-center border border-[#EF4444]/50`}
        >
          <LogOut color="#EF4444" size={20} strokeWidth={2} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View className="items-center mb-4 mt-8">
          <View className="w-20 h-20 bg-[#1C1F26] rounded-full items-center justify-center border-[3px] border-[#00C2FF] mb-2 shadow-lg">
             <User color="#00C2FF" size={40} strokeWidth={2} />
          </View>
          <Text className="text-white text-xl font-bold">Seu Nome</Text>
        </View>

        <View className="h-[1px] bg-[#2A2E39] w-full mb-5" />

        <Text className="text-white text-lg font-bold text-center mb-2">Peso corporal</Text>
        <View className="bg-[#1C1F26] rounded-3xl py-3 px-4 border border-[#2A2E39] mb-6 shadow-lg">
          <Text className="text-white font-bold text-xs mb-1 ml-4">Kg</Text>
          <View className="items-center ml-[-15px]">
            <LineChart
              data={lineData}
              height={130} 
              thickness={2} 
              color="#00C2FF"
              dataPointsColor="#00C2FF"
              dataPointsRadius={4} 
              hideRules
              yAxisColor="#2A2E39"
              xAxisColor="#2A2E39"
              yAxisTextStyle={{ color: '#9CA3AF', fontSize: 12 }}
              xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}
              yAxisOffset={60} 
              stepValue={5}    
              noOfSections={4} 
              width={280}
            />
          </View>
        </View>

        <Text className="text-white text-lg font-bold text-center mb-2">Frequência de Treino</Text>
        <View className="bg-[#1C1F26] rounded-3xl py-4 px-4 border border-[#2A2E39] shadow-lg">
           
           <View className="flex-row justify-between mb-2 px-1">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, index) => (
                 <Text key={index} className="text-white font-bold text-center w-[13%] text-sm">{dia}</Text>
              ))}
           </View>

           <View className="flex-row flex-wrap justify-start">
              {diasDoMes.map((dia) => {
                 const treinou = diasTreinados.includes(dia);
                 return (
                   <View key={dia} className="w-[14.28%] items-center justify-center mb-1">
                     <TouchableOpacity 
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          treinou ? 'bg-[#00C2FF]' : 'bg-transparent'
                        }`}
                     >
                        <Text className={`font-bold text-sm ${treinou ? 'text-[#13151A]' : 'text-gray-400'}`}>
                           {dia}
                        </Text>
                     </TouchableOpacity>
                   </View>
                 );
              })}
           </View>
        </View>

      </View>
    </SafeAreaView>
  );
}