/*
  Mục đích: Màn hình Cài đặt.
  - Cho phép người dùng thay đổi theme (sáng/tối/theo hệ thống)
  - Giao diện đồng bộ với màn hình Khám phá
*/
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useColorScheme } from '../hooks/useColorScheme';
import { exploreStyles as styles } from '../styles/style';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { themeMode, setThemeMode } = useTheme();

  const themeOptions: Array<{ mode: 'light' | 'dark' | 'system'; label: string; icon: string; color: keyof typeof colors.noteColors }> = [
    { mode: 'light', label: 'Sáng', icon: 'sunny-outline', color: 'yellow' },
    { mode: 'dark', label: 'Tối', icon: 'moon-outline', color: 'blue' },
    { mode: 'system', label: 'Theo hệ thống', icon: 'phone-portrait-outline', color: 'purple' },
  ];

  const renderHeader = () => (
    <View style={[headerStyles.header, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={() => router.back()} style={headerStyles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[headerStyles.headerTitle, { color: colors.text }]}>Cài đặt</Text>
      <View style={headerStyles.placeholder} />
    </View>
  );

  const renderThemeSection = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Giao diện</Text>
      <View style={settingStyles.themeOptionsContainer}>
        {themeOptions.map((option) => {
          const isSelected = themeMode === option.mode;
          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.noteColors[option.color],
                  borderWidth: isSelected ? 2 : 0,
                  borderColor: colors.primary,
                }
              ]}
              onPress={() => setThemeMode(option.mode)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={option.icon as keyof typeof Ionicons.glyphMap} 
                size={32} 
                color={isSelected ? colors.primary : colors.text} 
              />
              <Text style={[
                settingStyles.themeOptionLabel,
                { 
                  color: isSelected ? colors.primary : colors.text,
                  fontWeight: isSelected ? '600' : '500'
                }
              ]}>
                {option.label}
              </Text>
              {isSelected && (
                <View style={[settingStyles.checkmarkContainer, { backgroundColor: colors.primary }]}>
                  <Ionicons name="checkmark" size={16} color={colors.surface} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: string }) => {
    switch (item) {
      case 'theme':
        return renderThemeSection();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderHeader()}
      <FlatList
        data={['theme']}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={settingStyles.listContent}
      />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
});

const settingStyles = StyleSheet.create({
  listContent: {
    paddingTop: 24,
  },
  themeOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeOptionLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


