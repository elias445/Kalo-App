import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { colors } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (option: string) => void;
  onClose: () => void;
};

/** Bottom sheet simples para escolher uma opção da lista. */
export default function OptionSheet({ visible, title, options, selected, onSelect, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
        <View
          onStartShouldSetResponder={() => true}
          className="bg-surface px-6 pt-4 pb-10"
          style={{ borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderColor: colors.line }}
        >
          <View className="self-center mb-5" style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white text-xl font-extrabold">{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <X color={colors.muted} size={22} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          {options.map((option, index) => {
            const ativo = option === selected;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => onSelect(option)}
                className="flex-row items-center justify-between py-4"
                style={index !== options.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.line } : undefined}
              >
                <Text style={{ color: ativo ? colors.cyan : '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{option}</Text>
                {ativo && <Check color={colors.cyan} size={20} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
