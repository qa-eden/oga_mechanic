import React from 'react';
import { View, Platform } from 'react-native';

interface AndroidNavBarSpacerProps {
  /** Background color for the spacer */
  backgroundColor?: string;
  /** Additional height to add (default: 0) */
  extraHeight?: number;
  /** Custom style object */
  style?: any;
  /** Custom className for styling */
  className?: string;
}

/**
 * AndroidNavBarSpacer - Adds bottom padding to prevent content overlap with Android navigation bar
 * 
 * This component adds extra bottom padding on Android devices to prevent floating buttons
 * or bottom content from being hidden behind the Android system navigation bar.
 * 
 * @param backgroundColor - Background color (default: 'white')
 * @param extraHeight - Additional height to add beyond the default Android nav bar height
 * @param style - Custom style object
 * @param className - Tailwind CSS classes
 */
const AndroidNavBarSpacer: React.FC<AndroidNavBarSpacerProps> = ({
  backgroundColor = 'white',
  extraHeight = 0,
  style,
  className = '',
}) => {
  // Android navigation bar height is typically 40px, plus any extra height
  const androidHeight = 30 + extraHeight;
  // iOS safe area is handled by SafeAreaView, so we use minimal height
  const iosHeight = 6 + extraHeight;

  return (
    <View
      className={className}
      style={[
        {
          backgroundColor,
          height: Platform.OS === 'android' ? androidHeight : iosHeight,
        },
        style,
      ]}
    />
  );
};

export default AndroidNavBarSpacer;
