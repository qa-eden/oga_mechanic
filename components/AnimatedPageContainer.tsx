import React from 'react';
import { ViewProps } from 'react-native';
import Animated, { FadeInUp, FadeInDown, FadeIn } from 'react-native-reanimated';

interface AnimatedPageContainerProps extends ViewProps {
  children: React.ReactNode;
  animationType?: 'fadeInUp' | 'fadeInDown' | 'fadeIn';
  duration?: number;
  delay?: number;
}

const AnimatedPageContainer: React.FC<AnimatedPageContainerProps> = ({
  children,
  animationType = 'fadeInDown',
  duration = 500,
  delay = 0,
  style,
  ...props
}) => {
  let enteringAnimation;

  switch (animationType) {
    case 'fadeInDown':
      enteringAnimation = FadeInDown.duration(duration).delay(delay);
      break;
    case 'fadeIn':
      enteringAnimation = FadeIn.duration(duration).delay(delay);
      break;
    case 'fadeInUp':
    default:
      enteringAnimation = FadeInUp.duration(duration).delay(delay);
      break;
  }

  return (
    <Animated.View 
      entering={enteringAnimation} 
      style={[{ flex: 1 }, style]} 
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default AnimatedPageContainer;
