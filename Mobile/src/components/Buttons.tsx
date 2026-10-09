import React from 'react';
import { Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, glow } from '../theme';

type GradientProps = {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'cyan';
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function GradientButton({ label, onPress, icon, variant = 'primary', uppercase = false, style }: GradientProps) {
  const textColor = variant === 'cyan' ? colors.ink : '#FFFFFF';
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[{ borderRadius: 18 }, glow(variant === 'cyan' ? colors.cyan : colors.brand, 0.4, 18), style]}
    >
      <LinearGradient
        colors={gradients[variant]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ height: 56, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Text style={{ color: textColor, fontWeight: '800', fontSize: 16, letterSpacing: uppercase ? 1 : 0 }}>
          {uppercase ? label.toUpperCase() : label}
        </Text>
        {icon}
      </LinearGradient>
    </TouchableOpacity>
  );
}

type OutlineProps = {
  label: string;
  onPress?: () => void;
  icon?: React.ReactNode;
  tone?: 'cyan' | 'danger';
  style?: StyleProp<ViewStyle>;
};

export function OutlineButton({ label, onPress, icon, tone = 'cyan', style }: OutlineProps) {
  const color = tone === 'danger' ? colors.danger : colors.cyan;
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        {
          height: 56,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: `${color}66`,
          backgroundColor: `${color}12`,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        style,
      ]}
    >
      {icon}
      <Text style={{ color, fontWeight: '700', fontSize: 16 }}>{label}</Text>
    </TouchableOpacity>
  );
}
