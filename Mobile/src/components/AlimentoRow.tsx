import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Plus, Check } from 'lucide-react-native';
import { MiniTile } from './UI';
import { colors } from '../theme';

/** Marca um alimento como "adicionado" por 1,5 s para dar feedback visual no botão. */
export function useAdicionado() {
  const [nome, setNome] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const marcar = (alimento: string) => {
    setNome(alimento);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setNome(null), 1500);
  };

  return [nome, marcar] as const;
}

type Props = {
  nome: string;
  legenda?: string;
  /** kcal da porção digitada, mostrado em destaque */
  kcal?: number;
  gramas: string;
  onGramasChange: (v: string) => void;
  onAdd: () => void;
  adicionado?: boolean;
};

export default function AlimentoRow({ nome, legenda, kcal, gramas, onGramasChange, onAdd, adicionado }: Props) {
  return (
    <View
      className="flex-row items-center bg-surface px-4 py-3.5"
      style={{ borderRadius: 22, borderWidth: 1, borderColor: adicionado ? 'rgba(34,197,94,0.35)' : colors.line }}
    >
      <MiniTile size={44}>
        <Text className="text-cyan font-extrabold text-lg">{nome.charAt(0).toUpperCase()}</Text>
      </MiniTile>
      <View className="flex-1 mx-3">
        <Text className="text-white font-bold text-base" numberOfLines={1}>{nome}</Text>
        {kcal !== undefined ? (
          <Text className="text-cyan text-xs font-extrabold mt-0.5">{kcal} kcal</Text>
        ) : null}
        {legenda && <Text className="text-muted text-[11px] mt-0.5" numberOfLines={1}>{legenda}</Text>}
      </View>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <View className="flex-row items-center bg-surface2" style={{ borderRadius: 12, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, height: 40 }}>
          <TextInput
            value={gramas}
            onChangeText={onGramasChange}
            keyboardType="numeric"
            selectionColor={colors.cyan}
            className="text-white font-extrabold text-sm text-right"
            style={{ width: 40, padding: 0 }}
          />
          <Text className="text-muted text-xs ml-1">g</Text>
        </View>
        <TouchableOpacity
          onPress={onAdd}
          activeOpacity={0.7}
          className="items-center justify-center"
          style={{
            width: 40, height: 40, borderRadius: 12, borderWidth: 1,
            borderColor: adicionado ? 'rgba(34,197,94,0.5)' : 'rgba(0,209,255,0.35)',
            backgroundColor: adicionado ? 'rgba(34,197,94,0.12)' : 'rgba(0,209,255,0.08)',
          }}
        >
          {adicionado ? <Check color={colors.ok} size={18} strokeWidth={3} /> : <Plus color={colors.cyan} size={18} strokeWidth={2.6} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
