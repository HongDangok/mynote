/*
  Mục đích: Màn hình Khám phá.
  - Hiển thị thống kê ghi chú, danh sách nhắc nhở, thư mục và thao tác nhanh
  - Cho phép tạo/xóa thư mục và điều hướng đến chi tiết ghi chú
*/
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ReminderList } from '../../components/ReminderList';
import Colors from '../../constants/Colors';
import { useNoteContext } from '../../contexts/NoteContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { exploreStyles as styles } from '../../styles/style';

export default function ExploreScreen() {
  const { state, createFolder, deleteFolder } = useNoteContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  

  const handleCreateFolder = () => {
    // Simple folder creation - in a real app, you'd want a modal
    Alert.prompt(
      'Tạo thư mục mới',
      'Nhập tên thư mục:',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Tạo',
          onPress: (folderName) => {
            if (folderName && folderName.trim()) {
              createFolder(folderName.trim(), 'blue');
            }
          },
        },
      ]
    );
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    Alert.alert(
      'Xóa thư mục',
      `Bạn có chắc chắn muốn xóa thư mục "${folderName}"?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteFolder(folderId),
        },
      ]
    );
  };

  const renderStats = () => (
    <View style={[styles.section, { paddingTop: 24 }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Thống kê</Text>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.noteColors.blue }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {state.notes.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Ghi chú</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.noteColors.green }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {state.notes.filter(n => n.isPinned).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Đã ghim</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.noteColors.orange }]}>
          <Text style={[styles.statNumber, { color: colors.text }]}>
            {state.notes.filter(n => n.reminder).length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Nhắc nhở</Text>
        </View>
      </View>
    </View>
  );

  const renderFolders = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Thư mục</Text>
        <TouchableOpacity onPress={handleCreateFolder} style={styles.addButton}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      {state.folders.length === 0 ? (
        <View style={styles.emptyFolders}>
          <Ionicons name="folder-outline" size={48} color={colors.text + '40'} />
          <Text style={[styles.emptyText, { color: colors.text + '80' }]}>
            Chưa có thư mục nào
          </Text>
        </View>
      ) : (
        <View style={styles.foldersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {state.folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={[styles.folderCard, { backgroundColor: colors.noteColors[folder.color as keyof typeof colors.noteColors] || colors.noteColors.default }]}
                onLongPress={() => handleDeleteFolder(folder.id, folder.name)}
              >
                <View style={styles.folderHeader}>
                  <Ionicons name="folder" size={24} color={colors.text} />
                  <TouchableOpacity
                    onPress={() => handleDeleteFolder(folder.id, folder.name)}
                    style={styles.deleteFolderButton}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.folderName, { color: colors.text }]} numberOfLines={1}>
                  {folder.name}
                </Text>
                <Text style={[styles.folderCount, { color: colors.text + '80' }]}>
                  {state.notes.filter(n => n.folder === folder.id).length} ghi chú
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Thao tác nhanh</Text>
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary }]}>
          <Ionicons name="cloud-upload-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>
            Xuất dữ liệu
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.secondary }]}>
          <Ionicons name="cloud-download-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>
            Nhập dữ liệu
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickAction, { backgroundColor: colors.info }]}
          onPress={() => router.push('/settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.surface} />
          <Text style={[styles.quickActionText, { color: colors.surface }]}>
            Cài đặt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReminders = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Nhắc nhở</Text>
      <View style={styles.reminderContainer}>
        <ReminderList 
          notes={state.notes} 
          onNotePress={(note) => router.push(`/note/${note.id}`)}
          maxItems={2}
        />
      </View>
    </View>
  );

  const renderItem = ({ item }: { item: string }) => {
    switch (item) {
      case 'stats':
        return renderStats();
      case 'reminders':
        return renderReminders();
      case 'folders':
        return renderFolders();
      case 'actions':
        return renderQuickActions();
      default:
        return null;
    }
  };

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      data={['stats', 'reminders', 'folders', 'actions']}
      renderItem={renderItem}
      keyExtractor={(item) => item}
      showsVerticalScrollIndicator={false}
    />
  );
}

// styles moved to centralized styles/styles.ts
