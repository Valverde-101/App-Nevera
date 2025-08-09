const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Include the icons folder located outside of the project root
const iconsPath = path.resolve(__dirname, '..', 'icons');
config.watchFolders = [iconsPath];

// Ensure modules are resolved from this project's node_modules even when
// bundling files from outside of the project root (such as the icons folder).
config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
};

module.exports = config;
