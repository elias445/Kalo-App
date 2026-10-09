import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, Dumbbell, Utensils, User, Trophy } from 'lucide-react-native';
import { colors, gradients, glow } from '../theme';

const ITENS: Record<string, { label: string; Icon: typeof Home }> = {
  Home: { label: 'Início', Icon: Home },
  Treino: { label: 'Treino', Icon: Dumbbell },
  Comunidade: { label: 'Comunidade', Icon: Trophy },
  DiarioTab: { label: 'Dieta', Icon: Utensils },
  Perfil: { label: 'Perfil', Icon: User },
};

// Quanto o botão central sobe acima da barra
const ELEVACAO = 20;

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 10) }}>
      {/* Fundo da barra: começa abaixo da área ocupada pelo botão elevado */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, top: ELEVACAO,
          backgroundColor: 'rgba(9,12,18,0.98)', borderTopWidth: 1, borderTopColor: colors.line,
        }}
      />
      <View className="flex-row items-end">
        {state.routes.map((route, index) => {
          const item = ITENS[route.name];
          if (!item) return null;
          const focado = state.index === index;
          const destaque = route.name === 'Comunidade';
          const cor = focado ? colors.cyan : colors.dim;

          const aoPressionar = () => {
            const evento = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focado && !evento.defaultPrevented) navigation.navigate(route.name as never);
          };

          if (destaque) {
            return (
              <TouchableOpacity key={route.key} onPress={aoPressionar} activeOpacity={0.85} className="flex-1 items-center" style={{ paddingBottom: 6 }}>
                <View
                  className="items-center justify-center"
                  style={[
                    { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.ink, borderWidth: 1, borderColor: focado ? 'rgba(0,209,255,0.6)' : colors.line },
                    glow(colors.cyan, focado ? 0.7 : 0.4, 14),
                  ]}
                >
                  <LinearGradient
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <item.Icon color="#FFFFFF" size={24} strokeWidth={2.2} />
                  </LinearGradient>
                </View>
                <Text style={{ color: focado ? colors.cyan : colors.muted, fontSize: 10, fontWeight: '800', marginTop: 4 }}>{item.label}</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={route.key} onPress={aoPressionar} activeOpacity={0.7} className="flex-1 items-center" style={{ paddingBottom: 4 }}>
              <View style={focado ? glow(colors.cyan, 0.9, 10) : undefined}>
                <item.Icon color={cor} size={25} strokeWidth={focado ? 2.2 : 1.8} />
              </View>
              <Text style={{ color: cor, fontSize: 10, fontWeight: '700', marginTop: 4 }}>{item.label}</Text>
              <View
                style={{
                  width: 4, height: 4, borderRadius: 2, marginTop: 4,
                  backgroundColor: focado ? colors.cyan : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
