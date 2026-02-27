/*
  Mục đích: Component chọn màu.
  - Hiển thị danh sách màu khả dụng theo theme
  - Cho phép chọn và phản hồi màu đã chọn
*/
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  colors?: string[];
}

export function ColorPicker({ 
  selectedColor, 
  onColorSelect, 
  colors 
}: ColorPickerProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  
  const availableColors = colors || Object.values(themeColors.noteColors);

  return (
    <View style={styles.container}>
      {availableColors.map((color, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.colorOption,
            { backgroundColor: color },
            selectedColor === color && styles.selectedColor
          ]}
          onPress={() => onColorSelect(color)}
        >
          {selectedColor === color && (
            <View style={styles.checkmark} />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    margin: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#6200ee',
  },
  checkmark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6200ee',
  },
});
