import { StyleSheet } from 'react-native';

// Styles cho màn hình chính (Home) - hiển thị danh sách ghi chú
export const homeStyles = StyleSheet.create({
  // Container chính của màn hình
  container: {
    flex: 1,
  },
  // Container cho danh sách ghi chú - thêm padding dưới để tránh bị che bởi FAB
  listContainer: {
    paddingBottom: 100,
  },
  // Container hiển thị khi đang tải dữ liệu
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text hiển thị trạng thái loading
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  // Header của màn hình chính - chứa tiêu đề và thống kê
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  // Hàng chứa thanh tìm kiếm và các nút
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 4,
  },
  // Container cho thanh tìm kiếm - chiếm hết không gian còn lại
  searchFlex: {
    flex: 1,
    marginRight: 1,
  },
  // Tiêu đề của header
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  // Container cho các thống kê - căn phải
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  // Mỗi item thống kê (số lượng ghi chú, thư mục, etc.)
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  // Text hiển thị số liệu thống kê
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Overlay mờ phía sau modal options
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // Card chứa các tùy chọn trong modal
  optionsCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  },
  // Tiêu đề của modal options
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  // Mỗi item trong danh sách options (có thể nhấn)
  optionsItem: {
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  // Text cho các item options thông thường
  optionsItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Text cho các item options nguy hiểm (như xóa) - đậm hơn
  optionsItemTextDestructive: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Nút hủy trong modal options
  optionsCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  // Text cho nút hủy
  optionsCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Card chứa nội dung xác nhận (modal xác nhận xóa)
  confirmCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
  },
  // Container chứa các nút xác nhận (Hủy/Xóa)
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  // Style cho mỗi nút trong modal xác nhận
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 0,
  },
  // Text cho các nút xác nhận
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Container hiển thị khi danh sách trống
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 100,
  },
  // Tiêu đề khi danh sách trống
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  // Phụ đề khi danh sách trống
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// Styles cho màn hình Explore - hiển thị thống kê và thư mục
export const exploreStyles = StyleSheet.create({
  // Container chính của màn hình Explore
  container: {
    flex: 1,
  },
  // Mỗi section trong màn hình Explore (thống kê, thư mục, etc.)
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  // Header của mỗi section - chứa tiêu đề và nút thêm
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Tiêu đề của section
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  // Nút thêm mới trong header section
  addButton: {
    padding: 8,
  },
  // Container chứa các card thống kê
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Card hiển thị số liệu thống kê (số ghi chú, thư mục, etc.)
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Số liệu lớn trong card thống kê
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  // Nhãn mô tả cho số liệu thống kê
  statLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  // Container hiển thị khi không có thư mục nào
  emptyFolders: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  // Text hiển thị khi không có thư mục
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  // Card hiển thị thông tin thư mục
  folderCard: {
    width: 80,
    padding: 14,
    borderRadius: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Header của card thư mục - chứa tên và nút xóa
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  // Nút xóa thư mục
  deleteFolderButton: {
    padding: 4,
  },
  // Tên thư mục
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  // Số lượng ghi chú trong thư mục
  folderCount: {
    fontSize: 12,
  },
  // Container chứa các hành động nhanh
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Mỗi hành động nhanh (tạo ghi chú, thư mục, etc.)
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Text mô tả cho hành động nhanh
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  // Container cho danh sách nhắc nhở - chiều cao cố định
  reminderContainer: {
    height: 270,
  },
  // Container cho danh sách thư mục - chiều cao cố định
  foldersContainer: {
    height: 100,
  },
});

// Styles cho màn hình chi tiết ghi chú (tạo/sửa ghi chú)
export const noteStyles = StyleSheet.create({
  // Container chính của màn hình ghi chú
  container: {
    flex: 1,
  },
  // Header chứa nút back và các action (edit, pin, delete)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Nút quay lại
  backButton: {
    padding: 8,
  },
  // Container chứa các nút action (edit, pin, delete)
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Style cho mỗi nút action
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  // Container chứa form nhập liệu
  formContainer: {
    flex: 1,
    padding: 16,
  },
  // Container chứa tiêu đề và nội dung ghi chú
  noteContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Input nhập tiêu đề ghi chú
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    padding: 0,
  },
  // Input nhập nội dung ghi chú
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 160,
    padding: 0,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  repeatContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  repeatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
  },
  repeatChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    marginRight: 6,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  saveButton: {
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  // Tái sử dụng các kiểu modal phù hợp với các tùy chọn modol
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    alignItems: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

// Styles cho card ghi chú trong danh sách
export const noteCardStyles = StyleSheet.create({
  // Container chính của mỗi card ghi chú
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 18,
    borderRadius: 20,
    elevation: 20,
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    minHeight: 90,
    overflow: 'visible',
  },
  // Style cho ghi chú đã được ghim - có viền trái màu tím
  pinned: {
    borderLeftWidth: 6,
    borderLeftColor: '#6200ee',
    marginLeft: 14, // Mở rộng viền ra ngoài để không ảnh hưởng đến đổ bóng
    elevation: 20, // Tăng đổ bóng cho card ghim để nổi bật hơn
    shadowColor: '#6200ee', // Đổ bóng màu tím nhẹ
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  // Icon pin hiển thị ở góc trên bên phải khi ghi chú được ghim
  pinIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  // Header của card ghi chú - chứa tiêu đề và các nút
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -10,
    minHeight: 14, // Chiều cao cố định để tránh thay đổi kích thước
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  // Style cho tiêu đề khi không có tiêu đề
  titlePlaceholder: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    opacity: 0,
    fontStyle: 'italic',
  },
  // Container chứa các nút action (switch nhắc nhở, nút ghim)
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 32, // Chiều cao cố định để tránh thay đổi kích thước
  },
  reminderSwitch: {
    top: -15,
    right: -20,
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
  },
  // Nút ghim có thể tương tác - bo góc đẹp với background trong suốt
  pinButton: {
    top: -15,
    right: -20,
    padding: 1,
    minHeight: 32,
    minWidth: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 1,
    shadowColor: '#0000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  // Nội dung ghi chú hiển thị trong card
  content: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    opacity: 0.8,
  },
  // Container chứa các tag của ghi chú
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  // Mỗi tag trong danh sách
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  // Text hiển thị trong tag
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Text hiển thị số lượng tag còn lại (ví dụ: +3)
  moreTags: {
    fontSize: 12,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  // Footer chứa ngày tạo và thông tin nhắc nhở
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 24, // Chiều cao cố định để tránh thay đổi kích thước
  },
  // Ngày tạo/cập nhật ghi chú
  date: {
    fontSize: 12,
    opacity: 0.4,
  },
  // Container hiển thị thông tin nhắc nhở
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Text hiển thị thời gian nhắc nhở
  reminderText: {
    fontSize: 14,
    marginLeft: 4,
  },
});

// Styles cho danh sách nhắc nhở
export const reminderListStyles = StyleSheet.create({
  // Container chính của màn hình danh sách nhắc nhở
  container: {
    flex: 1,
  },
  // Mỗi item nhắc nhở trong danh sách
  reminderItem: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  // Header của mỗi item nhắc nhở - chứa tiêu đề và nút xóa
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  // Container chứa thông tin nhắc nhở
  reminderInfo: {
    flex: 1,
    marginRight: 8,
  },
  // Tiêu đề của nhắc nhở
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  // Thời gian nhắc nhở
  reminderTime: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  // Nút xóa nhắc nhở
  removeButton: {
    padding: 4,
  },
  // Nội dung ghi chú trong nhắc nhở
  reminderContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.9,
  },
  // Footer của item nhắc nhở - chứa ngày và thư mục
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // Ngày tạo nhắc nhở
  reminderDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  // Tag hiển thị thư mục của nhắc nhở
  folderTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  // Text trong tag thư mục
  folderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Container hiển thị khi danh sách nhắc nhở trống
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  // Tiêu đề khi danh sách nhắc nhở trống
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  // Phụ đề khi danh sách nhắc nhở trống
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

// Styles cho ReminderPicker component
export const reminderPickerStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
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
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  noReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
  },
  noReminderText: {
    fontSize: 16,
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
  },
  datePicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  pickerWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'stretch',
    marginHorizontal: 8,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});


