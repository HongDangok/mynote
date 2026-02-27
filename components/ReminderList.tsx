/*
  Mục đích: Danh sách nhắc nhở từ các ghi chú.
  - Lọc, sắp xếp theo thời gian nhắc nhở; xoá nhắc nhở; điều hướng đến ghi chú
*/
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useNoteContext } from '../contexts/NoteContext';
import { useColorScheme } from '../hooks/useColorScheme';
import { reminderListStyles as styles } from '../styles/style';
import { Note } from '../types/Note';

interface ReminderListProps {
  notes: Note[];
  onNotePress: (note: Note) => void;
  maxItems?: number;
}

export function ReminderList({ notes, onNotePress, maxItems }: ReminderListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { removeReminder } = useNoteContext();
  const [reminders, setReminders] = useState<Note[]>([]);

  useEffect(() => {
    // Filter notes that have upcoming reminders
    const notesWithReminders = notes
      .filter(note => note.reminder && new Date(note.reminder) > new Date())
      .sort((a, b) => new Date(a.reminder!).getTime() - new Date(b.reminder!).getTime());

    setReminders(typeof maxItems === 'number' ? notesWithReminders.slice(0, maxItems) : notesWithReminders);
  }, [notes, maxItems]);

  const handleRemoveReminder = async (note: Note) => {
    Alert.alert(
      'Xóa nhắc nhở',
      'Bạn có chắc muốn xóa nhắc nhở cho ghi chú này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReminder(note.id);
              Alert.alert('Thành công', 'Đã xóa nhắc nhở');
            } catch {
              Alert.alert('Lỗi', 'Không thể xóa nhắc nhở');
            }
          }
        }
      ]
    );
  };

  const formatReminderTime = (date: Date) => {
    const reminderDate = new Date(date);
    const now = new Date();

    // Phần giờ:phút
    const timePart = reminderDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // So sánh theo đầu ngày để ra số ngày chênh lệch
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfReminder = new Date(
      reminderDate.getFullYear(),
      reminderDate.getMonth(),
      reminderDate.getDate()
    );
    const diffDays = Math.round(
      (startOfReminder.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return `${timePart}, hôm nay`;
    if (diffDays === 1) return `${timePart}, ngày mai`;
    if (diffDays === 2) return `${timePart}, ngày kia`;
    if (diffDays > 2) return `${timePart}, ${diffDays} ngày nữa`;

    // Quá khứ: hiển thị ngày giờ đầy đủ
    return reminderDate.toLocaleString('vi-VN');
  };

  const renderReminderItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.reminderItem, { backgroundColor: colors.noteColors[item.color as keyof typeof colors.noteColors] || colors.noteColors.default }]}
      onPress={() => onNotePress(item)}
    >
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title || 'Ghi chú không tiêu đề'}
          </Text>
          <Text style={[styles.reminderTime, { color: colors.text }]}>
            {formatReminderTime(item.reminder!)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveReminder(item)}
        >
          <Ionicons name="close-circle" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.reminderContent, { color: colors.text }]} numberOfLines={2}>
        {item.content}
      </Text>
      <View style={styles.reminderFooter}>
        <Text style={[styles.reminderDate, { color: colors.text }]}>
          {new Date(item.reminder!).toLocaleString('vi-VN')}
        </Text>
        {item.folder && (
          <View style={[styles.folderTag, { backgroundColor: colors.primary }]}>
            <Text style={[styles.folderText, { color: colors.surface }]}>
              {item.folder}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (reminders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off" size={48} color={colors.text} />
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Không có nhắc nhở nào
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.text }]}>
          Tạo ghi chú với nhắc nhở để xem chúng ở đây
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reminders}
      renderItem={renderReminderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

// styles moved to centralized styles/styles.ts
