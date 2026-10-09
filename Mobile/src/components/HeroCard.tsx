import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  padding?: number;
  /** estilo do conteúdo interno (ex.: flexDirection: 'row') */
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
};

/** Cartão de destaque com gradiente azul e borda ciano. */
export default function HeroCard({ children, padding = 22, contentStyle, style }: Props) {
  return (
    <View
      className="bg-surface"
      style={[{ borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }, style]}
    >
      <LinearGradient
        colors={['rgba(10,92,255,0.38)', 'rgba(0,209,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[{ padding }, contentStyle]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
