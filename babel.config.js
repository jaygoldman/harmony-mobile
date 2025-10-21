module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        root: ['./'],
        alias: {
          '@harmony/theme': './packages/theme/src',
          '@harmony/navigation': './packages/navigation/src',
          '@harmony/data': './packages/data/src',
          '@harmony/utils': './packages/utils/src',
          '@harmony/config': './packages/config/src',
        },
      },
    ],
  ],
};
