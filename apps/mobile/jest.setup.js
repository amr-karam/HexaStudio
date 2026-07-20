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

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  useSegments: () => [''],
  useLocalSearchParams: () => ({ id: '1', name: 'Test Project' }),
  Stack: { Screen: () => null },
}));
