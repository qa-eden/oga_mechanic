/**
 * Formats a phone number to include the +234 prefix if missing.
 * Handles cases where the number starts with '0', '234', or is just 10 digits.
 * 
 * @param phone The raw phone number string
 * @returns Formatted phone number with +234 prefix
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return phone;
  
  let formatted = phone.trim();
  
  // Remove any non-digit characters except +
  formatted = formatted.replace(/[^\d+]/g, '');

  if (formatted.startsWith('0')) {
    // 080... -> +23480...
    formatted = '+234' + formatted.slice(1);
  } else if (formatted.startsWith('234') && !formatted.startsWith('+')) {
    // 23480... -> +23480...
    formatted = '+' + formatted;
  } else if (formatted.length === 10 && !formatted.startsWith('+')) {
    // 803... -> +234803...
    formatted = '+234' + formatted;
  } else if (!formatted.startsWith('+') && formatted.length > 0) {
    // fallback for other formats
    formatted = '+234' + formatted;
  }
  
  return formatted;
};
