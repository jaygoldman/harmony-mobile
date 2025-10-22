// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = function babelConfig(api) {
  api.cache(true);

  const projectRoot = __dirname;

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          root: [projectRoot],
          alias: {
            '@harmony/theme': path.resolve(projectRoot, 'packages/theme/src'),
            '@harmony/navigation': path.resolve(projectRoot, 'packages/navigation/src'),
            '@harmony/data': path.resolve(projectRoot, 'packages/data/src'),
            '@harmony/utils': path.resolve(projectRoot, 'packages/utils/src'),
            '@harmony/config': path.resolve(projectRoot, 'packages/config/src'),
            '@harmony/session': path.resolve(projectRoot, 'packages/session/src'),
          },
        },
      ],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
    ],
  };
};
