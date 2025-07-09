const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname)

// Modify resolver to support SVG files
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Use `react-native-svg-transformer` for SVG files
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');


module.exports = withNativeWind(config, { input: './app/globals.css' })