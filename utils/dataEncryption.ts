import { Platform } from 'react-native';
import { ENV_CONFIG } from '../config/env';
import { secureStorage } from './secureStorage';

// Data encryption configuration
interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
}

interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  algorithm: string;
}

class DataEncryptionManager {
  private isEnabled: boolean;
  private config: EncryptionConfig;
  private encryptionKey: string | null = null;

  constructor() {
    this.isEnabled = ENV_CONFIG.ENABLE_DATA_ENCRYPTION;
    this.config = {
      algorithm: 'AES-256-GCM',
      keyLength: 32, // 256 bits
      ivLength: 12,  // 96 bits
      tagLength: 16, // 128 bits
    };
    
    this.initializeEncryption();
  }

  /**
   * Initialize encryption key
   */
  private async initializeEncryption(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Try to get existing key from secure storage
      this.encryptionKey = await secureStorage.getSecureItem('encryption_key');
      
      if (!this.encryptionKey) {
        // Generate new key if none exists
        this.encryptionKey = await this.generateEncryptionKey();
        await secureStorage.setSecureItem('encryption_key', this.encryptionKey);
      }
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      this.encryptionKey = null;
    }
  }

  /**
   * Generate a new encryption key
   */
  private async generateEncryptionKey(): Promise<string> {
    try {
      // In production, use proper crypto libraries like expo-crypto
      // For now, we'll generate a simple key
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let key = '';
      for (let i = 0; i < this.config.keyLength; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return key;
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      throw new Error('Failed to generate encryption key');
    }
  }

  /**
   * Generate a random IV (Initialization Vector)
   */
  private generateIV(): string {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let iv = '';
      for (let i = 0; i < this.config.ivLength; i++) {
        iv += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return iv;
    } catch (error) {
      console.error('Failed to generate IV:', error);
      throw new Error('Failed to generate IV');
    }
  }

  /**
   * Encrypt sensitive data
   */
  async encryptData(data: any): Promise<EncryptedData | null> {
    if (!this.isEnabled || !this.encryptionKey) {
      return null; // Return null if encryption is disabled or key is not available
    }

    try {
      const dataString = JSON.stringify(data);
      const iv = this.generateIV();
      
      // In production, use proper AES-256-GCM encryption
      // For now, we'll simulate encryption with a simple transformation
      const encryptedData = this.simpleEncrypt(dataString, this.encryptionKey, iv);
      const tag = this.generateTag(encryptedData, this.encryptionKey);
      
      return {
        data: encryptedData,
        iv,
        tag,
        algorithm: this.config.algorithm,
      };
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decryptData(encryptedData: EncryptedData): Promise<any | null> {
    if (!this.isEnabled || !this.encryptionKey) {
      return encryptedData; // Return as-is if encryption is disabled
    }

    try {
      // Verify tag
      const expectedTag = this.generateTag(encryptedData.data, this.encryptionKey);
      if (expectedTag !== encryptedData.tag) {
        throw new Error('Invalid authentication tag');
      }

      // In production, use proper AES-256-GCM decryption
      // For now, we'll simulate decryption
      const decryptedString = this.simpleDecrypt(encryptedData.data, this.encryptionKey, encryptedData.iv);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  /**
   * Simple encryption simulation (replace with proper crypto in production)
   */
  private simpleEncrypt(data: string, key: string, iv: string): string {
    // This is a placeholder implementation
    // In production, use proper AES-256-GCM encryption
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length) ^ iv.charCodeAt(i % iv.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted); // Base64 encode
  }

  /**
   * Simple decryption simulation (replace with proper crypto in production)
   */
  private simpleDecrypt(encryptedData: string, key: string, iv: string): string {
    // This is a placeholder implementation
    // In production, use proper AES-256-GCM decryption
    const encrypted = atob(encryptedData); // Base64 decode
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length) ^ iv.charCodeAt(i % iv.length);
      decrypted += String.fromCharCode(charCode);
    }
    return decrypted;
  }

  /**
   * Generate authentication tag
   */
  private generateTag(data: string, key: string): string {
    // Simple tag generation (replace with proper HMAC in production)
    let tag = '';
    for (let i = 0; i < this.config.tagLength; i++) {
      const charCode = data.charCodeAt(i % data.length) ^ key.charCodeAt(i % key.length);
      tag += String.fromCharCode(charCode);
    }
    return btoa(tag); // Base64 encode
  }

  /**
   * Encrypt sensitive fields in an object
   */
  async encryptSensitiveFields(obj: any, sensitiveFields: string[]): Promise<any> {
    if (!this.isEnabled) {
      return obj;
    }

    try {
      const encryptedObj = { ...obj };
      
      for (const field of sensitiveFields) {
        if (encryptedObj[field] !== undefined && encryptedObj[field] !== null) {
          const encrypted = await this.encryptData(encryptedObj[field]);
          if (encrypted) {
            encryptedObj[field] = encrypted;
          }
        }
      }
      
      return encryptedObj;
    } catch (error) {
      console.error('Failed to encrypt sensitive fields:', error);
      return obj;
    }
  }

  /**
   * Decrypt sensitive fields in an object
   */
  async decryptSensitiveFields(obj: any, sensitiveFields: string[]): Promise<any> {
    if (!this.isEnabled) {
      return obj;
    }

    try {
      const decryptedObj = { ...obj };
      
      for (const field of sensitiveFields) {
        if (decryptedObj[field] && typeof decryptedObj[field] === 'object' && decryptedObj[field].data) {
          const decrypted = await this.decryptData(decryptedObj[field]);
          if (decrypted !== null) {
            decryptedObj[field] = decrypted;
          }
        }
      }
      
      return decryptedObj;
    } catch (error) {
      console.error('Failed to decrypt sensitive fields:', error);
      return obj;
    }
  }

  /**
   * Check if data is encrypted
   */
  isEncrypted(data: any): boolean {
    return data && 
           typeof data === 'object' && 
           data.data && 
           data.iv && 
           data.tag && 
           data.algorithm;
  }

  /**
   * Get encryption status
   */
  isEncryptionEnabled(): boolean {
    return this.isEnabled && this.encryptionKey !== null;
  }

  /**
   * Enable/disable encryption
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(): Promise<void> {
    try {
      const newKey = await this.generateEncryptionKey();
      await secureStorage.setSecureItem('encryption_key', newKey);
      this.encryptionKey = newKey;
    } catch (error) {
      console.error('Failed to rotate encryption key:', error);
      throw new Error('Failed to rotate encryption key');
    }
  }
}

// Export singleton instance
export const dataEncryption = new DataEncryptionManager();

// Export types
export type { EncryptionConfig, EncryptedData };

// Common sensitive fields that should be encrypted
export const SENSITIVE_FIELDS = [
  'password',
  'confirmPassword',
  'cardNumber',
  'cvv',
  'ssn',
  'bankAccount',
  'personalId',
  'biometricData',
  'privateKey',
  'secret',
] as const;
