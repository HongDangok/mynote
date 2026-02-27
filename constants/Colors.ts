/*
  Mục đích: Bảng màu ứng dụng cho chế độ sáng/tối.
  - Cung cấp màu UI và màu nền ghi chú theo theme
*/

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
    // Note colors
    noteColors: {
      default: '#f8f9fa',
      red: '#ffebee',
      pink: '#fce4ec',
      purple: '#f3e5f5',
      blue: '#e3f2fd',
      cyan: '#e0f2f1',
      teal: '#e0f2f1',
      green: '#e8f5e8',
      lime: '#f9fbe7',
      yellow: '#fffde7',
      orange: '#fff3e0',
      brown: '#efebe9',
      gray: '#fafafa',
    },
    // UI colors
    primary: '#6200ee',
    secondary: '#03dac6',
    surface: '#ffffff',
    error: '#b00020',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
    // Note colors
    noteColors: {
      default: '#2d2d2d',
      red: '#3d1f1f',
      pink: '#3d1f2f',
      purple: '#2f1f3d',
      blue: '#1f2f3d',
      cyan: '#1f3d3d',
      teal: '#1f3d2f',
      green: '#1f3d1f',
      lime: '#2f3d1f',
      yellow: '#3d3d1f',
      orange: '#3d2f1f',
      brown: '#3d2f2f',
      gray: '#2d2d2d',
    },
    // UI colors
    primary: '#bb86fc',
    secondary: '#03dac6',
    surface: '#121212',
    error: '#cf6679',
    success: '#4caf50',
    warning: '#ff9800',
    info: '#2196f3',
  },
};
