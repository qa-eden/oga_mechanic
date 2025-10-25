import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import CustomButton from './CustomButton';
import { InformationCircleIcon } from "react-native-heroicons/solid";
import { ExclamationTriangleIcon, CheckCircleIcon, XCircleIcon } from "react-native-heroicons/outline";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  buttonText?: string;
  onButtonPress?: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  type = 'info',
  autoDismiss = false,
  autoDismissDelay = 3000,
  buttonText = 'OK',
  onButtonPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const announceAccessibility = useCallback(() => {
    AccessibilityInfo.announceForAccessibility(`${title}. ${message}`);
  }, [title, message]);

  useEffect(() => {
    if (visible) {
      announceAccessibility();

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      if (autoDismiss) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoDismissDelay);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, autoDismiss, autoDismissDelay]);

  const getTheme = useCallback(() => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircleIcon size={35} color="#10B981" />,
          color: '',
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          icon: <XCircleIcon size={35} color="#D30309" />,
          color: '',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'info':
        return {
          icon: <InformationCircleIcon size={35} color="#3B82F6" />,
          color: "",
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
      case 'warning':
        return {
          icon: <ExclamationTriangleIcon size={35} color="#F59E0B" />,
          color: '',
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
      default:
        return {
          icon: <InformationCircleIcon size={35} color="#3B82F6" />,
          color: "",
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
    }
  }, [type]);

  const { icon, color, backgroundColor, borderColor } = getTheme();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleButtonPress = useCallback(() => {
    if (onButtonPress) {
      onButtonPress();
    } else {
      handleClose();
    }
  }, [onButtonPress, handleClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View className="flex-1 justify-center items-center bg-black/50" style={{ opacity: opacityAnim }}>
        <TouchableOpacity
          className="flex-1 w-full justify-center items-center"
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View
            className="w-4/5 max-w-96 rounded-2xl border border-gray-200 shadow-lg"
            style={[
              {
                transform: [{ scale: scaleAnim }],
                backgroundColor,
                borderColor,
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View className="p-5">
              <View className='mb-5'>
                <View className="flex-row items-center ">
                  <View className={` justify-center items-center ${color ? 'bg-opacity-100' : ''}`} style={{ backgroundColor: color }}>
                    <Text className="text-lg font-bold text-white">{icon}</Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-xl font-bold text-gray-900">{title}</Text>
                  </View>
                </View>

                <Text className="text-lg text-gray-500 pt-3 pb-6">{message}</Text>
              </View>

              <CustomButton title={buttonText} onPress={handleButtonPress} />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

export default CustomAlert;