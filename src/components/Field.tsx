import React, { useState } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { colors } from '../theme';

type Props = TextInputProps & {
  label?: string;
  icon?: LucideIcon;
  right?: React.ReactNode;
  labelRight?: React.ReactNode;
};

export default function Field({ label, icon: Icon, right, labelRight, onFocus, onBlur, ...input }: Props) {
  const [focado, setFocado] = useState(false);

  return (
    <View>
      {(label || labelRight) && (
        <View className="flex-row justify-between items-center mb-2 px-1">
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.6, textTransform: 'uppercase' }}>{label}</Text>
          {labelRight}
        </View>
      )}
      <View
        className="flex-row items-center px-4"
        style={{
          height: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: focado ? 'rgba(0,209,255,0.6)' : colors.line,
          backgroundColor: colors.surface2,
        }}
      >
        {Icon && <Icon color={focado ? colors.cyan : colors.dim} size={18} strokeWidth={2} style={{ marginRight: 12 }} />}
        <TextInput
          placeholderTextColor={colors.dim}
          selectionColor={colors.cyan}
          className="flex-1 text-white text-base"
          style={{ height: '100%' }}
          onFocus={(e) => { setFocado(true); onFocus?.(e); }}
          onBlur={(e) => { setFocado(false); onBlur?.(e); }}
          {...input}
        />
        {right}
      </View>
    </View>
  );
}

/** Linha de formulário: título + legenda à esquerda e valor numérico em caixa à direita. */
export function NumberRow({ icon: Icon, title, hint, unit, value, onChangeText }: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  unit: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View
      className="flex-row items-center justify-between px-5 py-4"
      style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center flex-1 mr-3" style={{ gap: 12 }}>
        {Icon && (
          <View
            className="items-center justify-center"
            style={{ width: 40, height: 40, borderRadius: 13, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
          >
            <Icon color={colors.cyan} size={19} strokeWidth={2} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{title}</Text>
          {hint ? <Text className="text-dim text-xs mt-0.5" numberOfLines={1}>{hint}</Text> : null}
        </View>
      </View>
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          selectionColor={colors.cyan}
          placeholderTextColor={colors.dim}
          className="text-white font-extrabold text-lg text-center"
          style={{ width: 84, height: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface2, paddingHorizontal: 8 }}
        />
        <Text className="text-muted text-sm" style={{ minWidth: 28 }}>{unit}</Text>
      </View>
    </View>
  );
}
