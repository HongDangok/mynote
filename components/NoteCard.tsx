/*
  Mục đích: Thẻ hiển thị tóm tắt một ghi chú.
  - Hiển thị tiêu đề, nội dung, tag, màu, ghim và nhắc nhở
  - Hỗ trợ nhấn, giữ lâu và toggle ghim
*/
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { noteCardStyles as styles } from '../styles/style';
import { Note } from '../types/Note';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onLongPress: () => void;
  onTogglePin: () => void;
  onToggleReminder: () => void;
}

export const NoteCard = React.memo(function NoteCard({ note, onPress, onLongPress, onTogglePin, onToggleReminder }: NoteCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isSwitchInteracting, setIsSwitchInteracting] = React.useState(false);

  // Lấy nội dung xem trước từ blocks nếu có, fallback về content thuần
  const getPreviewText = () => {
    if (note.blocks && note.blocks.length > 0) {
      // Ưu tiên lấy nội dung text đầu tiên không rỗng trong blocks
      const firstText = note.blocks.find((b: any) => b.type === 'text' && !!(b.content || '').trim());
      if (firstText && (firstText as any).content) {
        return (firstText as any).content as string;
      }
    }
    return note.content || '';
  };

  // Phát hiện có ảnh/âm thanh/checklist để hiển thị icon
  const hasImage = React.useMemo(() => {
    if (note.blocks && note.blocks.length > 0) return note.blocks.some((b: any) => b.type === 'image');
    if (note.images && note.images.length > 0) return true;
    return false;
  }, [note.blocks, note.images]);

  const hasAudio = React.useMemo(() => {
    if (note.blocks && note.blocks.length > 0) return note.blocks.some((b: any) => b.type === 'audio');
    if (note.audioUri) return true;
    return false;
  }, [note.blocks, note.audioUri]);

  const hasChecklist = React.useMemo(() => {
    if (note.blocks && note.blocks.length > 0) return note.blocks.some((b: any) => b.type === 'checklist');
    if (note.checklist && note.checklist.length > 0) return true;
    return false;
  }, [note.blocks, note.checklist]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hôm nay';
    if (diffDays === 2) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays - 1} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };

  const formatReminderDateTime = (date: Date) => {
    const reminderDate = new Date(date);
    const now = new Date();

    // Thời gian hiển thị giờ:phút
    const timePart = reminderDate.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Tính số ngày chênh lệch theo mốc đầu ngày
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

    // Quá khứ hoặc trường hợp khác: hiển thị ngày giờ đầy đủ
    return reminderDate.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getNoteColor = () => {
    return colors.noteColors[note.color as keyof typeof colors.noteColors] || colors.noteColors.default;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: getNoteColor() },
        note.isPinned && styles.pinned
      ]}
      onPress={() => {
        if (isSwitchInteracting) return;
        onPress();
      }}
      onLongPress={onLongPress}
      activeOpacity={1}
    >
      {note.isPinned && (
        <View style={styles.pinIndicator}>
          <Ionicons name="pin" size={16} color={colors.primary} />
        </View>
      )}
      
      <View style={styles.header}>
        <Text 
          style={[
            note.title ? styles.title : styles.titlePlaceholder, 
            { color: note.title ? colors.text : colors.text + '80' }
          ]} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {note.title || 'Không có tiêu đề'}
        </Text>
        <View style={styles.headerActions}>
          {note.reminder && (
            <Switch
              value={note.reminderEnabled}
              onTouchStart={() => setIsSwitchInteracting(true)}
              onTouchEnd={() => setTimeout(() => setIsSwitchInteracting(false), 0)}
              onValueChange={onToggleReminder}
              trackColor={{ false: colors.tabIconDefault, true: colors.primary }}
              thumbColor={note.reminderEnabled ? colors.surface : colors.text}
              style={styles.reminderSwitch}
            />
          )}
          <TouchableOpacity 
            onPress={onTogglePin} 
            style={styles.pinButton}
            activeOpacity={1}
          >
            <Ionicons 
              name={note.isPinned ? "pin" : "pin-outline"} 
              size={24} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <Text 
        style={[styles.content, { color: colors.text }]} 
        numberOfLines={3}
      >
        {getPreviewText() || 'Không có nội dung'}
      </Text>

      {(note.tags.length > 0 || hasImage || hasAudio || hasChecklist) && (
        <View style={styles.tagsContainer}>
          {note.tags.slice(0, 3).map((tag, index) => (
            <View key={`tag-${index}`} style={[styles.tag, { backgroundColor: colors.primary }]}>
              <Text style={[styles.tagText, { color: colors.surface }]}>
                {tag.replace(/^@/, '')}
              </Text>
            </View>
          ))}
          {note.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: colors.text }]}>+{note.tags.length - 3}</Text>
          )}
          {hasImage && (
            <Ionicons name="image-outline" size={16} color={colors.text} style={{ marginRight: 6, alignSelf: 'center', opacity: 0.7 }} />
          )}
          {hasAudio && (
            <Ionicons name="volume-high-outline" size={16} color={colors.text} style={{ marginRight: 6, alignSelf: 'center', opacity: 0.7 }} />
          )}
          {hasChecklist && (
            <Ionicons name="checkbox-outline" size={16} color={colors.text} style={{ marginRight: 6, alignSelf: 'center', opacity: 0.7 }} />
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={[styles.date, { color: colors.text }]}>
          {formatDate(note.updatedAt)}
        </Text>
        
        {note.reminder && note.reminderEnabled && (
          <View style={styles.reminderIndicator}>
            <Ionicons name="alarm" size={16} color={colors.warning} />
            <Text style={[styles.reminderText, { color: colors.warning }]}>
              {formatReminderDateTime(note.reminder)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.note.title === nextProps.note.title &&
    prevProps.note.content === nextProps.note.content &&
    prevProps.note.isPinned === nextProps.note.isPinned &&
    prevProps.note.reminderEnabled === nextProps.note.reminderEnabled &&
    prevProps.note.reminder?.getTime() === nextProps.note.reminder?.getTime() &&
    prevProps.note.updatedAt.getTime() === nextProps.note.updatedAt.getTime() &&
    prevProps.note.tags.length === nextProps.note.tags.length &&
    prevProps.note.tags.every((tag, i) => tag === nextProps.note.tags[i]) &&
    JSON.stringify(prevProps.note.blocks) === JSON.stringify(nextProps.note.blocks)
  );
});

// styles moved to centralized styles/styles.ts
