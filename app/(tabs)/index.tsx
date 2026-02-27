/*
  Mục đích: Màn hình danh sách Ghi chú chính (Home).
  - Tìm kiếm, sắp xếp ghi chú (ưu tiên ghim, nhắc nhở sắp tới, cập nhật gần nhất)
  - Thao tác với ghi chú: mở, xoá, ghim, tạo mới (FAB)
*/
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { FloatingActionButton } from '../../components/FloatingActionButton';
import { NoteCard } from '../../components/NoteCard';
import { SearchBar } from '../../components/SearchBar';
import Colors from '../../constants/Colors';
import { useNoteContext } from '../../contexts/NoteContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { homeStyles as styles } from '../../styles/style';
import { Note } from '../../types/Note';

export default function HomeScreen() {
  const router = useRouter();
  const { state, dispatch, deleteNote, searchNotes, toggleReminder, updateNote, togglePin } = useNoteContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [optionsNote, setOptionsNote] = useState<Note | null>(null);
  const [confirmNoteId, setConfirmNoteId] = useState<string | null>(null);
  
  // Animated collapse for search bar
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [68, 0],
    extrapolate: 'clamp',
  });
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const sortNotes = (notes: Note[]) => {
    const now = Date.now();
    const getTimeToReminder = (note: Note): number => {
      if (!note.reminder || !note.reminderEnabled) return Number.POSITIVE_INFINITY;
      const diff = new Date(note.reminder).getTime() - now;
      return diff >= 0 ? diff : Number.POSITIVE_INFINITY; // only upcoming reminders
    };

    return [...notes].sort((a, b) => {
      // 1) Pinned first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

      // 2) Upcoming reminder sooner first
      const aReminder = getTimeToReminder(a);
      const bReminder = getTimeToReminder(b);
      if (aReminder !== bReminder) return aReminder - bReminder;

      // 3) Fallback: most recently updated first
      const aUpdated = new Date(a.updatedAt).getTime();
      const bUpdated = new Date(b.updatedAt).getTime();
      return bUpdated - aUpdated;
    });
  };

  const handleSearch = useCallback(async () => {
    if (state.searchQuery.trim()) {
      const results = await searchNotes();
      setFilteredNotes(sortNotes(results));
    } else {
      setFilteredNotes(sortNotes(state.notes));
    }
  }, [state.searchQuery, searchNotes, state.notes]);

  useEffect(() => {
    if (state.searchQuery) {
      handleSearch();
    } else {
      setFilteredNotes(sortNotes(state.notes));
    }
  }, [state.notes, state.searchQuery, handleSearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic can be added here
    setRefreshing(false);
  };

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const handleNoteLongPress = (note: Note) => {
    setOptionsNote(note);
  };

  const handleTogglePin = async (note: Note) => {
    try {
      await togglePin(note.id);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái ghim');
    }
  };

  const handleToggleReminder = async (note: Note) => {
    try {
      await toggleReminder(note.id);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái nhắc nhở');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setConfirmNoteId(noteId);
  };

  const handleAddNote = () => {
    router.push('/note/new');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={64} color={colors.text + '40'} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        Chưa có ghi chú nào
      </Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.text + '80' }]}>
        Nhấn nút + để tạo ghi chú đầu tiên
      </Text>
    </View>
  );

  const renderNote = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => handleNotePress(item)}
      onLongPress={() => handleNoteLongPress(item)}
      onTogglePin={() => handleTogglePin(item)}
      onToggleReminder={() => handleToggleReminder(item)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <Animated.View style={{ height: headerHeight, opacity: headerOpacity, overflow: 'hidden' }}>
        <View style={styles.searchRow}>
          <View style={styles.searchFlex}>
            <SearchBar
              value={state.searchQuery}
              onChangeText={(text) => dispatch({ type: 'SET_SEARCH_QUERY', payload: text })}
              onClear={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })}
            />
          </View>
          <View style={styles.statItem}> 
            <Ionicons name="notifications" size={22} color={colors.text} />
            <Text style={[styles.statText, { color: colors.text }]}> 
              {state.notes.filter(n => n.reminder && n.reminderEnabled && new Date(n.reminder) > new Date()).length}
            </Text>
          </View>
        </View>
      </Animated.View>

      {state.loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Đang tải...
          </Text>
        </View>
      ) : (
        <Animated.FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        />
      )}

      <FloatingActionButton onPress={handleAddNote} />

      {/* Custom rounded options modal */}
      <Modal visible={!!optionsNote} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOptionsNote(null)}>
          <View style={styles.optionsOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.optionsCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionsTitle, { color: colors.text }]}>Tùy chọn ghi chú</Text>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={() => {
                const n = optionsNote;
                setOptionsNote(null);
                if (n) router.push(`/note/${n.id}?edit=1`);
              }}
            >
              <Text style={[styles.optionsItemText, { color: colors.text }]}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionsItem}
              onPress={() => {
                const n = optionsNote;
                setOptionsNote(null);
                if (n) handleDeleteNote(n.id);
              }}
            >
              <Text style={[styles.optionsItemTextDestructive, { color: colors.error }]}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsCancel} onPress={() => setOptionsNote(null)}>
              <Text style={[styles.optionsCancelText, { color: colors.text }]}>Hủy</Text>
            </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirm delete modal with rounded corners */}
      <Modal visible={!!confirmNoteId} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setConfirmNoteId(null)}>
          <View style={styles.optionsOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.optionsTitle, { color: colors.text, textAlign: 'center' }]}>Xác nhận xóa</Text>
            <Text style={{ color: colors.text + 'CC', textAlign: 'center', marginBottom: 12 }}>
              Bạn có chắc chắn muốn xóa ghi chú này?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.confirmButton} onPress={() => setConfirmNoteId(null)}>
                <Text style={[styles.confirmButtonText, { color: colors.text }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: colors.error }]}
                onPress={async () => {
                  const id = confirmNoteId;
                  setConfirmNoteId(null);
                  if (!id) return;
                  try {
                    await deleteNote(id);
                  } catch {
                    Alert.alert('Lỗi', 'Không thể xóa ghi chú');
                  }
                }}
              >
                <Text style={[styles.confirmButtonText, { color: colors.surface }]}>Xóa</Text>
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

// styles moved to centralized styles/styles.ts
