import { Platform } from 'react-native';

// Platform-specific imports
if (Platform.OS === 'web') {
  module.exports = require('./MapSection.web').default;
} else {
  module.exports = require('./MapSection.native').default;
}
