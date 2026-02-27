/*
  Mục đích: Chọn và quản lý nhắc nhở cho ghi chú.
  - Chọn ngày/giờ (DateTimePicker), xác nhận/hủy, xoá nhắc nhở hiện tại
*/
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Modal, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { reminderPickerStyles as styles } from '../styles/style';

interface ReminderPickerProps {
  reminder?: Date;
  onReminderChange: (date: Date | undefined) => void;
  showHeader?: boolean;
}

export function ReminderPicker({ reminder, onReminderChange, showHeader = true }: ReminderPickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [tempDate, setTempDate] = useState(reminder || new Date());
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (selectedDate) {
        setTempDate(selectedDate);
        if (pickerMode === 'date') {
          setPickerMode('time');
        } else {
          setShowPicker(false);
          onReminderChange(selectedDate);
        }
      }
    } else {
      setTempDate(selectedDate || tempDate);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
    onReminderChange(tempDate);
  };

  const handleCancel = () => {
    setShowPicker(false);
    setTempDate(reminder || new Date());
    setPickerMode('date');
  };

  const handleNext = () => {
    if (pickerMode === 'date') {
      setPickerMode('time');
    } else {
      setShowPicker(false);
      onReminderChange(tempDate);
    }
  };

  const handleBack = () => {
    if (pickerMode === 'time') {
      setPickerMode('date');
    }
  };

  const handleRemoveReminder = () => {
    onReminderChange(undefined);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Hôm nay lúc ${date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Ngày mai lúc ${date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays > 1) {
      return `${date.toLocaleDateString('vi-VN', { 
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })} lúc ${date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleString('vi-VN');
    }
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Nhắc nhở</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => {
              setPickerMode('date');
              setShowPicker(true);
            }}
          >
            <Ionicons name="add" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      )}

      {reminder ? (
        <View style={[styles.reminderContainer, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.reminderInfo}
            onPress={() => {
              setTempDate(reminder);
              setPickerMode('date');
              setShowPicker(true);
            }}
          >
            <Ionicons name="alarm" size={20} color={colors.primary} />
            <Text style={[styles.reminderText, { color: colors.text }]}>
              {formatDate(reminder)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRemoveReminder}>
            <Ionicons name="close-circle" size={24} color={colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.noReminder, { borderColor: colors.text + '40' }]}
          onPress={() => {
            setPickerMode('date');
            setShowPicker(true);
          }}
        >
          <Ionicons name="alarm-outline" size={20} color={colors.text + '60'} />
          <Text style={[styles.noReminderText, { color: colors.text + '60' }]}>
            Thêm nhắc nhở
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {pickerMode === 'date' ? 'Chọn ngày' : 'Chọn giờ'}
              </Text>
              <Text style={[styles.modalSubtitle, { color: colors.text + '80' }]}>
                {pickerMode === 'date' 
                  ? tempDate.toLocaleDateString('vi-VN', { 
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : tempDate.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                }
              </Text>
            </View>
            
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={tempDate}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
                style={styles.datePicker}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: colors.text + '40' }]}
                onPress={handleCancel}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Hủy
                </Text>
              </TouchableOpacity>
              
              {pickerMode === 'time' && (
                <TouchableOpacity
                  style={[styles.modalButton, { borderColor: colors.text + '40' }]}
                  onPress={handleBack}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Quay lại
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={pickerMode === 'date' ? handleNext : handleConfirm}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>
                  {pickerMode === 'date' ? 'Tiếp theo' : 'Xác nhận'}
                </Text>
              </TouchableOpacity>
            </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// styles moved to centralized styles/style.ts
