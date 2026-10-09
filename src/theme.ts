import { Platform, ViewStyle } from 'react-native';

// Tokens para usos fora do className (ícones, gráficos, gradientes, sombras).
// Mantenha em sincronia com tailwind.config.js.
export const colors = {
  ink: '#07090E',
  surface: '#0E131B',
  surface2: '#151B26',
  line: 'rgba(255,255,255,0.08)',
  muted: '#8B94A7',
  dim: '#8B94A7',
  brand: '#0A5CFF',
  cyan: '#00D1FF',
  ok: '#22C55E',
  danger: '#F43F5E',
  violet: '#8B5CF6',
};

export const gradients = {
  primary: ['#0A5CFF', '#00C2FF'] as const,
  cyan: ['#00E0FF', '#00B8E6'] as const,
};

// Brilho colorido. No Android só existe sombra via `elevation`, que desenha um retângulo
// escuro (visível através de fundos translúcidos) e não aceita cor/raio — por isso fica de fora lá.
export const glow = (color: string, opacity = 0.35, radius = 16): ViewStyle =>
  Platform.OS === 'android'
    ? {}
    : {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: 4 },
      };
