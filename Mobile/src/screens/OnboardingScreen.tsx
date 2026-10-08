import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronDown, X } from 'lucide-react-native';

export default function OnboardingScreen() {
  const [sexo, setSexo] = useState('');
  const [idade, setIdade] = useState('');
  const [altura, setAltura] = useState('');
  const [peso, setPeso] = useState('');
  const [objetivo, setObjetivo] = useState('Selecione');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'sexo' | 'objetivo' | null>(null);

  const navigation = useNavigation();

  const opcoesSexo = ['Masculino', 'Feminino', 'Prefiro não informar'];
  const opcoesObjetivo = [
    'Emagrecimento',
    'Hipertrofia',
    'Definição Muscular',
    'Manutenção e Saúde',
    'Performance Esportiva',
    'Bem-estar e Saúde Mental'
  ];

  const abrirModal = (tipo: 'sexo' | 'objetivo') => {
    setModalType(tipo);
    setModalVisible(true);
  };

  const selecionarOpcao = (item: string) => {
    if (modalType === 'sexo') setSexo(item);
    if (modalType === 'objetivo') setObjetivo(item);
    setModalVisible(false);
  };

  const listaAtual = modalType === 'sexo' ? opcoesSexo : opcoesObjetivo;

  return (
    <SafeAreaView className="flex-1 bg-[#13151A]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 pt-16">

          <Text className="text-white text-2xl font-bold text-center mb-10">
            Dados Biométricos
          </Text>

          <View className="flex flex-col gap-6 mb-12">
            
            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg">Sexo</Text>
              <TouchableOpacity 
                onPress={() => abrirModal('sexo')}
                className="w-48 h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl flex-row justify-between items-center px-4"
              >
                <Text className="text-white flex-1 mr-2" numberOfLines={1}>
                  {sexo || 'Selecione'}
                </Text>
                <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg">Idade</Text>
              <TextInput
                className="w-48 h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
                keyboardType="numeric"
                value={idade}
                onChangeText={setIdade}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg">Altura (cm)</Text>
              <TextInput
                className="w-48 h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
                keyboardType="numeric"
                value={altura}
                onChangeText={setAltura}
              />
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-white text-lg">Peso (kg)</Text>
              <TextInput
                className="w-48 h-12 bg-[#1C1F26] border border-[#2A2E39] rounded-xl px-4 text-white"
                keyboardType="numeric"
                value={peso}
                onChangeText={setPeso}
              />
            </View>
          </View>

          <Text className="text-white text-2xl font-bold text-center mb-8">
            Qual o seu objetivo?
          </Text>

          <TouchableOpacity 
            onPress={() => abrirModal('objetivo')}
            className="w-full h-14 bg-[#1C1F26] border border-[#2A2E39] rounded-xl flex-row justify-between items-center px-4 mb-12"
          >
            <Text className="text-white text-base">{objetivo}</Text>
            <ChevronDown color="#9CA3AF" size={20} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => navigation.navigate('Main' as never)}
            className="w-full h-14 bg-[#00C2FF] rounded-xl items-center justify-center active:bg-[#009FCC] mb-10"
          >
            <Text className="text-[#13151A] font-bold text-lg">Gerar plano de treino</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/60 justify-center items-center px-6" 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View className="bg-[#1C1F26] w-full border border-[#2A2E39] rounded-2xl p-6" onStartShouldSetResponder={() => true}>
            
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-white text-xl font-bold">
                {modalType === 'sexo' ? 'Selecione o Sexo' : 'Selecione o Objetivo'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#9CA3AF" size={24} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View>
              {listaAtual.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => selecionarOpcao(item)}
                  className={`py-4 ${index !== listaAtual.length - 1 ? 'border-b border-[#2A2E39]' : ''}`}
                >
                  <Text className={`text-base font-bold ${
                    (modalType === 'sexo' && sexo === item) || (modalType === 'objetivo' && objetivo === item)
                      ? 'text-[#00C2FF]'
                      : 'text-white'
                  }`}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}