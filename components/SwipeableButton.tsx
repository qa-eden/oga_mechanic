import React, { useState } from 'react';
import { View, Text, Dimensions, PanResponder, Animated } from 'react-native';
import { ChevronDoubleRightIcon, ChevronRightIcon } from 'react-native-heroicons/solid';

interface SwipeableButtonProps {
  backgroundColor?: string;
  text: string;
  onComplete: () => void;
  successText?: string;
  width?: number;
  height?: number;
  borderRadius?: number;
  resetKey?: number; // Add this to force reset from parent
}

const SwipeableButton: React.FC<SwipeableButtonProps> = ({
  backgroundColor = '#08875D',
  text,
  onComplete,
  successText = 'Completed!',
  width,
  height = 56,
  borderRadius = 12,
  resetKey = 0,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const slideAnim = new Animated.Value(0);
  const moveAnim = new Animated.Value(0);
  const { width: screenWidth } = Dimensions.get('window');
  const buttonWidth = width || screenWidth - 48; // Default padding
  const slideButtonWidth = 60;

  const handleComplete = () => {
    setIsCompleted(true);
    onComplete();
  };

  // Reset button when component mounts or resetKey changes
  React.useEffect(() => {
    setIsCompleted(false);
    slideAnim.setValue(0);
    moveAnim.setValue(0);
  }, [resetKey]);

  // Start left-to-right movement animation when component mounts
  React.useEffect(() => {
    if (!isCompleted) {
      const moveAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(moveAnim, {
            toValue: 8,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      moveAnimation.start();
      return () => moveAnimation.stop();
    }
  }, [isCompleted]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const newValue = Math.max(0, Math.min(gestureState.dx, buttonWidth - slideButtonWidth));
      slideAnim.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > buttonWidth / 2) {
        // Swipe completed
        Animated.timing(slideAnim, {
          toValue: buttonWidth - slideButtonWidth,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          handleComplete();
        });
      } else {
        // Swipe not completed - reset
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  return (
    <View 
      style={{
        width: buttonWidth,
        height,
        padding: 2,
        backgroundColor,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={{
          position: 'absolute',
          left: 2,
          top: 2,
          width: slideButtonWidth,
          height: '100%',
          backgroundColor: 'white',
          borderRadius: borderRadius - 2,
          justifyContent: 'center',
          alignItems: 'center',
          transform: [{ translateX: slideAnim }],
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        {/* {isCompleted ? (
          <Text style={{ color: backgroundColor, fontSize: 18, fontWeight: '600' }}>
            ✓
          </Text>
        ) : (
          <Animated.View style={{ transform: [{ translateX: moveAnim }] }}>
            <ChevronDoubleRightIcon size={30} color={backgroundColor} />
          </Animated.View>
        )} */}
        <Animated.View style={{ transform: [{ translateX: moveAnim }] }}>
            <ChevronDoubleRightIcon size={30} color={backgroundColor} />
          </Animated.View>
      </Animated.View>
      
      <View style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <Text style={{
          color: 'white',
          fontSize: 16,
          fontWeight: '600',
        }}>
          {isCompleted ? successText : text}
        </Text>
      </View>
      
      <View style={{
        position: 'absolute',
        right: 8,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
      }}>
        <ChevronRightIcon size={30} color="#fff" />
      </View>
    </View>
  );
};

export default SwipeableButton;
