module.exports = function (api) {
  api.cache(true);
  
  // For web, use a completely different config
  if (process.env.EXPO_PLATFORM === 'web') {
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      compact: false,
      plugins: [
        ["transform-remove-console", { "exclude": ["error", "warn"] }],
        // No worklets plugin for web
      ]
    };
  }
  
  // For mobile, use worklets plugin for reanimated v4
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    compact: false,
    plugins: [
      ["transform-remove-console", { "exclude": ["error", "warn"] }],
      "react-native-worklets/plugin"
    ]
  };
};
