const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Include the icons folder located outside of the project root
config.watchFolders = [path.resolve(__dirname, '..', 'icons')];

module.exports = config;
