import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { DIAS_TREINO } from '../data/perfil';
import { colors } from '../theme';

type Props = { selecionados: string[]; onChange: (dias: string[]) => void };

// Botões dos dias da semana para escolher em quais dias treinar (de 2 a 6)
export default function SeletorDias({ selecionados, onChange }: Props) {
  // Marca ou desmarca um dia
  const alternar = (dia: string) =>
    onChange(selecionados.includes(dia) ? selecionados.filter((d) => d !== dia) : [...selecionados, dia]);

  return (
    <View>
      <View className="flex-row" style={{ gap: 6 }}>
        {DIAS_TREINO.map((dia) => {
          const ativo = selecionados.includes(dia);
          return (
            <TouchableOpacity
              key={dia}
              onPress={() => alternar(dia)}
              activeOpacity={0.8}
              style={{
                flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1,
                borderColor: ativo ? colors.cyan : colors.line,
                backgroundColor: ativo ? 'rgba(0,209,255,0.10)' : colors.surface,
              }}
            >
              <Text style={{ color: ativo ? colors.cyan : '#FFFFFF', fontWeight: '700', fontSize: 12 }}>{dia}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-dim text-xs mt-2">
        {selecionados.length} {selecionados.length === 1 ? 'dia selecionado' : 'dias selecionados'}  •  escolha de 2 a 6
      </Text>
    </View>
  );
}
