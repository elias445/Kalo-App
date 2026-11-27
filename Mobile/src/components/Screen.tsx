import React, { useState } from 'react';
import { View, ScrollView, RefreshControl, KeyboardAvoidingView, Platform, StyleProp, ViewStyle, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  tabbed?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  // Puxar para atualizar: a função roda e o indicador some quando ela termina
  onRefresh?: () => Promise<unknown>;
  // Chamada quando a rolagem chega perto do fim (para carregar mais itens)
  onEndReached?: () => void;
};

// Brilho azul no topo da tela
function Glow() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 460 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="0%" rx="85%" ry="100%">
            <Stop offset="0.0" stopColor="#0A5CFF" stopOpacity={0.2200} />
            <Stop offset="0.1" stopColor="#0A5CFF" stopOpacity={0.1708} />
            <Stop offset="0.2" stopColor="#0A5CFF" stopOpacity={0.1288} />
            <Stop offset="0.3" stopColor="#0A5CFF" stopOpacity={0.0935} />
            <Stop offset="0.4" stopColor="#0A5CFF" stopOpacity={0.0646} />
            <Stop offset="0.5" stopColor="#0A5CFF" stopOpacity={0.0417} />
            <Stop offset="0.6" stopColor="#0A5CFF" stopOpacity={0.0244} />
            <Stop offset="0.7" stopColor="#0A5CFF" stopOpacity={0.0122} />
            <Stop offset="0.8" stopColor="#0A5CFF" stopOpacity={0.0046} />
            <Stop offset="0.9" stopColor="#0A5CFF" stopOpacity={0.0009} />
            <Stop offset="1.0" stopColor="#0A5CFF" stopOpacity={0.0000} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#glow)" />
      </Svg>
    </View>
  );
}

// Base de todas as telas: fundo, rolagem, teclado e áreas seguras
export default function Screen({ children, scroll = true, tabbed = false, contentStyle, onRefresh, onEndReached }: Props) {
  const insets = useSafeAreaInsets();
  const [atualizando, setAtualizando] = useState(false);

  // Roda a atualização e mostra o indicador enquanto ela não termina
  const atualizar = async () => {
    setAtualizando(true);
    try {
      await onRefresh?.();
    } finally {
      setAtualizando(false);
    }
  };

  // Avisa quando faltam menos de 400 px para o fim da rolagem
  const aoRolar = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 400) onEndReached?.();
  };
  const padding = {
    paddingTop: insets.top + 12,
    paddingBottom: tabbed ? 28 : insets.bottom + 28,
    paddingHorizontal: 24,
  };

  return (
    <View className="flex-1 bg-ink">
      <Glow />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {scroll ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[padding, contentStyle]}
            refreshControl={onRefresh ? <RefreshControl refreshing={atualizando} onRefresh={atualizar} tintColor="#00D1FF" colors={['#00D1FF']} progressBackgroundColor="#101521" /> : undefined}
            onScroll={onEndReached ? aoRolar : undefined}
            scrollEventThrottle={200}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}
