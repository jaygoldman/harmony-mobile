require('react-native-gesture-handler/jestSetup');

global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (id) => clearTimeout(id);

// Silence React Native animation warnings during tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Polyfill setImmediate for Jest environment.
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));

global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
