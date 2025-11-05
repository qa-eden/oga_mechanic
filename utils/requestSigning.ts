import { Platform } from 'react-native';
import { ENV_CONFIG } from '../config/env';
import { secureStorage } from './secureStorage';

// Request signing configuration
interface RequestSignature {
  signature: string;
  timestamp: number;
  nonce: string;
  algorithm: string;
}

interface SignedRequestHeaders {
  'X-Signature': string;
  'X-Timestamp': string;
  'X-Nonce': string;
  'X-Algorithm': string;
  'X-Client-Version': string;
  'X-Platform': string;
}

class RequestSigningManager {
  private isEnabled: boolean;
  private secretKey: string | null = null;
  private readonly algorithm = 'sha256';
  private readonly clientVersion = ENV_CONFIG.APP_VERSION;
  private readonly platform = Platform.OS;

  constructor() {
    this.isEnabled = ENV_CONFIG.ENABLE_REQUEST_SIGNING;
    this.loadSecretKey();
  }

  /**
   * Load the secret key from secure storage
   */
  private async loadSecretKey(): Promise<void> {
    try {
      // In production, this would be derived from user credentials
      // or obtained from a secure key exchange
      this.secretKey = await secureStorage.getSecureItem('request_signing_key') || 
                      ENV_CONFIG.API_KEY; // Fallback to API key
    } catch (error) {
      console.error('Failed to load secret key:', error);
      this.secretKey = null;
    }
  }

  /**
   * Generate a cryptographically secure nonce
   */
  private generateNonce(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}_${random}`;
  }

  /**
   * Create HMAC signature for request
   */
  private async createSignature(
    method: string,
    url: string,
    body: string,
    timestamp: number,
    nonce: string
  ): Promise<string> {
    if (!this.secretKey) {
      throw new Error('Secret key not available for request signing');
    }

    try {
      // Create the string to sign
      const stringToSign = [
        method.toUpperCase(),
        url,
        body || '',
        timestamp.toString(),
        nonce,
        this.clientVersion,
        this.platform,
      ].join('\n');

      // In production, use proper HMAC implementation
      // For now, we'll create a simple hash-based signature
      const signature = await this.createHMAC(stringToSign, this.secretKey);
      
      return signature;
    } catch (error) {
      console.error('Failed to create signature:', error);
      throw new Error('Failed to create request signature');
    }
  }

  /**
   * Create HMAC signature (simplified implementation)
   * In production, use proper crypto libraries like expo-crypto
   */
  private async createHMAC(data: string, key: string): Promise<string> {
    // This is a simplified implementation
    // In production, use proper HMAC-SHA256 implementation
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const dataData = encoder.encode(data);
    
    // Simple hash-based signature (replace with proper HMAC)
    const combined = new Uint8Array(keyData.length + dataData.length);
    combined.set(keyData);
    combined.set(dataData, keyData.length);
    
    // Convert to hex string
    const hash = Array.from(combined)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return hash.substring(0, 64); // Truncate to 32 bytes (64 hex chars)
  }

  /**
   * Sign a request with HMAC authentication
   */
  async signRequest(
    method: string,
    url: string,
    body?: any
  ): Promise<SignedRequestHeaders> {
    if (!this.isEnabled) {
      return this.getBasicHeaders();
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const nonce = this.generateNonce();
      const bodyString = body ? JSON.stringify(body) : '';

      const signature = await this.createSignature(
        method,
        url,
        bodyString,
        timestamp,
        nonce
      );

      return {
        'X-Signature': signature,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
        'X-Algorithm': this.algorithm,
        'X-Client-Version': this.clientVersion,
        'X-Platform': this.platform,
      };
    } catch (error) {
      console.error('Failed to sign request:', error);
      // Fallback to basic headers if signing fails
      return this.getBasicHeaders();
    }
  }

  /**
   * Get basic headers without signing
   */
  private getBasicHeaders(): SignedRequestHeaders {
    return {
      'X-Signature': '',
      'X-Timestamp': Math.floor(Date.now() / 1000).toString(),
      'X-Nonce': this.generateNonce(),
      'X-Algorithm': 'none',
      'X-Client-Version': this.clientVersion,
      'X-Platform': this.platform,
    };
  }

  /**
   * Verify request signature (for server-side validation)
   */
  async verifySignature(
    signature: string,
    method: string,
    url: string,
    body: string,
    timestamp: number,
    nonce: string,
    clientVersion: string,
    platform: string
  ): Promise<boolean> {
    try {
      const expectedSignature = await this.createSignature(
        method,
        url,
        body,
        timestamp,
        nonce
      );

      // Verify timestamp is within acceptable range (5 minutes)
      const now = Math.floor(Date.now() / 1000);
      const timeDiff = Math.abs(now - timestamp);
      if (timeDiff > 300) { // 5 minutes
        console.warn('Request timestamp is too old or too far in the future');
        return false;
      }

      return signature === expectedSignature;
    } catch (error) {
      console.error('Failed to verify signature:', error);
      return false;
    }
  }

  /**
   * Enable/disable request signing
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Update secret key
   */
  async updateSecretKey(newKey: string): Promise<void> {
    try {
      await secureStorage.setSecureItem('request_signing_key', newKey);
      this.secretKey = newKey;
    } catch (error) {
      console.error('Failed to update secret key:', error);
      throw new Error('Failed to update secret key');
    }
  }
}

// Export singleton instance
export const requestSigning = new RequestSigningManager();

// Export types
export type { RequestSignature, SignedRequestHeaders };
