export const maskEmail = (email: string): string => {
    const [localPart, domain] = email.split("@");
  
    if (!localPart || !domain) return email; // Return original if invalid
  
    const visiblePart = localPart.slice(-3); // Get last 3 characters of local part
    const maskedPart = "*".repeat(localPart.length - 3); // Mask rest of local part
  
    return `${maskedPart}${visiblePart}@${domain}`;
  };
  