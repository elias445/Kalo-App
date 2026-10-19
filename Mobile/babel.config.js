module.exports = function (api) {
  api.cache(true);
  return {
    // Preset do Expo configurado para o NativeWind
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ],
  };
};