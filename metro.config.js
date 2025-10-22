/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const packagesRoot = path.resolve(projectRoot, 'packages');

const defaultConfig = getDefaultConfig(projectRoot);
const { assetExts, sourceExts, nodeModulesPaths } = defaultConfig.resolver;

module.exports = mergeConfig(defaultConfig, {
  watchFolders: [...defaultConfig.watchFolders, packagesRoot],
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    ...defaultConfig.resolver,
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    nodeModulesPaths: Array.from(
      new Set([
        ...nodeModulesPaths,
        path.resolve(projectRoot, 'node_modules'),
        path.resolve(projectRoot, 'apps/mobile/node_modules'),
      ])
    ),
  },
});
