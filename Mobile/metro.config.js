const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Ativa o NativeWind no bundler usando o global.css
module.exports = withNativeWind(config, { input: "./global.css" });