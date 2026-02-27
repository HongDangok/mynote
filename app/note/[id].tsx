/*
  Mục đích: Màn hình tạo/sửa chi tiết ghi chú.
  - Tạo mới (id = 'new') hoặc chỉnh sửa ghi chú hiện có
  - Chọn màu, nhắc nhở, thư mục, tags; ghim, xoá, lưu
*/
import { Ionicons } from '@expo/vector-icons';
// removed auto-save hooks
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FolderPicker } from '../../components/FolderPicker';
import { ReminderPicker } from '../../components/ReminderPicker';
import Colors from '../../constants/Colors';
import { useNoteContext } from '../../contexts/NoteContext';
import { useColorScheme } from '../../hooks/useColorScheme';
import { noteStyles as styles } from '../../styles/style';
import { NoteFormData } from '../../types/Note';
const DragContext = React.createContext<(() => void) | null>(null);

export default function NoteScreen() {
  const router = useRouter();
  const { id, edit } = useLocalSearchParams();
  const { state, createNote, updateNote, deleteNote, createFolder, removeReminder } = useNoteContext();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isNew = id === 'new' || (Array.isArray(id) && id[0] === 'new');
  const viewingNote = !isNew ? state.notes.find(n => n.id === id) : undefined;
  
  const [isEditing, setIsEditing] = useState(false);
  const [hiddenSavedTags, setHiddenSavedTags] = useState<string[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    color: 'default',
    tags: [],
    reminderEnabled: false,
    repeatDays: [],
    isPinned: false,
  });
  const [showReminderUI, setShowReminderUI] = useState(false);
  const [showFolderUI, setShowFolderUI] = useState(false);
  const [showMediaUI, setShowMediaUI] = useState(false);
  const [showAudioUI, setShowAudioUI] = useState(false);
  const [showChecklistUI, setShowChecklistUI] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingPermissionStatus, setRecordingPermissionStatus] = useState<'undetermined' | 'granted' | 'denied'>('undetermined');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [textHeights, setTextHeights] = useState<{ [blockId: string]: number }>({});
  const [lastFocusedBlockId, setLastFocusedBlockId] = useState<string | null>(null);
  const [selectionByBlock, setSelectionByBlock] = useState<{ [blockId: string]: number }>({});
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const lastImageTapTsRef = React.useRef<number>(0);
  const lastImageTapUriRef = React.useRef<string | null>(null);
  const hasAnyContentOrMedia = React.useMemo(() => {
    if ((formData.content || '').trim().length > 0) return true;
    const blocks = formData.blocks || [];
    return blocks.some((b: any) => b.type !== 'text' || (b.type === 'text' && ((b.content || '').length > 0)));
  }, [formData]);

  // Audio playback
  const playingSoundRef = React.useRef<Audio.Sound | null>(null);
  const playAudioUri = async (uri?: string) => {
    try {
      if (!uri) return;
      if (playingSoundRef.current) {
        try { await playingSoundRef.current.stopAsync(); } catch {}
        try { await playingSoundRef.current.unloadAsync(); } catch {}
        playingSoundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync({ uri });
      playingSoundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status?.didJustFinish) {
          sound.unloadAsync().finally(() => { if (playingSoundRef.current === sound) playingSoundRef.current = null; });
        }
      });
      await sound.playAsync();
    } catch {}
  };

  useEffect(() => {
    if (isNew) {
      setIsEditing(true);
      setFormData({
        title: '',
        content: '',
        color: 'default',
        tags: [],
        reminderEnabled: false,
        repeatDays: [],
        isPinned: false,
        images: [],
        checklist: [],
        blocks: [],
      });
      // no auto-save snapshot
    } else {
      const foundNote = state.notes.find(n => n.id === id);
      if (foundNote) {
        const hasLegacy = !!(foundNote.content || (foundNote.images && foundNote.images.length) || foundNote.audioUri || (foundNote.checklist && foundNote.checklist.length));
        const existingBlocks: any[] = (foundNote as any).blocks || [];
        const shouldConvert = existingBlocks.length === 0 && hasLegacy;
        const convertedBlocks: any[] = shouldConvert
          ? [
              ...(foundNote.content ? [{ id: `${foundNote.id}-t1`, type: 'text', content: foundNote.content }] : []),
              ...((foundNote.images || []).map((u: string, idx: number) => ({ id: `${foundNote.id}-i${idx+1}`, type: 'image', uri: u }))),
              ...(foundNote.audioUri ? [{ id: `${foundNote.id}-a1`, type: 'audio', uri: foundNote.audioUri, durationMs: (foundNote as any).audioDurationMs }] : []),
              ...((foundNote.checklist || []).length ? [{ id: `${foundNote.id}-c1`, type: 'checklist', items: (foundNote.checklist || []).map((it: any, idx: number) => ({ id: `${idx+1}`, text: it.text || it, checked: !!it.done })) }] : [])
            ]
          : existingBlocks;
        setFormData({
          title: foundNote.title,
          content: shouldConvert ? '' : foundNote.content,
          color: foundNote.color,
          tags: foundNote.tags,
          reminder: foundNote.reminder,
          reminderEnabled: foundNote.reminderEnabled ?? false,
          repeatDays: foundNote.repeatDays || [],
          isPinned: foundNote.isPinned,
          folder: foundNote.folder,
          images: shouldConvert ? [] : (foundNote.images || []),
          audioUri: shouldConvert ? undefined : foundNote.audioUri,
          audioDurationMs: shouldConvert ? undefined : (foundNote as any).audioDurationMs,
          checklist: shouldConvert ? [] : (foundNote.checklist || []),
          blocks: convertedBlocks,
        });
        // no auto-save snapshot
        // Nếu có query edit=1 thì vào thẳng chế độ chỉnh sửa
        const editFlag = (typeof edit === 'string' && edit === '1') || (Array.isArray(edit) && edit[0] === '1');
        if (editFlag) {
          setIsEditing(true);
        }
      }
    }
  }, [id, isNew, edit, state.notes]);

  // Track keyboard visibility for accessory bar
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setIsKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setIsKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Cleanup audio resources when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup playing sound
      if (playingSoundRef.current) {
        playingSoundRef.current.stopAsync().catch(() => {});
        playingSoundRef.current.unloadAsync().catch(() => {});
        playingSoundRef.current = null;
      }
      // Cleanup recording if exists
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);


  // Auto-save removed

  // Validation constants
  const MAX_TITLE_LENGTH = 200;
  const MAX_CONTENT_LENGTH = 10000;
  const MAX_TAGS_COUNT = 20;

  const validateNote = (): { valid: boolean; error?: string } => {
    // Check if note has any content
    const hasTitle = formData.title.trim().length > 0;
    const hasContent = formData.content.trim().length > 0;
    const hasBlocks = (formData.blocks || []).length > 0;
    const hasImages = (formData.images || []).length > 0;
    const hasAudio = !!formData.audioUri;
    const hasChecklist = (formData.checklist || []).length > 0;

    if (!hasTitle && !hasContent && !hasBlocks && !hasImages && !hasAudio && !hasChecklist) {
      return { valid: false, error: 'Vui lòng nhập tiêu đề hoặc nội dung' };
    }

    // Validate title length
    if (formData.title.length > MAX_TITLE_LENGTH) {
      return { valid: false, error: `Tiêu đề không được vượt quá ${MAX_TITLE_LENGTH} ký tự` };
    }

    // Validate content length (legacy)
    if (formData.content.length > MAX_CONTENT_LENGTH) {
      return { valid: false, error: `Nội dung không được vượt quá ${MAX_CONTENT_LENGTH} ký tự` };
    }

    // Validate tags count
    if (formData.tags.length > MAX_TAGS_COUNT) {
      return { valid: false, error: `Số lượng tags không được vượt quá ${MAX_TAGS_COUNT}` };
    }

    return { valid: true };
  };

  const saveNote = async (silent: boolean) => {
    // Validate input
    const validation = validateNote();
    if (!validation.valid) {
      if (!silent) Alert.alert('Lỗi', validation.error || 'Dữ liệu không hợp lệ');
      return;
    }

    if (!silent) setIsSaving(true);
    try {
      if (id === 'new') {
        // Create new note
        await createNote(formData);
        if (!silent) Alert.alert('Thành công', 'Ghi chú đã được tạo');
        if (!silent) router.back();
      } else {
        // Update existing note
        await updateNote(id as string, formData);
        if (!silent) Alert.alert('Thành công', 'Ghi chú đã được cập nhật');
        if (!silent) setIsEditing(false);
      }
      // auto-save snapshot removed
    } catch (error) {
      console.error('Error saving note:', error);
      if (!silent) {
        const errorMessage = error instanceof Error ? error.message : 'Không thể lưu ghi chú';
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleSave = async () => saveNote(false);

  const handleBack = async () => {
    if (formData.title.trim() || formData.content.trim()) {
      await saveNote(true);
    }
    router.back();
  };

  const handleDelete = () => {
    if (id === 'new') {
      router.back();
      return;
    }
    setConfirmDeleteVisible(true);
  };

  // Media handlers
  const pickImages = async () => {
    setIsLoadingImages(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Ứng dụng cần quyền truy cập thư viện ảnh để thêm ảnh vào ghi chú. Vui lòng cấp quyền trong Cài đặt.',
          [{ text: 'OK' }]
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 5,
      });
      if (!result.canceled && result.assets) {
        const uris = result.assets?.map(a => a.uri) || [];
        if ((formData.blocks || []).length > 0) {
          // Insert images by splitting the focused text block at cursor
          setFormData(prev => {
            const blocks = [...(prev.blocks || [])] as any[];
            const focusedId = lastFocusedBlockId;
            const insertion = uris.map((u, idx) => ({ id: `${Date.now()}-img-${idx}`, type: 'image', uri: u } as any));
            if (focusedId) {
              const idx = blocks.findIndex(b => b.id === focusedId);
              if (idx >= 0 && blocks[idx]?.type === 'text') {
                const cursor = selectionByBlock[focusedId] ?? ((blocks[idx] as any).content?.length || 0);
                const full = String((blocks[idx] as any).content || '');
                const before = full.slice(0, cursor);
                const after = full.slice(cursor);
                const beforeBlock = { id: `${focusedId}-b`, type: 'text', content: before } as any;
                const afterBlock = { id: `${focusedId}-a`, type: 'text', content: after } as any;
                // replace idx with beforeBlock, images, afterBlock (always include both text inputs)
                const newSeq: any[] = [beforeBlock, ...insertion, afterBlock];
                blocks.splice(idx, 1, ...newSeq);
                return { ...prev, blocks } as any;
              }
            }
            // fallback: append to end with text fields around
            const last = blocks[blocks.length - 1];
            const seq: any[] = [];
            if (!last || last.type !== 'text') {
              seq.push({ id: `${Date.now()}-t-before`, type: 'text', content: '' } as any);
            }
            seq.push(...insertion);
            seq.push({ id: `${Date.now()}-t-after`, type: 'text', content: '' } as any);
            return { ...prev, blocks: [...blocks, ...seq] } as any;
          });
        } else {
          // legacy content: always convert to blocks and insert at cursor (or end) with text above & below
          const cursor = selectionByBlock['__legacy'] ?? (formData.content?.length || 0);
          const full = String(formData.content || '');
          const before = full.slice(0, cursor);
          const after = full.slice(cursor);
          const newBlocks: any[] = [];
          newBlocks.push({ id: `${Date.now()}-t1`, type: 'text', content: before } as any);
          uris.forEach((u, i) => newBlocks.push({ id: `${Date.now()}-img-${i}`, type: 'image', uri: u } as any));
          newBlocks.push({ id: `${Date.now()}-t2`, type: 'text', content: after } as any);
          setFormData(prev => ({
            ...prev,
            content: '',
            images: [],
            blocks: newBlocks,
          }));
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể chọn ảnh';
      Alert.alert('Lỗi', `Không thể chọn ảnh: ${errorMessage}`);
    } finally {
      setIsLoadingImages(false);
    }
  };

  const removeImage = (uri: string) => {
    setFormData(prev => ({ ...prev, images: (prev.images || []).filter(u => u !== uri) }));
  };

  const requestMicPermissionIfNeeded = async () => {
    if (recordingPermissionStatus === 'granted') return true;
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setRecordingPermissionStatus(status);
      if (status !== 'granted') {
        Alert.alert(
          'Quyền bị từ chối',
          'Ứng dụng cần quyền ghi âm để thêm audio vào ghi chú. Vui lòng cấp quyền trong Cài đặt.',
          [{ text: 'OK' }]
        );
      }
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting mic permission:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const ok = await requestMicPermissionIfNeeded();
      if (!ok) {
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể bắt đầu ghi âm';
      Alert.alert('Lỗi', `Không thể bắt đầu ghi âm: ${errorMessage}`);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const status = await recording.getStatusAsync();
      setRecording(null);
      const durationMs = (status as any)?.durationMillis as number | undefined;
      if (uri) {
        insertBlocksAtCursor([{ id: `${Date.now()}-aud`, type: 'audio', uri, durationMs } as any]);
      } else {
        Alert.alert('Cảnh báo', 'Không thể lấy file ghi âm');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể dừng ghi âm';
      Alert.alert('Lỗi', `Không thể dừng ghi âm: ${errorMessage}`);
      setRecording(null); // Reset recording state even on error
    }
  };

  const clearAudio = () => setFormData(prev => ({ ...prev, audioUri: undefined }));

  const formatDuration = (ms?: number) => {
    if (!ms || ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (totalSeconds % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  // Render helpers
  const handleImagePress = (uri: string) => {
    const now = Date.now();
    if (lastImageTapUriRef.current === uri && now - lastImageTapTsRef.current < 300) {
      setPreviewImageUri(uri);
    }
    lastImageTapUriRef.current = uri;
    lastImageTapTsRef.current = now;
  };

  // Insert arbitrary blocks at current cursor position (in blocks or legacy content)
  const insertBlocksAtCursor = (newBlocks: any[]) => {
    if ((formData.blocks || []).length > 0) {
      setFormData(prev => {
        const blocks = [...(prev.blocks || [])] as any[];
        const focusedId = lastFocusedBlockId;
        if (focusedId) {
          const idx = blocks.findIndex(b => b.id === focusedId);
          if (idx >= 0 && blocks[idx]?.type === 'text') {
            const cursor = selectionByBlock[focusedId] ?? ((blocks[idx] as any).content?.length || 0);
            const full = String((blocks[idx] as any).content || '');
            const before = full.slice(0, cursor);
            const after = full.slice(cursor);
            const beforeBlock = { id: `${focusedId}-b`, type: 'text', content: before } as any;
            const afterBlock = { id: `${focusedId}-a`, type: 'text', content: after } as any;
            const seq: any[] = [beforeBlock, ...newBlocks, afterBlock];
            blocks.splice(idx, 1, ...seq);
            return { ...prev, blocks } as any;
          }
        }
        // fallback append
        return { ...prev, blocks: [...blocks, ...newBlocks] } as any;
      });
    } else {
      // legacy content: convert to blocks with insertion at cursor
      const cursor = selectionByBlock['__legacy'] ?? (formData.content?.length || 0);
      const full = String(formData.content || '');
      const before = full.slice(0, cursor);
      const after = full.slice(cursor);
      const converted: any[] = [
        { id: `${Date.now()}-t1`, type: 'text', content: before } as any,
        ...newBlocks,
        { id: `${Date.now()}-t2`, type: 'text', content: after } as any,
      ];
      setFormData(prev => ({ ...prev, content: '', images: [], audioUri: undefined, audioDurationMs: undefined, checklist: [], blocks: converted }));
    }
  };

  const ImageThumb = ({ uri, onDelete }: { uri: string; onDelete?: () => void }) => {
    const dragFromContext = React.useContext(DragContext);
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={() => handleImagePress(uri)} onLongPress={() => (dragFromContext && (dragFromContext as any)())}>
        <View style={{ borderRadius: 8, overflow: 'hidden', backgroundColor: colors.noteColors.gray }}>
          <Image source={{ uri }} style={{ width: '100%', height: 200 }} contentFit="cover" />
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={{ position: 'absolute', right: 8, bottom: 8, backgroundColor: colors.noteColors.gray, borderRadius: 16, padding: 6 }}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  const deleteBlock = (blockId: string) => {
    setFormData(prev => ({
      ...prev,
      blocks: (prev.blocks || []).filter(b => b.id !== blockId),
    }));
  };

  const moveBlock = (blockId: string, direction: -1 | 1) => {
    setFormData(prev => {
      const blocks = [...(prev.blocks || [])] as any[];
      const idx = blocks.findIndex(b => b.id === blockId);
      const target = idx + direction;
      if (idx === -1 || target < 0 || target >= blocks.length) return prev;
      const tmp = blocks[idx];
      blocks[idx] = blocks[target];
      blocks[target] = tmp;
      return { ...prev, blocks } as any;
    });
  };

  const renderBlockToolbar = (blockId: string) => null;

  const renderTextInput = (blockId: string, value: string) => (
    <TextInput
      key={blockId}
      style={[
        styles.contentInput,
        { color: colors.text, paddingVertical: (value || '').length === 0 ? 2 : 6, minHeight: 0 },
        typeof textHeights[blockId] === 'number'
          ? { height: (value || '').length === 0 ? 20 : Math.max(20, textHeights[blockId]) }
          : { height: (value || '').length === 0 ? 20 : undefined },
      ]}
      value={value}
      onChangeText={(text) => setFormData(prev => ({
        ...prev,
        blocks: (prev.blocks || []).map(b => b.id === blockId ? ({ ...b, content: text } as any) : b)
      }))}
      placeholder={hasAnyContentOrMedia ? '' : "Nhập ghi chú..."}
      placeholderTextColor={colors.text + '60'}
      multiline
      textAlignVertical="top"
      editable={isEditing}
      onFocus={() => setIsTextInputFocused(true)}
      onBlur={() => setIsTextInputFocused(false)}
      onSelectionChange={(e) => {
        const start = e.nativeEvent.selection?.start ?? 0;
        setLastFocusedBlockId(blockId);
        setSelectionByBlock(prev => ({ ...prev, [blockId]: start }));
      }}
      onContentSizeChange={(e) => {
        const h = e.nativeEvent.contentSize?.height || 0;
        setTextHeights(prev => ({ ...prev, [blockId]: h }));
      }}
    />
  );

  const renderBlockList = (header?: React.ReactNode, footer?: React.ReactNode, listScrollEnabled: boolean = true) => {
    const blocks = formData.blocks || [];
    const elements: any[] = [];
    let i = 0;
    while (i < blocks.length) {
      const b: any = blocks[i];
      if (b.type === 'text' && i + 1 < blocks.length && blocks[i + 1].type !== 'text') {
        // Collect consecutive non-text blocks (image/audio/checklist)
        const top = b;
        let j = i + 1;
        const nonText: any[] = [];
        while (j < blocks.length && blocks[j].type !== 'text') {
          nonText.push(blocks[j]);
          j++;
        }
        const bottomIsReal = j < blocks.length && blocks[j].type === 'text';
        const bottom: any = bottomIsReal ? blocks[j] : { id: `${top.id}-after`, type: 'text', content: '' };

        elements.push(
           <View key={`grp-${top.id}`}>
            <View style={{ padding: 8 }}>
              {renderTextInput(top.id, top.content || '')}
              {/* toolbar removed for text */}
              {nonText.map((blk: any) => {
                if (blk.type === 'image') {
                  return (
                    <View key={blk.id} style={{ marginTop: 6 }}>
                      <ImageThumb uri={blk.uri} onDelete={() => deleteBlock(blk.id)} />
                    </View>
                  );
                }
                if (blk.type === 'audio') {
                  return (
                    <View key={blk.id} style={{ marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => playAudioUri(blk.uri)}>
                          <Ionicons name="volume-high-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text }}>{formatDuration(blk.durationMs)}</Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => deleteBlock(blk.id)} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.noteColors.gray }}>
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }
                if (blk.type === 'checklist') {
                  return (
                    <View key={blk.id} style={{ marginTop: 6, gap: 8 }}>
                      {(blk.items || []).map((item: any) => (
                        <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <TouchableOpacity onPress={() => setFormData(prev => ({
                            ...prev,
                            blocks: (prev.blocks || []).map(bb => bb.id === blk.id ? ({ ...bb, items: (bb as any).items.map((it: any) => it.id === item.id ? { ...it, checked: !it.checked } : it) } as any) : bb)
                          }))}>
                            <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={22} color={colors.text} />
                          </TouchableOpacity>
                          <TextInput
                            style={{ flex: 1, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text + '30', paddingVertical: 6 }}
                            value={item.text}
                            onChangeText={(text) => setFormData(prev => ({
                              ...prev,
                              blocks: (prev.blocks || []).map(bb => bb.id === blk.id ? ({ ...bb, items: (bb as any).items.map((it: any) => it.id === item.id ? { ...it, text } : it) } as any) : bb)
                            }))}
                            placeholder="Nội dung công việc"
                            placeholderTextColor={colors.text + '60'}
                            onFocus={() => setIsTextInputFocused(true)}
                            onBlur={() => setIsTextInputFocused(false)}
                          />
                        </View>
                      ))}
                      {renderBlockToolbar(blk.id)}
                    </View>
                  );
                }
                return null;
              })}
              {renderTextInput(bottom.id, bottom.content || '')}
              {/* toolbar removed for text */}
            </View>
          </View>
        );

        i = j + (bottomIsReal ? 1 : 0);
        continue;
      }

      // Default rendering for non-composite cases
      if (b.type === 'text') {
        elements.push(
          <View key={`wrap-${b.id}`}>
            {renderTextInput(b.id, b.content || '')}
            {renderBlockToolbar(b.id)}
          </View>
        );
      } else if (b.type === 'image') {
        elements.push(
          <View key={`wrap-${b.id}`}>
            <ImageThumb uri={b.uri} onDelete={() => deleteBlock(b.id)} />
          </View>
        );
      } else if (b.type === 'audio') {
        elements.push(
          <View key={`wrap-${b.id}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity onPress={() => playAudioUri(b.uri)}>
                <Ionicons name="volume-high-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={{ color: colors.text }}>{formatDuration(b.durationMs)}</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => deleteBlock(b.id)} style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.noteColors.gray }}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        );
      } else if (b.type === 'checklist') {
        elements.push(
          <View key={`wrap-${b.id}`} style={{ gap: 8 }}>
            {(b.items || []).map((item: any) => (
              <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TouchableOpacity onPress={() => setFormData(prev => ({
                  ...prev,
                  blocks: (prev.blocks || []).map(bb => bb.id === b.id ? ({ ...bb, items: (bb as any).items.map((it: any) => it.id === item.id ? { ...it, checked: !it.checked } : it) } as any) : bb)
                }))}>
                  <Ionicons name={item.checked ? 'checkbox' : 'square-outline'} size={22} color={colors.text} />
                </TouchableOpacity>
                <TextInput
                  style={{ flex: 1, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text + '30', paddingVertical: 6 }}
                  value={item.text}
                  onChangeText={(text) => setFormData(prev => ({
                    ...prev,
                    blocks: (prev.blocks || []).map(bb => bb.id === b.id ? ({ ...bb, items: (bb as any).items.map((it: any) => it.id === item.id ? { ...it, text } : it) } as any) : bb)
                  }))}
                  placeholder="Việc cần làm"
                  placeholderTextColor={colors.text + '60'}
                  onFocus={() => setIsTextInputFocused(true)}
                  onBlur={() => setIsTextInputFocused(false)}
                />
              </View>
            ))}
          </View>
        );
      }
      i++;
    }
    return (
      <DraggableFlatList
        data={elements.map((el: any, idx: number) => ({ key: `k-${idx}`, el }))}
        keyExtractor={(item) => item.key}
        renderItem={({ item, drag }: RenderItemParams<{ key: string; el: any }>) => (
          <DragContext.Provider value={drag as any}>
            <View style={{ marginBottom: 6 }}>
              {item.el}
            </View>
          </DragContext.Provider>
        )}
        scrollEnabled={listScrollEnabled}
        ListHeaderComponent={header as any}
        ListFooterComponent={footer as any}
        onDragEnd={({ from, to }) => {
          if (from === to) return;
          setFormData(prev => {
            const b = [...(prev.blocks || [])] as any[];
            const [moved] = b.splice(from, 1);
            b.splice(to, 0, moved);
            return { ...prev, blocks: b } as any;
          });
        }}
      />
    );
  };

  // Checklist handlers
  const addChecklistItem = () => {
    const id = Date.now().toString();
    // insert a checklist block at cursor
    insertBlocksAtCursor([{ id: `${Date.now()}-chk`, type: 'checklist', items: [{ id: '1', text: '', checked: false }] } as any]);
  };

  // Block-based: add new empty text block
  const addTextBlock = () => {
    const newBlock = { id: `${Date.now()}-t`, type: 'text', content: '' } as any;
    setFormData(prev => ({
      ...prev,
      blocks: [ ...(prev.blocks || []), newBlock ],
    }));
  };

  const updateChecklistItem = (id: string, updates: Partial<{ text: string; done: boolean }>) => {
    setFormData(prev => ({
      ...prev,
      checklist: (prev.checklist || []).map(it => (it.id === id ? { ...it, ...updates } : it)),
    }));
  };

  const removeChecklistItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      checklist: (prev.checklist || []).filter(it => it.id !== id),
    }));
  };

  const handleTogglePin = () => {
    setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleReminderChange = async (date: Date | undefined) => {
    try {
      if (date === undefined) {
        // Xóa nhắc nhở
        setFormData(prev => ({ ...prev, reminder: undefined }));
        if (!isNew && typeof id === 'string') {
          // Gọi context để hủy thông báo đã lập lịch
          await removeReminder(id);
          Alert.alert('Thành công', 'Đã xóa nhắc nhở');
        }
      } else {
        // Cập nhật thời gian nhắc nhở
        setFormData(prev => ({ ...prev, reminder: date, reminderEnabled: true }));
        // Khi chọn nhắc nhở, mở Nhắc nhở và thu gọn Thư mục
        setShowReminderUI(true);
        setShowFolderUI(false);
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật nhắc nhở';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const toggleRepeatDay = (dayIndex: number) => {
    setFormData(prev => {
      const current = prev.repeatDays || [];
      const exists = current.includes(dayIndex);
      const next = exists ? current.filter(d => d !== dayIndex) : [...current, dayIndex];
      return { ...prev, repeatDays: next.sort((a, b) => a - b) };
    });
  };

  const handleReminderToggle = async (enabled: boolean) => {
    try {
      setFormData(prev => ({ ...prev, reminderEnabled: enabled }));
      if (enabled) {
        // Nếu bật nhắc nhở nhưng chưa có thời gian, set thời gian mặc định
        if (!formData.reminder) {
          const defaultTime = new Date();
          defaultTime.setHours(defaultTime.getHours() + 1); // 1 giờ sau
          setFormData(prev => ({ ...prev, reminder: defaultTime }));
        }
      } else {
        // Nếu tắt nhắc nhở, xóa thời gian
        setFormData(prev => ({ ...prev, reminder: undefined }));
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể thay đổi trạng thái nhắc nhở';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const handleFolderSelect = (folderId: string | undefined) => {
    setFormData(prev => ({ ...prev, folder: folderId }));
    // Khi chọn thư mục, mở Thư mục và thu gọn Nhắc nhở
    setShowFolderUI(true);
    setShowReminderUI(false);
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      if (!name.trim()) {
        Alert.alert('Lỗi', 'Tên thư mục không được để trống');
        return;
      }
      if (name.length > 50) {
        Alert.alert('Lỗi', 'Tên thư mục không được vượt quá 50 ký tự');
        return;
      }
      await createFolder(name.trim(), color);
      Alert.alert('Thành công', `Thư mục "${name}" đã được tạo`);
    } catch (error) {
      console.error('Error creating folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Không thể tạo thư mục';
      Alert.alert('Lỗi', errorMessage);
    }
  };

  const MAX_TAG_LENGTH = 30;
  const MAX_TAGS_COUNT_VALIDATION = 20;

  const toCanonicalTag = (raw: string) => {
    const t = (raw || '').trim();
    if (!t) return '';
    const core = t.startsWith('@') ? t.slice(1) : t;
    return `@${core.toLowerCase()}`;
  };

  const addTag = (tag: string) => {
    const canonical = toCanonicalTag(tag);
    if (!canonical) return;
    
    // Validate tag length
    const tagWithoutAt = canonical.replace(/^@/, '');
    if (tagWithoutAt.length > MAX_TAG_LENGTH) {
      Alert.alert('Lỗi', `Tag không được vượt quá ${MAX_TAG_LENGTH} ký tự`);
      return;
    }

    // Validate tags count
    setFormData(prev => {
      const existingCanon = new Set(prev.tags.map(toCanonicalTag));
      if (existingCanon.has(canonical)) {
        Alert.alert('Thông báo', 'Tag này đã tồn tại');
        return prev;
      }
      if (prev.tags.length >= MAX_TAGS_COUNT_VALIDATION) {
        Alert.alert('Lỗi', `Số lượng tags không được vượt quá ${MAX_TAGS_COUNT_VALIDATION}`);
        return prev;
      }
      return { ...prev, tags: [...Array.from(existingCanon), canonical] };
    });
  };

  const toggleTag = (tag: string) => {
    const canonical = toCanonicalTag(tag);
    setFormData(prev => {
      const canonList = prev.tags.map(toCanonicalTag);
      if (canonList.includes(canonical)) {
        return { ...prev, tags: canonList.filter(t => t !== canonical) };
      }
      return { ...prev, tags: [...new Set([...canonList, canonical])] };
    });
  };

  const hideSavedTag = (tag: string) => {
    const canonical = toCanonicalTag(tag);
    setHiddenSavedTags(prev => (prev.includes(canonical) ? prev : [...prev, canonical]));
    // Nếu tag đang được chọn trong ghi chú thì bỏ chọn luôn
    setFormData(prev => ({ ...prev, tags: prev.tags.map(toCanonicalTag).filter(t => t !== canonical) }));
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.headerActions}>
        {!isEditing && (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={handleTogglePin} style={styles.actionButton}>
          <Ionicons 
            name={formData.isPinned ? "pin" : "pin-outline"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
          <Ionicons name="checkmark" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => {
    const hasBlocks = (formData.blocks || []).length > 0;
    if (!hasBlocks) {
      return (
        <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.noteContainer, { backgroundColor: colors.noteColors[formData.color as keyof typeof colors.noteColors] || colors.noteColors.default }]}>
            {!isNew && viewingNote?.updatedAt && (
              <Text style={{ color: colors.text + '40', fontSize: 12, marginBottom: 8 }}>
                Cập nhật lần cuối: {new Date(viewingNote.updatedAt as any).toLocaleString('vi-VN')}
              </Text>
            )}
            <TextInput
              style={[styles.titleInput, { color: colors.text }]}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Tiêu đề ghi chú..."
              placeholderTextColor={colors.text + '60'}
              multiline
              editable={isEditing}
              onFocus={() => setIsTextInputFocused(true)}
              onBlur={() => setIsTextInputFocused(false)}
            />
            <TextInput
              style={[
                styles.contentInput,
                { color: colors.text, paddingVertical: (formData.content || '').length === 0 ? 2 : 6, minHeight: 0 },
                typeof textHeights['__legacy'] === 'number'
                  ? { height: (formData.content || '').length === 0 ? 20 : Math.max(20, textHeights['__legacy']) }
                  : { height: (formData.content || '').length === 0 ? 20 : undefined },
              ]}
              value={formData.content}
              onChangeText={(text) => setFormData(prev => ({ ...prev, content: text }))}
              placeholder={hasAnyContentOrMedia ? '' : "Nội dung ghi chú..."}
              placeholderTextColor={colors.text + '60'}
              multiline
              textAlignVertical="top"
              editable={isEditing}
              onFocus={() => setIsTextInputFocused(true)}
              onBlur={() => setIsTextInputFocused(false)}
              onSelectionChange={(e) => {
                const start = e.nativeEvent.selection?.start ?? 0;
                setLastFocusedBlockId('__legacy');
                setSelectionByBlock(prev => ({ ...prev, ['__legacy']: start }));
              }}
              onContentSizeChange={(e) => {
                const h = e.nativeEvent.contentSize?.height || 0;
                setTextHeights(prev => ({ ...prev, ['__legacy']: h }));
              }}
            />
          </View>

          {isEditing && (
            <>{/* keep the same sections as before when no blocks */}
              
              <View style={styles.section}>
                <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowReminderUI(prev => !prev);
                      if (!showReminderUI) {
                        setShowFolderUI(false);
                      }
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: showReminderUI ? colors.primary : colors.noteColors.gray,
                    }}
                  >
                    <Ionicons name="notifications-outline" size={20} color={showReminderUI ? colors.surface : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setShowFolderUI(prev => !prev);
                      if (!showFolderUI) {
                        setShowReminderUI(false);
                      }
                    }}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 16,
                      backgroundColor: showFolderUI ? colors.primary : colors.noteColors.gray,
                    }}
                  >
                    <Ionicons name="folder-outline" size={20} color={showFolderUI ? colors.surface : colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              {showReminderUI && (
                <>
                  <View style={styles.section}>
                    <ReminderPicker
                      reminder={formData.reminder}
                      onReminderChange={handleReminderChange}
                      showHeader={false}
                    />
                  </View>
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Lặp lại</Text>
                    <View style={styles.repeatContainer}>
                      {['CN','T2','T3','T4','T5','T6','T7'].map((label, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.repeatChip,
                            (formData.repeatDays || []).includes(idx) && { backgroundColor: colors.primary },
                          ]}
                          onPress={() => toggleRepeatDay(idx)}
                        >
                          <Text style={[styles.repeatChipText, { color: (formData.repeatDays || []).includes(idx) ? colors.surface : colors.text }]}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <Text style={{ color: colors.text + '80' }}>
                      Chọn các ngày trong tuần để lặp lại nhắc nhở
                    </Text>
                  </View>
                </>
              )}

              {showFolderUI && (
                <View style={styles.section}>
                  <FolderPicker
                    selectedFolder={formData.folder}
                    folders={state.folders}
                    onFolderSelect={handleFolderSelect}
                    onCreateFolder={handleCreateFolder}
                    showHeader={false}
                  />
                </View>
              )}

              {showMediaUI && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ảnh</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {(formData.images || []).map((uri) => (
                      <View key={uri} style={{ position: 'relative' }}>
                        <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.noteColors.gray }}>
                          <Image source={{ uri }} style={{ width: 80, height: 80 }} contentFit="cover" />
                        </View>
                        <TouchableOpacity onPress={() => removeImage(uri)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: colors.error, borderRadius: 12, padding: 4 }}>
                          <Ionicons name="close" size={16} color={colors.surface} />
                        </TouchableOpacity>
                      </View>
                    ))}
                    <TouchableOpacity 
                      onPress={pickImages} 
                      style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.noteColors.gray, opacity: isLoadingImages ? 0.6 : 1 }}
                      disabled={isLoadingImages}
                    >
                      <Text style={{ color: colors.text }}>{isLoadingImages ? 'Đang tải...' : '+ Thêm ảnh'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {showAudioUI && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Âm thanh</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {recording ? (
                      <TouchableOpacity onPress={stopRecording} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.error }}>
                        <Text style={{ color: colors.surface }}>Dừng ghi</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={startRecording} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary }}>
                        <Text style={{ color: colors.surface }}>Ghi âm</Text>
                      </TouchableOpacity>
                    )}
                    {formData.audioUri && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Ionicons name="volume-high-outline" size={20} color={colors.text} />
                        <Text style={{ color: colors.text }}>
                          {formatDuration(formData.audioDurationMs)}
                        </Text>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={clearAudio} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.noteColors.gray }}>
                          <Text style={{ color: colors.text }}>Xóa</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {showChecklistUI && (
                <View className="section" style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Checklist</Text>
                  {(formData.checklist || []).map(item => (
                    <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => updateChecklistItem(item.id, { done: !item.done })} style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.text + '60', alignItems: 'center', justifyContent: 'center', backgroundColor: item.done ? colors.primary : 'transparent' }}>
                        {item.done && <Ionicons name="checkmark" size={16} color={colors.surface} />}
                      </TouchableOpacity>
                      <TextInput
                        style={{ flex: 1, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text + '30', paddingVertical: 6 }}
                        value={item.text}
                        onChangeText={(text) => updateChecklistItem(item.id, { text })}
                        placeholder="Nội dung công việc"
                        placeholderTextColor={colors.text + '60'}
                      />
                      <TouchableOpacity onPress={() => removeChecklistItem(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity onPress={addChecklistItem} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.noteColors.gray }}>
                    <Text style={{ color: colors.text }}>+ Thêm mục</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {Array.from(new Set(state.notes.flatMap(n => n.tags).map(toCanonicalTag)))
                    .filter(t => !hiddenSavedTags.includes(t))
                    .slice(0, 50)
                    .map((display, idx) => {
                      const selected = formData.tags.map(toCanonicalTag).includes(display);
                      return (
                        <TouchableOpacity
                          key={`${display}-${idx}`}
                          onPress={() => toggleTag(display)}
                          onLongPress={() => hideSavedTag(display)}
                          style={[
                            styles.tag,
                            { backgroundColor: selected ? colors.primary : colors.noteColors.gray },
                          ]}
                        >
                          <Text style={[styles.tagText, { color: selected ? colors.surface : colors.text }]}>
                            {display.replace(/^@/, '')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                </View>
                <TextInput
                  style={[styles.tagInput, { color: colors.text, borderColor: colors.text + '40' }]}
                  placeholder="Thêm tag (nhấn Enter)"
                  placeholderTextColor={colors.text + '60'}
                  onSubmitEditing={(e) => {
                    const raw = e.nativeEvent.text;
                    const withoutAt = (raw || '').replace(/^@/, '');
                    addTag(withoutAt);
                    e.currentTarget.setNativeProps({ text: '' });
                  }}
                />
              </View>
            </>
          )}
        </ScrollView>
      );
    }

    // When using block editor: use a single ScrollView for the whole page to enable full-page scrolling
    return (
      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={[styles.noteContainer, { backgroundColor: colors.noteColors[formData.color as keyof typeof colors.noteColors] || colors.noteColors.default }]}>
          {!isNew && viewingNote?.updatedAt && (
            <Text style={{ color: colors.text + '40', fontSize: 12, marginBottom: 8 }}>
              Cập nhật lần cuối: {new Date(viewingNote.updatedAt as any).toLocaleString('vi-VN')}
            </Text>
          )}
          <TextInput
            style={[styles.titleInput, { color: colors.text }]}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Tiêu đề ghi chú..."
            placeholderTextColor={colors.text + '60'}
            multiline
            editable={isEditing}
            onFocus={() => setIsTextInputFocused(true)}
            onBlur={() => setIsTextInputFocused(false)}
          />
          {renderBlockList(undefined, undefined, false)}
        </View>

        {isEditing && (
          <>
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowReminderUI(prev => !prev);
                    if (!showReminderUI) {
                      setShowFolderUI(false);
                    }
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: showReminderUI ? colors.primary : colors.noteColors.gray,
                  }}
                >
                  <Ionicons name="notifications-outline" size={20} color={showReminderUI ? colors.surface : colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowFolderUI(prev => !prev);
                    if (!showFolderUI) {
                      setShowReminderUI(false);
                    }
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 16,
                    backgroundColor: showFolderUI ? colors.primary : colors.noteColors.gray,
                  }}
                >
                  <Ionicons name="folder-outline" size={20} color={showFolderUI ? colors.surface : colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {showReminderUI && (
              <>
                <View style={styles.section}>
                  <ReminderPicker
                    reminder={formData.reminder}
                    onReminderChange={handleReminderChange}
                    showHeader={false}
                  />
                </View>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Lặp lại</Text>
                  <View style={styles.repeatContainer}>
                    {['CN','T2','T3','T4','T5','T6','T7'].map((label, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.repeatChip,
                          (formData.repeatDays || []).includes(idx) && { backgroundColor: colors.primary },
                        ]}
                        onPress={() => toggleRepeatDay(idx)}
                      >
                        <Text style={[styles.repeatChipText, { color: (formData.repeatDays || []).includes(idx) ? colors.surface : colors.text }]}>
                          {label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={{ color: colors.text + '80' }}>
                    Chọn các ngày trong tuần để lặp lại nhắc nhở
                  </Text>
                </View>
              </>
            )}

            {showFolderUI && (
              <View style={styles.section}>
                <FolderPicker
                  selectedFolder={formData.folder}
                  folders={state.folders}
                  onFolderSelect={handleFolderSelect}
                  onCreateFolder={handleCreateFolder}
                  showHeader={false}
                />
              </View>
            )}

            {showMediaUI && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ảnh</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {(formData.images || []).map((uri) => (
                    <View key={uri} style={{ position: 'relative' }}>
                      <View style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.noteColors.gray }}>
                        <Image source={{ uri }} style={{ width: 80, height: 80 }} contentFit="cover" />
                      </View>
                      <TouchableOpacity onPress={() => removeImage(uri)} style={{ position: 'absolute', top: -6, right: -6, backgroundColor: colors.error, borderRadius: 12, padding: 4 }}>
                        <Ionicons name="close" size={16} color={colors.surface} />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity 
                    onPress={pickImages} 
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.noteColors.gray, opacity: isLoadingImages ? 0.6 : 1 }}
                    disabled={isLoadingImages}
                  >
                    <Text style={{ color: colors.text }}>{isLoadingImages ? 'Đang tải...' : '+ Thêm ảnh'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {showAudioUI && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Âm thanh</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  {recording ? (
                    <TouchableOpacity onPress={stopRecording} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.error }}>
                      <Text style={{ color: colors.surface }}>Dừng ghi</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={startRecording} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.primary }}>
                      <Text style={{ color: colors.surface }}>Ghi âm</Text>
                    </TouchableOpacity>
                  )}
                  {formData.audioUri && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Ionicons name="volume-high-outline" size={20} color={colors.text} />
                      <Text style={{ color: colors.text }}>
                        {formatDuration(formData.audioDurationMs)}
                      </Text>
                      <View style={{ flex: 1 }} />
                      <TouchableOpacity onPress={clearAudio} style={{ paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.noteColors.gray }}>
                        <Text style={{ color: colors.text }}>Xóa</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}

            {showChecklistUI && (
              <View className="section" style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Checklist</Text>
                {(formData.checklist || []).map(item => (
                  <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => updateChecklistItem(item.id, { done: !item.done })} style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: colors.text + '60', alignItems: 'center', justifyContent: 'center', backgroundColor: item.done ? colors.primary : 'transparent' }}>
                      {item.done && <Ionicons name="checkmark" size={16} color={colors.surface} />}
                    </TouchableOpacity>
                    <TextInput
                      style={{ flex: 1, color: colors.text, borderBottomWidth: 1, borderBottomColor: colors.text + '30', paddingVertical: 6 }}
                      value={item.text}
                      onChangeText={(text) => updateChecklistItem(item.id, { text })}
                      placeholder="Nội dung công việc"
                      placeholderTextColor={colors.text + '60'}
                    />
                    <TouchableOpacity onPress={() => removeChecklistItem(item.id)}>
                      <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity onPress={addChecklistItem} style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.noteColors.gray }}>
                  <Text style={{ color: colors.text }}>+ Thêm mục</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {Array.from(new Set(state.notes.flatMap(n => n.tags).map(toCanonicalTag)))
                  .filter(t => !hiddenSavedTags.includes(t))
                  .slice(0, 50)
                  .map((display, idx) => {
                    const selected = formData.tags.map(toCanonicalTag).includes(display);
                    return (
                      <TouchableOpacity
                        key={`${display}-${idx}`}
                        onPress={() => toggleTag(display)}
                        onLongPress={() => hideSavedTag(display)}
                        style={[
                          styles.tag,
                          { backgroundColor: selected ? colors.primary : colors.noteColors.gray },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: selected ? colors.surface : colors.text }]}>
                          {display.replace(/^@/, '')}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
              <TextInput
                style={[styles.tagInput, { color: colors.text, borderColor: colors.text + '40' }]}
                placeholder="Thêm tag (nhấn Enter)"
                placeholderTextColor={colors.text + '60'}
                onSubmitEditing={(e) => {
                  const raw = e.nativeEvent.text;
                  const withoutAt = (raw || '').replace(/^@/, '');
                  addTag(withoutAt);
                  e.currentTarget.setNativeProps({ text: '' });
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // Accessory bar: chỉ hiển thị khi focus TextInput và bàn phím đang mở
  const renderAccessoryBar = () => {
    if (!isEditing || !isKeyboardVisible || !isTextInputFocused) return null;
    return (
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        borderTopWidth: 0.5,
        borderColor: colors.text + '22',
        backgroundColor: colors.surface,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={addTextBlock} style={{ padding: 10, borderRadius: 8, backgroundColor: colors.noteColors.gray, minWidth: 74, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="text-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImages} style={{ padding: 10, borderRadius: 8, backgroundColor: colors.noteColors.gray, minWidth: 74, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="image-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          {recording ? (
            <TouchableOpacity onPress={stopRecording} style={{ padding: 10, borderRadius: 8, backgroundColor: colors.error, minWidth: 74, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="stop" size={18} color={colors.surface} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={{ padding: 10, borderRadius: 8, backgroundColor: colors.noteColors.gray, minWidth: 74, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="mic-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={addChecklistItem} style={{ padding: 10, borderRadius: 8, backgroundColor: colors.noteColors.gray, minWidth: 74, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="list-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderHeader()}
        {renderForm()}
        {renderAccessoryBar()}

        {/* Confirm delete modal */}
        <Modal visible={confirmDeleteVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setConfirmDeleteVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.confirmCard, { backgroundColor: colors.surface }]}>
                  <Text style={{ color: colors.text, textAlign: 'center', fontSize: 18, fontWeight: '600', marginBottom: 8 }}>Xác nhận xóa</Text>
                  <Text style={{ color: colors.text + 'CC', textAlign: 'center', marginBottom: 12 }}>
                    Bạn có chắc chắn muốn xóa ghi chú này?
                  </Text>
                  <View style={styles.confirmActions}>
                    <TouchableOpacity 
                      style={styles.confirmButton} 
                      onPress={() => setConfirmDeleteVisible(false)}
                      disabled={isDeleting}
                    >
                      <Text style={[styles.confirmButtonText, { color: colors.text }]}>Hủy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.confirmButton, { backgroundColor: colors.error, opacity: isDeleting ? 0.6 : 1 }]}
                      onPress={async () => {
                        setIsDeleting(true);
                        try {
                          await deleteNote(id as string);
                          setConfirmDeleteVisible(false);
                          router.back();
                        } catch (error) {
                          console.error('Error deleting note:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Không thể xóa ghi chú';
                          Alert.alert('Lỗi', errorMessage);
                        } finally {
                          setIsDeleting(false);
                        }
                      }}
                      disabled={isDeleting}
                    >
                      <Text style={[styles.confirmButtonText, { color: colors.surface }]}>
                        {isDeleting ? 'Đang xóa...' : 'Xóa'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </KeyboardAvoidingView>
      {/* Fullscreen image preview */}
      <Modal visible={!!previewImageUri} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setPreviewImageUri(null)}>
          <View style={{ flex: 1, backgroundColor: '#000000CC', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableWithoutFeedback>
              <View style={{ width: '100%', height: '80%' }}>
                {previewImageUri && (
                  <Image source={{ uri: previewImageUri }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </GestureHandlerRootView>
  );
}

// styles moved to centralized styles/styles.ts
