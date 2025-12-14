import axios, { AxiosError } from 'axios';

/**
 * Custom error handler for API throttling errors
 * Provides user-friendly messages and handles retry logic
 */
export const handleThrottlingError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    
    // Check for throttling error (429 status code)
    if (axiosError.response?.status === 429) {
      const detail = axiosError.response?.data?.detail;
      
      // Extract wait time from error message if available
      const waitTimeMatch = detail?.match(/(\d+)\s*seconds?/i);
      const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
      
      return `Too many requests. Please wait ${waitTime} seconds before trying again.`;
    }
    
    // Check for throttling in detail message
    if (axiosError.response?.data?.detail?.includes('throttled')) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
  }
  
  return 'An error occurred. Please try again.';
};

/**
 * Check if an error is a throttling error
 */
export const isThrottlingError = (error: any): boolean => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;
    return (
      axiosError.response?.status === 429 ||
      axiosError.response?.data?.detail?.includes('throttled')
    );
  }
  return false;
};

/**
 * Delay function for retry logic
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a throttling error
      if (!isThrottlingError(error)) {
        throw error;
      }
      
      // Don't delay on last attempt
      if (i < maxRetries - 1) {
        const delayTime = initialDelay * Math.pow(2, i);
        console.log(`Throttled. Retrying in ${delayTime}ms...`);
        await delay(delayTime);
      }
    }
  }
  
  throw lastError;
}
