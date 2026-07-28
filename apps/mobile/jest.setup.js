jest.mock('expo-secure-store', () => ({
  __esModule: true,
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'https://api.hexastudio.net',
        cmsUrl: 'https://cms.hexastudio.net',
      },
    },
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(() => Promise.resolve()),
    getItem: jest.fn(() => Promise.resolve(null)),
    removeItem: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => {}),
    fetch: jest.fn(() =>
      Promise.resolve({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      }),
    ),
  },
}));

jest.mock('expo-notifications', () => ({
  __esModule: true,
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(() => Promise.resolve()),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'ExponentPushToken[test]' })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('scheduled-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  getBadgeCountAsync: jest.fn(() => Promise.resolve(0)),
  setBadgeCountAsync: jest.fn(() => Promise.resolve()),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  __esModule: true,
  isDevice: true,
}));

jest.mock('expo-updates', () => ({
  __esModule: true,
  checkForUpdateAsync: jest.fn(() => Promise.resolve({ isAvailable: false })),
  fetchUpdateAsync: jest.fn(() => Promise.resolve({ isNew: true })),
  reloadAsync: jest.fn(() => Promise.resolve()),
  eventListener: jest.fn(() => ({ remove: jest.fn() })),
  useUpdates: jest.fn(() => ({
    isUpdateAvailable: false,
    isUpdatePending: false,
    isChecking: false,
    isDownloading: false,
    downloadedUpdate: null,
    checkError: null,
    downloadError: null,
  })),
}));

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  const ReanimatedMock = require('react-native-reanimated/mock');

  const AnimatedView = React.forwardRef((props, ref) => {
    const { entering: _entering, exiting: _exiting, layout: _layout, ...rest } = props;
    return React.createElement(View, { ...rest, ref });
  });

  return {
    ...ReanimatedMock,
    default: {
      ...ReanimatedMock.default,
      View: AnimatedView,
      createAnimatedComponent: (Component) => {
        return React.forwardRef((props, ref) => {
          const { entering: _e, exiting: _x, layout: _l, ...rest } = props;
          return React.createElement(Component, { ...rest, ref });
        });
      },
    },
  };
});

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.loop = () => ({ start: () => {}, stop: () => {}, reset: () => {} });
  RN.Animated.timing = () => ({ start: () => {}, stop: () => {}, reset: () => {} });
  RN.Animated.spring = () => ({ start: () => {}, stop: () => {}, reset: () => {} });
  return RN;
});

jest.mock('@react-native-community/netinfo', () => {
  let listener = () => {};
  return {
    __esModule: true,
    default: {
      addEventListener: jest.fn((callback) => {
        listener = callback;
        return () => {};
      }),
      fetch: jest.fn(() =>
        Promise.resolve({
          isConnected: true,
          isInternetReachable: true,
          type: 'wifi',
        }),
      ),
      // Test helper to synchronously trigger state changes
      __trigger: (state) => listener(state),
    },
  };
});

global.__DEV__ = true;
global.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => [''],
  useLocalSearchParams: () => ({ id: '1', name: 'Test Project' }),
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));
