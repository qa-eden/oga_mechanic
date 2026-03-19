const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const tailwindConfig = withNativeWind(config, { input: "./global.css" });

// Exclude problematic packages from web builds
if (process.env.EXPO_PLATFORM === 'web') {
  tailwindConfig.resolver.blockList = [
    /@rnmapbox\/maps/,
    /react-native-worklets/,
    /worklets/,
  ];
  
  // Override react-native-reanimated for web
  tailwindConfig.resolver.alias = {
    ...tailwindConfig.resolver.alias,
    'react-native-reanimated': 'react-native-reanimated/lib/reanimated2/core',
  };
  
  // Use web-specific babel config
  tailwindConfig.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');
  tailwindConfig.transformer.getTransformOptions = async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  });
}

// SVG support
tailwindConfig.resolver.assetExts = tailwindConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
tailwindConfig.resolver.sourceExts.push("svg");

tailwindConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Optimized minification for better performance
tailwindConfig.transformer.minifierConfig = {
  keep_fnames: false,
  mangle: {
    keep_fnames: false,
  },
  compress: {
    drop_console: true,
    drop_debugger: true,
    pure_funcs: ['console.log', 'console.warn'],
  },
};

// Add performance optimizations
tailwindConfig.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = tailwindConfig;
