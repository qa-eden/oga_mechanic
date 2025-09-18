module.exports = function (api) {
  api.cache(true);
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
};