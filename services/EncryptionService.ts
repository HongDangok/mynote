/*
  Mục đích: Dịch vụ mã hóa/giải mã dữ liệu.
  - Sử dụng XOR cipher với key được lưu trong SecureStore
  - Key được generate ngẫu nhiên và lưu an toàn
  - Hỗ trợ migration từ plaintext sang encrypted data
  - NOTE: XOR cipher là một giải pháp đơn giản, tốt hơn plaintext nhưng không mạnh bằng AES.
  - Để bảo mật cao hơn, nên sử dụng thư viện như react-native-aes hoặc react-native-crypto-js
*/
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// SecureStore keys must only contain alphanumeric characters, ".", "-", and "_"
const ENCRYPTION_KEY_STORAGE_KEY = 'encryption_key';
const ENCRYPTION_VERSION_KEY = 'encryption_version';
const CURRENT_ENCRYPTION_VERSION = '1.0';
const ENCRYPTION_MARKER = '__ENCRYPTED__';

class EncryptionService {
  private static cachedKey: string | null = null;

  /**
   * Generate or retrieve encryption key from SecureStore
   */
  private static async getEncryptionKey(): Promise<string> {
    if (this.cachedKey) {
      return this.cachedKey;
    }

    try {
      // Try to get existing key
      let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_STORAGE_KEY);
      
      if (!key) {
        // Generate new 256-bit key (32 bytes = 64 hex chars)
        const randomBytes = await Crypto.getRandomBytesAsync(32);
        key = Array.from(new Uint8Array(randomBytes))
          .map((b: number) => b.toString(16).padStart(2, '0'))
          .join('');
        
        // Store key securely in SecureStore
        await SecureStore.setItemAsync(ENCRYPTION_KEY_STORAGE_KEY, key);
      }

      this.cachedKey = key;
      return key;
    } catch (error) {
      console.error('Error getting encryption key:', error);
      throw new Error('Failed to initialize encryption key');
    }
  }

  /**
   * Encrypt data using XOR cipher with key from SecureStore
   */
  static async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const dataBytes = new TextEncoder().encode(data);
      const keyBytes = new TextEncoder().encode(key);
      const encrypted = new Uint8Array(dataBytes.length);

      // XOR encryption
      for (let i = 0; i < dataBytes.length; i++) {
        encrypted[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
      }

      // Convert to base64 for storage
      const binaryString = String.fromCharCode(...encrypted);
      const base64 = btoa(binaryString);
      
      // Add marker to identify encrypted data
      return ENCRYPTION_MARKER + base64;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   */
  static async decrypt(encryptedData: string): Promise<string> {
    try {
      // Check if data is encrypted
      if (!encryptedData.startsWith(ENCRYPTION_MARKER)) {
        // Data is not encrypted (legacy plaintext)
        return encryptedData;
      }

      // Remove marker
      const base64 = encryptedData.substring(ENCRYPTION_MARKER.length);
      
      // Decode from base64
      const binaryString = atob(base64);
      const encrypted = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encrypted[i] = binaryString.charCodeAt(i);
      }

      const key = await this.getEncryptionKey();
      const keyBytes = new TextEncoder().encode(key);
      const decrypted = new Uint8Array(encrypted.length);

      // XOR decryption (same as encryption)
      for (let i = 0; i < encrypted.length; i++) {
        decrypted[i] = encrypted[i] ^ keyBytes[i % keyBytes.length];
      }

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if data string is encrypted
   */
  static isEncrypted(data: string): boolean {
    return data.startsWith(ENCRYPTION_MARKER);
  }

  /**
   * Check if app data is encrypted (has encryption version marker)
   */
  static async isDataEncrypted(): Promise<boolean> {
    try {
      const version = await SecureStore.getItemAsync(ENCRYPTION_VERSION_KEY);
      return version === CURRENT_ENCRYPTION_VERSION;
    } catch {
      return false;
    }
  }

  /**
   * Mark data as encrypted
   */
  static async markAsEncrypted(): Promise<void> {
    await SecureStore.setItemAsync(ENCRYPTION_VERSION_KEY, CURRENT_ENCRYPTION_VERSION);
  }

  /**
   * Test encryption/decryption
   */
  static async testEncryption(): Promise<boolean> {
    try {
      const testData = 'test_encryption_123';
      const encrypted = await this.encrypt(testData);
      const decrypted = await this.decrypt(encrypted);
      return decrypted === testData;
    } catch (error) {
      console.error('Encryption test failed:', error);
      return false;
    }
  }
}

export default EncryptionService;
