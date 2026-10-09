import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type Props = { size: number; stroke: number; progress: number; children?: React.ReactNode };

/** Anel de progresso com gradiente azul→ciano e brilho. Começa no topo e gira no sentido horário. */
export default function RingProgress({ size, stroke, progress, children }: Props) {
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  const cx = size / 2;
  // As pontas arredondadas avançam stroke/2 em cada lado: encurta o traço e desloca o início para o ângulo ficar exato.
  const traco = Math.max(0.01, c * pct - stroke);
  const inicio = -90 + ((stroke / 2) / r) * (180 / Math.PI);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#0A5CFF" />
            <Stop offset="1" stopColor="#00D1FF" />
          </LinearGradient>
        </Defs>
        <Circle cx={cx} cy={cx} r={r} stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} fill="none" />
        {/* brilho */}
        <Circle
          cx={cx} cy={cx} r={r} stroke="#00D1FF" strokeOpacity={0.18} strokeWidth={stroke + 10} fill="none"
          strokeDasharray={`${traco} ${c}`} strokeLinecap="round" transform={`rotate(${inicio} ${cx} ${cx})`}
        />
        <Circle
          cx={cx} cy={cx} r={r} stroke="url(#ring)" strokeWidth={stroke} fill="none"
          strokeDasharray={`${traco} ${c}`} strokeLinecap="round" transform={`rotate(${inicio} ${cx} ${cx})`}
        />
      </Svg>
      {children}
    </View>
  );
}
