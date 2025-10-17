import { Platform } from 'react-native';

// Platform-specific imports
let MapSection: any;

if (Platform.OS === 'web') {
  MapSection = require('./MapSection.web').default;
} else {
  MapSection = require('./MapSection.native').default;
}

export default MapSection;
