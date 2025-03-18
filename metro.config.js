const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable NativeWind (TailwindCSS)
const tailwindConfig = withNativeWind(config, { input: "./global.css" });

// Modify the config for SVG support
tailwindConfig.resolver.assetExts = tailwindConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
tailwindConfig.resolver.sourceExts.push("svg");

tailwindConfig.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Export the combined config
module.exports = tailwindConfig;
