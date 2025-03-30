import React from 'react';
import { Text, TextStyle } from 'react-native';

interface CurrencyFormatterProps {
  value: number;
  style?: TextStyle;
  prefix?: 'NGN' | '₦';
  className?: string;
}

export const formatCurrency = (
  value: number, 
  prefix: 'NGN' | '₦' = '₦', 
  showCode: boolean = false
) => {
  // Handle null or undefined
  if (value === null || value === undefined) return `${prefix === 'NGN' ? 'NGN' : '₦'}0.00`;

  // Ensure it's a number
  const numValue = Number(value);

  // Format with commas for thousands and fixed 2 decimal places
  const formattedValue = numValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Determine final output based on prefix
  if (prefix === 'NGN') {
    return showCode ? `NGN ${formattedValue}` : `NGN ${formattedValue}`;
  }
  return `₦${formattedValue}`;
};

// Component version
export const NairaCurrency: React.FC<CurrencyFormatterProps> = ({
  value,
  style,
  prefix = '₦',
  className
}) => {
  return (
    <Text 
      className={`${className}`}
      style={style}
    >
      {formatCurrency(value, prefix)}
    </Text>
  );
};

// Hook version
export const useCurrencyFormatter = () => {
  return formatCurrency;
};