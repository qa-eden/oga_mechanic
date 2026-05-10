import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

/**
 * Play a notification sound for mechanics
 * Optimized for loudness and vibrancy
 */
export const playMechanicNotificationSound = async () => {
  try {
    // Trigger heavy haptics for "vibrancy"
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Set audio mode to ensure it plays loudly even in silent mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    const { sound } = await Audio.Sound.createAsync(
      require('@/assets/sounds/mechanic-new-notification.mp3'),
      { 
        shouldPlay: true,
        volume: 1.0, // Max software volume
        isMuted: false,
      }
    );
    
    // Auto unload when finished
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};
