// This is a shim for web and Android where the tab bar is generally opaque.
/*
  Mục đích: Shim cho Android/Web (không dùng blur như iOS).
  - Trả về 0 cho khoảng trống tab bar
*/
export default undefined;

export function useBottomTabOverflow() {
  return 0;
}
