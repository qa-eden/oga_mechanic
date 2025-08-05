module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    compact: false, // Change from true to false to handle larger files
    plugins: [
      ["transform-remove-console", { "exclude": ["error", "warn"] }]
    ]
  };
};
