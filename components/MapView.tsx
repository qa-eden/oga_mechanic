import { Platform } from 'react-native';

// Platform-specific imports
let CustomMapView: any;

if (Platform.OS === 'web') {
  CustomMapView = require('./MapView.web').default;
} else {
  CustomMapView = require('./MapView.native').default;
}

export default CustomMapView;