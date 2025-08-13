const path = require('path');
const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

// si usas ../icons:
const iconsPath = path.resolve(__dirname, '..', 'icons');
config.watchFolders = [iconsPath];

config.resolver = {
  ...config.resolver,
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  unstable_enablePackageExports: true   // deja TRUE; solo ponlo en false si vuelve un “deep import”
};

module.exports = config;
