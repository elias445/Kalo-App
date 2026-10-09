import React from 'react';
import { View, ViewProps } from 'react-native';
import { colors, glow } from '../theme';

type Props = ViewProps & { className?: string; highlight?: boolean };

export default function Card({ className = '', highlight = false, style, children, ...rest }: Props) {
  return (
    <View
      className={`bg-surface border rounded-3xl ${highlight ? 'border-cyan/30' : 'border-line'} ${className}`}
      style={[highlight && glow(colors.cyan, 0.18, 20), style]}
      {...rest}
    >
      {children}
    </View>
  );
}
