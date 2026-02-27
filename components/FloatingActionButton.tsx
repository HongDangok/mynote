/*
  Mục đích: Nút hành động nổi (FAB).
  - Cố định ở góc, kích thước tùy chỉnh, icon Ionicons
*/
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: number;
}

export function FloatingActionButton({ 
  onPress, 
  icon = 'add', 
  size = 56 
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: colors.primary,
          width: size,
          height: size,
          borderRadius: size / 2,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons 
        name={icon} 
        size={size * 0.4} 
        color={colors.surface} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
