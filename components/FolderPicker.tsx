/*
  Mục đích: Chọn thư mục cho ghi chú.
  - Hiển thị modal danh sách thư mục, tạo thư mục mới, chọn/bỏ chọn
*/
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Colors from '../constants/Colors';
import { useColorScheme } from '../hooks/useColorScheme';
import { Folder } from '../types/Note';

interface FolderPickerProps {
  selectedFolder?: string;
  folders: Folder[];
  onFolderSelect: (folderId: string | undefined) => void;
  onCreateFolder: (name: string, color: string) => void;
  showHeader?: boolean;
}

export function FolderPicker({ 
  selectedFolder, 
  folders, 
  onFolderSelect, 
  onCreateFolder,
  showHeader = true,
}: FolderPickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('blue');
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleCreateFolder = () => {
    setIsCreating(true);
  };

  const handleFolderSelect = (folderId: string) => {
    if (selectedFolder === folderId) {
      // If same folder is selected, deselect it
      onFolderSelect(undefined);
    } else {
      onFolderSelect(folderId);
    }
    setShowModal(false);
  };

  const getSelectedFolderName = () => {
    if (!selectedFolder) return 'Không có thư mục';
    const folder = folders.find(f => f.id === selectedFolder);
    return folder ? folder.name : 'Không có thư mục';
  };

  const getSelectedFolderColor = () => {
    if (!selectedFolder) return colors.text + '60';
    const folder = folders.find(f => f.id === selectedFolder);
    return folder ? colors.noteColors[folder.color as keyof typeof colors.noteColors] || colors.noteColors.default : colors.text + '60';
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Thư mục</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="folder-open" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.folderDisplay, { borderColor: colors.text + '40' }]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.folderInfo}>
          <View 
            style={[
              styles.folderColor, 
              { backgroundColor: getSelectedFolderColor() }
            ]} 
          />
          <Text style={[styles.folderText, { color: colors.text }]}>
            {getSelectedFolderName()}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.text + '60'} />
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn thư mục
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.folderList}>
              <TouchableOpacity
                style={[
                  styles.folderOption,
                  !selectedFolder && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => handleFolderSelect('')}
              >
                <View style={styles.folderOptionInfo}>
                  <View style={[styles.folderOptionColor, { backgroundColor: colors.text + '60' }]} />
                  <Text style={[styles.folderOptionText, { color: colors.text }]}>
                    Không có thư mục
                  </Text>
                </View>
                {!selectedFolder && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>

              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderOption,
                    selectedFolder === folder.id && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => handleFolderSelect(folder.id)}
                >
                  <View style={styles.folderOptionInfo}>
                    <View 
                      style={[
                        styles.folderOptionColor, 
                        { backgroundColor: colors.noteColors[folder.color as keyof typeof colors.noteColors] || colors.noteColors.default }
                      ]} 
                    />
                    <Text style={[styles.folderOptionText, { color: colors.text }]}>
                      {folder.name}
                    </Text>
                  </View>
                  {selectedFolder === folder.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {!isCreating ? (
              <TouchableOpacity
                style={[styles.createFolderButton, { backgroundColor: colors.secondary }]}
                onPress={handleCreateFolder}
              >
                <Ionicons name="add" size={20} color={colors.surface} />
                <Text style={[styles.createFolderText, { color: colors.surface }]}>
                  Tạo thư mục mới
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.createForm}>
                <Text style={[styles.createLabel, { color: colors.text }]}>Tên thư mục</Text>
                <TextInput
                  style={[styles.createInput, { borderColor: colors.text + '40', color: colors.text }]}
                  placeholder="Nhập tên thư mục"
                  placeholderTextColor={colors.text + '60'}
                  value={newFolderName}
                  onChangeText={setNewFolderName}
                />
                <Text style={[styles.createLabel, { color: colors.text, marginTop: 12 }]}>Màu</Text>
                <View style={styles.colorRow}>
                  {['red','pink','purple','blue','cyan','teal','green','lime','yellow','orange','brown','gray'].map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: colors.noteColors[c as keyof typeof colors.noteColors] || colors.noteColors.default },
                        newFolderColor === c && { borderWidth: 2, borderColor: colors.primary },
                      ]}
                      onPress={() => setNewFolderColor(c)}
                    />
                  ))}
                </View>
                <View style={styles.createActions}>
                  <TouchableOpacity
                    style={[styles.createActionBtn, { backgroundColor: colors.text + '14' }]}
                    onPress={() => { setIsCreating(false); setNewFolderName(''); }}
                  >
                    <Text style={[styles.createActionText, { color: colors.text }]}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.createActionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => {
                      const name = newFolderName.trim();
                      if (!name) return;
                      onCreateFolder(name, newFolderColor);
                      setIsCreating(false);
                      setNewFolderName('');
                    }}
                  >
                    <Text style={[styles.createActionText, { color: colors.surface }]}>Tạo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  // modalOverlay and modalContent already defined above in this file
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  folderText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  folderList: {
    maxHeight: 300,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  folderOptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderOptionColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  folderOptionText: {
    fontSize: 16,
    flex: 1,
  },
  createFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  createFolderText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createForm: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  createLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  createInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 8,
  },
  createActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  createActionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
