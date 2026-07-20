const jestConfig = {
  preset: 'react-native',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@hexastudio/types$': '<rootDir>/../../packages/types',
    '^@hexastudio/utils$': '<rootDir>/../../packages/utils',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};

module.exports = jestConfig;
