const jestConfig = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@hexastudio/types$': '<rootDir>/../../packages/types',
    '^@hexastudio/utils$': '<rootDir>/../../packages/utils',
    '^react-native/asset-registry$': '<rootDir>/__mocks__/react-native-asset-registry.js',
  },
  setupFiles: ['<rootDir>/jest.act-setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 60000,
};

module.exports = jestConfig;
