const NOOP = () => undefined;

const mockReanimated = {
  __esModule: true,
  default: {
    addWhitelistedNativeProps: NOOP,
    addWhitelistedUIProps: NOOP,
    Animated: {
      addWhitelistedUIProps: NOOP,
      createAnimatedComponent: (component) => component,
      Value: function Value(initial) {
        this._value = initial ?? 0;
      },
    },
  },
  createAnimatedComponent: (component) => component,
  useSharedValue: jest.fn((initialValue) => ({ value: initialValue ?? 0 })),
  useAnimatedStyle: jest.fn((updater) => (typeof updater === 'function' ? updater() : {})),
  withTiming: jest.fn((value) => value),
  withDelay: jest.fn((_delay, animation) => animation),
  withSpring: jest.fn((value) => value),
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  cancelAnimation: jest.fn(),
  measure: jest.fn(),
  runOnJS: jest.fn(
    (fn) =>
      (...args) =>
        fn(...args)
  ),
  runOnUI: jest.fn((fn) => fn),
  scrollTo: jest.fn(),
  useAnimatedGestureHandler: jest.fn(() => ({})),
};

global.__reanimatedWorkletInit = NOOP;

module.exports = mockReanimated;
