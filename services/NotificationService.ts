/*
  Mục đích: Dịch vụ quản lý thông báo nhắc nhở.
  - Xin quyền, lập lịch, huỷ và liệt kê thông báo liên quan đến ghi chú
*/
import * as Notifications from 'expo-notifications';
import { Note } from '../types/Note';

export class NotificationService {
  // Huỷ tất cả thông báo đã được lập lịch liên quan tới 1 ghi chú (theo noteId)
  static async cancelNotificationsForNote(noteId: string): Promise<void> {
    try {
      // Lấy tất cả thông báo đang chờ
      const pending = await Notifications.getAllScheduledNotificationsAsync();
      // Lọc ra các thông báo có data.noteId trùng với ghi chú
      const targets = pending.filter(
        (n) => (n as any)?.content?.data?.noteId === noteId
      );
      // Huỷ từng thông báo theo identifier
      await Promise.all(
        targets.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
      );
    } catch (error) {
      console.error('Error canceling notifications for note:', error);
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      // Xin quyền gửi thông báo từ hệ thống
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleNotification(note: Note): Promise<string | null> {
    try {
      // Không có thời gian nhắc thì không lập lịch
      if (!note.reminder) return null;

      // Đảm bảo đã có quyền
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      // Tránh trùng lặp: huỷ tất cả thông báo cũ của ghi chú trước khi lập lịch mới
      await this.cancelNotificationsForNote(note.id);

      const now = Date.now();
      const reminderTime = new Date(note.reminder).getTime();
      const oneHourMs = 60 * 60 * 1000;
      const preAlertTime = reminderTime - oneHourMs;

      // Lập lịch thông báo trước 1 giờ (nếu còn ở tương lai)
      if (preAlertTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            // Tiêu đề có nhãn (trước 1 giờ)
            title: (note.title || 'Ghi chú nhắc nhở') + ' (trước 1 giờ)',
            body:
              note.content.length > 100
                ? note.content.substring(0, 100) + '...'
                : note.content,
            // Gắn kèm noteId để có thể truy vết/huỷ đúng thông báo
            data: { noteId: note.id, kind: 'pre' },
          },
          trigger: { date: new Date(preAlertTime) } as any,
        });
      }

      // Lập lịch thông báo chính đúng thời điểm nhắc (phải ở tương lai)
      if (reminderTime > now) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: note.title || 'Ghi chú nhắc nhở',
            body:
              note.content.length > 100
                ? note.content.substring(0, 100) + '...'
                : note.content,
            // Gắn kèm noteId để có thể truy vết/huỷ đúng thông báo
            data: { noteId: note.id, kind: 'main' },
          },
          trigger: { date: new Date(reminderTime) } as any,
        });

        return notificationId;
      }

      return null;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      // Huỷ 1 thông báo theo identifier cụ thể
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      // Huỷ toàn bộ thông báo đã được lập lịch của ứng dụng
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      // Lấy danh sách thông báo đang chờ thực thi
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  static async setupNotificationHandler(): Promise<void> {
    // Thiết lập hành vi hiển thị thông báo trên thiết bị
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
}
