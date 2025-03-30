import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  activeColor?: string;
  inactiveColor?: string;
  thumbColor?: string;
  disabled?: boolean;
  width?: number;
  height?: number;
}

const Switch = ({
  value,
  onValueChange,
  activeColor = '#4CD964',
  inactiveColor = '#D3D3D3',
  thumbColor = '#FFFFFF',
  disabled = false,
  width = 51,
  height = 31
}: SwitchProps) => {
  // Calculate sizes based on provided width and height
  const thumbSize = height - 2;
  const thumbPosition = new Animated.Value(value ? width - thumbSize - 2 : 1);

  const onPress = () => {
    if (disabled) return;
    
    const newValue = !value;
    
    Animated.timing(thumbPosition, {
      toValue: newValue ? width - thumbSize - 2 : 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    onValueChange(newValue);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? activeColor : inactiveColor,
            width,
            height,
            borderRadius: height / 2,
            opacity: disabled ? 0.5 : 1
          }
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX: thumbPosition }]
            }
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  }
});

export default Switch;