import { ENV_CONFIG } from '../../config/env';

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  status?: number;
  timestamp: Date;
}

/**
 * Performs a simple health check on the API server
 * @returns Promise<HealthCheckResult>
 */
export const performAPIHealthCheck = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  const timestamp = new Date();

  try {
    // Simple fetch request to check if the server is reachable
    const response = await fetch(`${ENV_CONFIG.API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Key': ENV_CONFIG.API_KEY,
        'ngrok-skip-browser-warning': 'true',
      },
      // Short timeout for health check
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {

      return {
        isHealthy: true,
        responseTime,
        status: response.status,
        timestamp,
      };
    } else {

      return {
        isHealthy: false,
        responseTime,
        status: response.status,
        error: `Server responded with ${response.status}: ${response.statusText}`,
        timestamp,
      };
    }
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    console.error('❌ API health check failed:', {
      error: error.message,
      name: error.name,
      responseTime: `${responseTime}ms`,
    });

    let errorMessage = 'Unknown error';

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      errorMessage = 'Request timeout - API server not responding';
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Network error - Unable to reach API server';
    } else {
      errorMessage = error.message || 'Connection failed';
    }

    return {
      isHealthy: false,
      responseTime,
      error: errorMessage,
      timestamp,
    };
  }
};

/**
 * Performs a basic connectivity test to check if the API URL is reachable
 * @returns Promise<HealthCheckResult>
 */
export const performConnectivityTest = async (): Promise<HealthCheckResult> => {
  const startTime = Date.now();
  const timestamp = new Date();

  try {
    // Try to reach any endpoint on the API server
    const response = await fetch(ENV_CONFIG.API_URL, {
      method: 'HEAD', // Use HEAD to minimize data transfer
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      signal: AbortSignal.timeout(3000), // Very short timeout for connectivity test
    });

    const responseTime = Date.now() - startTime;

    return {
      isHealthy: true,
      responseTime,
      status: response.status,
      timestamp,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    console.error('❌ Connectivity test failed:', {
      error: error.message,
      name: error.name,
      responseTime: `${responseTime}ms`,
    });

    let errorMessage = 'Connection failed';

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      errorMessage = 'Connection timeout - Server not reachable';
    } else if (error.name === 'TypeError') {
      errorMessage = 'Network error - Check your internet connection';
    }

    return {
      isHealthy: false,
      responseTime,
      error: errorMessage,
      timestamp,
    };
  }
};

/**
 * Logs the current API configuration for debugging
 */
export const logAPIConfiguration = () => {
  // API Configuration Debug - removed console.log
};
