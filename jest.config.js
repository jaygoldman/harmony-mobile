module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|@react-navigation|react-native-svg)/)',
  ],
  moduleNameMapper: {
    '^@harmony/theme(.*)$': '<rootDir>/packages/theme/src$1',
    '^@harmony/navigation(.*)$': '<rootDir>/packages/navigation/src$1',
    '^@harmony/data(.*)$': '<rootDir>/packages/data/src$1',
    '^@harmony/utils(.*)$': '<rootDir>/packages/utils/src$1',
    '^@harmony/config(.*)$': '<rootDir>/packages/config/src$1',
  },
};
