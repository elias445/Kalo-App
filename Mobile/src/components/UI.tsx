import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { colors, gradients, glow } from '../theme';

/** Rótulo pequeno em caixa-alta, usado acima de títulos e seções. */
export function SectionLabel({ children, tone = 'cyan', dot = false }: { children: string; tone?: 'cyan' | 'muted'; dot?: boolean }) {
  const color = tone === 'cyan' ? colors.cyan : colors.muted;
  return (
    <View className="flex-row items-center">
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, marginRight: 8 }} />}
      <Text style={{ color, fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>{children}</Text>
    </View>
  );
}

export function IconButton({ children, onPress, style, size = 44 }: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-surface border border-line items-center justify-center"
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
    >
      {children}
    </TouchableOpacity>
  );
}

export function BackButton() {
  const navigation = useNavigation();
  return (
    <IconButton onPress={() => navigation.goBack()}>
      <ChevronLeft color={colors.muted} size={22} strokeWidth={2.2} />
    </IconButton>
  );
}

const BADGE_TONES = {
  cyan: { color: colors.cyan, bg: 'rgba(0,209,255,0.10)', border: 'rgba(0,209,255,0.30)' },
  ok: { color: colors.ok, bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.30)' },
  muted: { color: colors.muted, bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.10)' },
  violet: { color: '#A78BFA', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.35)' },
};

export function Badge({ label, icon, tone = 'cyan' }: { label: string; icon?: React.ReactNode; tone?: keyof typeof BADGE_TONES }) {
  const t = BADGE_TONES[tone];
  return (
    <View
      className="flex-row items-center"
      style={{ backgroundColor: t.bg, borderColor: t.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, gap: 6, alignSelf: 'flex-start' }}
    >
      {icon}
      <Text style={{ color: t.color, fontSize: 12, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ progress, height = 6 }: { progress: number; height?: number }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: `${pct}%`, height, borderRadius: height / 2 }}
      />
    </View>
  );
}

export function Chip({ label, selected, onPress, flex = false }: { label: string; selected: boolean; onPress: () => void; flex?: boolean }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: flex ? 1 : undefined,
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: selected ? colors.cyan : colors.line,
        backgroundColor: selected ? 'rgba(0,209,255,0.10)' : colors.surface,
      }}
    >
      <Text style={{ color: selected ? colors.cyan : '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </TouchableOpacity>
  );
}

/** Quadradinho de ícone com brilho (logo, treino, vazio). */
export function IconTile({ children, size = 56 }: { children: React.ReactNode; size?: number }) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: 'rgba(0,209,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(0,209,255,0.45)',
        ...glow(colors.cyan, 0.35, 14),
      }}
    >
      {children}
    </View>
  );
}

/** Pílula informativa com ícone (tempo, kcal, quantidade...). */
export function InfoChip({ icon, texto }: { icon: React.ReactNode; texto: string }) {
  return (
    <View
      className="flex-row items-center"
      style={{ gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.line }}
    >
      {icon}
      <Text className="text-white text-xs font-bold">{texto}</Text>
    </View>
  );
}

/** Quadradinho de ícone pequeno, tingido de ciano. */
export function MiniTile({ children, size = 40 }: { children: React.ReactNode; size?: number }) {
  return (
    <View
      className="items-center justify-center"
      style={{ width: size, height: size, borderRadius: size * 0.32, backgroundColor: 'rgba(0,209,255,0.10)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.25)' }}
    >
      {children}
    </View>
  );
}

/** Avatar com as iniciais do nome. `anel` desenha um contorno colorido (ex.: medalha ou "você"). */
export function Avatar({ nome, size = 44, anel }: { nome: string; size?: number; anel?: string }) {
  const iniciais = nome.trim().split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
  return (
    <View
      className="items-center justify-center bg-surface2"
      style={{ width: size, height: size, borderRadius: size / 2, borderWidth: anel ? 2.5 : 1, borderColor: anel ?? colors.line }}
    >
      <Text style={{ color: anel ?? colors.cyan, fontWeight: '800', fontSize: size * 0.34 }}>{iniciais}</Text>
    </View>
  );
}
