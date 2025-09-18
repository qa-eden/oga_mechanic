import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

// Web-specific entry point that excludes worklets
if (Platform.OS === 'web') {
  // Disable worklets for web
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (args[0] && args[0].includes && args[0].includes('Worklets')) {
      return; // Suppress worklets errors on web
    }
    originalConsoleError.apply(console, args);
  };
}

import App from './App';

registerRootComponent(App);
