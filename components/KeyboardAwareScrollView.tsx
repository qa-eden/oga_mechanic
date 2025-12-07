import React, { ReactNode } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StyleProp,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  /** Extra offset for the keyboard (useful when there's a header) */
  keyboardVerticalOffset?: number;
  /** Container style for KeyboardAvoidingView */
  containerStyle?: StyleProp<ViewStyle>;
  /** Whether to dismiss keyboard on tap outside inputs */
  dismissOnTap?: boolean;
  /** Extra padding at the bottom of content */
  extraBottomPadding?: number;
  /** Custom className for ScrollView */
  scrollViewClassName?: string;
}

/**
 * A reusable scroll view component that handles keyboard avoidance on iOS and Android.
 * Wrap your forms with this component to prevent the keyboard from covering inputs.
 * 
 * Usage:
 * ```tsx
 * <KeyboardAwareScrollView keyboardVerticalOffset={100}>
 *   <FormikInput ... />
 *   <FormikInput ... />
 *   <FormikButton ... />
 * </KeyboardAwareScrollView>
 * ```
 */
const KeyboardAwareScrollView: React.FC<KeyboardAwareScrollViewProps> = ({
  children,
  keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0,
  containerStyle,
  dismissOnTap = true,
  extraBottomPadding = Platform.OS === 'ios' ? 120 : 80,
  scrollViewClassName = 'flex-1',
  contentContainerStyle,
  ...scrollViewProps
}) => {
  const content = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, containerStyle]}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <ScrollView
        className={scrollViewClassName}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bounces={true}
        automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        contentContainerStyle={[
          {
            paddingBottom: extraBottomPadding,
            flexGrow: 1,
          },
          contentContainerStyle,
        ]}
        {...scrollViewProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (dismissOnTap) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        {content}
      </TouchableWithoutFeedback>
    );
  }

  return content;
};

export default KeyboardAwareScrollView;

