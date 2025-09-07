import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onButtonPress?: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  buttonText?: string;
}

const { width, height } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  onClose,
  onButtonPress,
  type = 'info',
  autoDismiss = false,
  autoDismissDelay = 3000,
  buttonText = 'OK',
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
          icon: '✓',
          color: '#10B981',
          backgroundColor: '#F0FDF4',
          borderColor: '#BBF7D0',
        };
      case 'error':
        return {
          icon: '✕',
          color: '#EF4444',
          backgroundColor: '#FEF2F2',
          borderColor: '#FECACA',
        };
      case 'warning':
        return {
          icon: '⚠',
          color: '#F59E0B',
          backgroundColor: '#FFFBEB',
          borderColor: '#FED7AA',
        };
      default:
        return {
          icon: 'ℹ',
          color: '#3B82F6',
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
        };
    }
  }, [type]);

  const { icon, color, backgroundColor, borderColor } = getTheme();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <TouchableOpacity 
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View 
            style={[
              styles.alert,
              { 
                transform: [{ scale: scaleAnim }],
                backgroundColor,
                borderColor,
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Text style={styles.icon}>{icon}</Text>
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.message}>{message}</Text>
              </View>
            </View>
            
            <Pressable
              style={[styles.button, { backgroundColor: color }]}
              onPress={onButtonPress || handleClose}
              accessibilityRole="button"
              accessibilityLabel={buttonText}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </Pressable>
          </View>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alert: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 22,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CustomAlert;