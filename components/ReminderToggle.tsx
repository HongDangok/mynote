import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';

interface ReminderToggleProps {
  hasReminder: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  reminderTime?: Date;
}

export function ReminderToggle({ hasReminder, onToggle, disabled = false, reminderTime }: ReminderToggleProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleToggle = () => {
    if (!disabled) {
      onToggle(!hasReminder);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoSection}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={hasReminder ? "notifications" : "notifications-off"} 
            size={24} 
            color={hasReminder ? colors.primary : colors.text + '60'} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Nhắc nhở
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
            {hasReminder 
              ? (reminderTime 
                  ? `Nhắc lúc ${reminderTime.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}`
                  : 'Đã bật')
              : 'Đã tắt'
            }
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.toggle,
          {
            backgroundColor: hasReminder ? colors.primary : colors.text + '30',
            opacity: disabled ? 0.5 : 1,
          }
        ]}
        onPress={handleToggle}
        disabled={disabled}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: colors.surface,
              transform: [{ translateX: hasReminder ? 20 : 2 }],
            }
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
