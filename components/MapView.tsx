import { Platform } from 'react-native';

// Platform-specific imports
if (Platform.OS === 'web') {
  module.exports = require('./MapView.web').default;
} else {
  module.exports = require('./MapView.native').default;
}