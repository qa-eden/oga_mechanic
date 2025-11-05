import { ENV_CONFIG } from '../config/env';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
}

interface RequestRecord {
  timestamp: number;
  endpoint: string;
  method: string;
  success: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

class RateLimitingManager {
  private isEnabled: boolean;
  private requestHistory: Map<string, RequestRecord[]> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    this.isEnabled = ENV_CONFIG.ENABLE_RATE_LIMITING;
    this.initializeDefaultConfigs();
  }

  /**
   * Initialize default rate limiting configurations
   */
  private initializeDefaultConfigs(): void {
    // Global rate limit
    this.configs.set('global', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
    });

    // Authentication endpoints
    this.configs.set('auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts per 15 minutes
    });

    // API endpoints
    this.configs.set('api', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    });

    // File upload endpoints
    this.configs.set('upload', {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // 10 uploads per 5 minutes
    });

    // Sensitive operations
    this.configs.set('sensitive', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 sensitive operations per minute
    });
  }

  /**
   * Get rate limit configuration for an endpoint
   */
  private getConfigForEndpoint(endpoint: string): RateLimitConfig {
    // Determine configuration based on endpoint
    if (endpoint.includes('/auth/') || endpoint.includes('/login') || endpoint.includes('/register')) {
      return this.configs.get('auth')!;
    } else if (endpoint.includes('/upload') || endpoint.includes('/file')) {
      return this.configs.get('upload')!;
    } else if (endpoint.includes('/payment') || endpoint.includes('/withdraw') || endpoint.includes('/delete')) {
      return this.configs.get('sensitive')!;
    } else if (endpoint.includes('/api/')) {
      return this.configs.get('api')!;
    } else {
      return this.configs.get('global')!;
    }
  }

  /**
   * Check if request is allowed based on rate limiting
   */
  async checkRateLimit(
    endpoint: string,
    method: string = 'GET',
    userId?: string
  ): Promise<RateLimitResult> {
    if (!this.isEnabled) {
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }

    try {
      const config = this.getConfigForEndpoint(endpoint);
      const key = userId ? `${userId}:${endpoint}` : endpoint;
      const now = Date.now();
      
      // Get request history for this key
      const history = this.requestHistory.get(key) || [];
      
      // Filter requests within the time window
      const windowStart = now - config.windowMs;
      const recentRequests = history.filter(record => record.timestamp > windowStart);
      
      // Count requests based on configuration
      let requestCount = recentRequests.length;
      
      if (config.skipSuccessfulRequests) {
        requestCount = recentRequests.filter(record => !record.success).length;
      }
      
      if (config.skipFailedRequests) {
        requestCount = recentRequests.filter(record => record.success).length;
      }

      const remaining = Math.max(0, config.maxRequests - requestCount);
      const resetTime = recentRequests.length > 0 
        ? recentRequests[0].timestamp + config.windowMs 
        : now + config.windowMs;

      if (requestCount >= config.maxRequests) {
        const retryAfter = Math.ceil((resetTime - now) / 1000);
        return {
          allowed: false,
          remaining: 0,
          resetTime,
          retryAfter,
        };
      }

      return {
        allowed: true,
        remaining,
        resetTime,
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Allow request if rate limiting fails
      return {
        allowed: true,
        remaining: Infinity,
        resetTime: Date.now() + 60000,
      };
    }
  }

  /**
   * Record a request for rate limiting
   */
  async recordRequest(
    endpoint: string,
    method: string = 'GET',
    success: boolean = true,
    userId?: string
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const key = userId ? `${userId}:${endpoint}` : endpoint;
      const now = Date.now();
      
      const record: RequestRecord = {
        timestamp: now,
        endpoint,
        method,
        success,
      };

      // Get existing history
      const history = this.requestHistory.get(key) || [];
      
      // Add new record
      history.push(record);
      
      // Clean up old records (older than 1 hour)
      const oneHourAgo = now - (60 * 60 * 1000);
      const cleanedHistory = history.filter(record => record.timestamp > oneHourAgo);
      
      // Store updated history
      this.requestHistory.set(key, cleanedHistory);
    } catch (error) {
      console.error('Failed to record request:', error);
    }
  }

  /**
   * Get current rate limit status for an endpoint
   */
  async getRateLimitStatus(
    endpoint: string,
    userId?: string
  ): Promise<RateLimitResult> {
    return this.checkRateLimit(endpoint, 'GET', userId);
  }

  /**
   * Reset rate limit for a specific endpoint/user
   */
  async resetRateLimit(endpoint: string, userId?: string): Promise<void> {
    const key = userId ? `${userId}:${endpoint}` : endpoint;
    this.requestHistory.delete(key);
  }

  /**
   * Clear all rate limit data
   */
  async clearAllRateLimits(): Promise<void> {
    this.requestHistory.clear();
  }

  /**
   * Add or update rate limit configuration
   */
  setConfig(key: string, config: RateLimitConfig): void {
    this.configs.set(key, config);
  }

  /**
   * Enable/disable rate limiting
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get all current configurations
   */
  getConfigs(): Map<string, RateLimitConfig> {
    return new Map(this.configs);
  }

  /**
   * Get request history for debugging
   */
  getRequestHistory(): Map<string, RequestRecord[]> {
    return new Map(this.requestHistory);
  }
}

// Export singleton instance
export const rateLimiting = new RateLimitingManager();

// Export types
export type { RateLimitConfig, RequestRecord, RateLimitResult };
