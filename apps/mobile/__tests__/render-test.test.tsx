import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('render test', () => {
  it('should return query methods', async () => {
    const result = await render(
      <View>
        <Text>Hello</Text>
      </View>,
    );
    // RNTL v14: render() is async and resolves to the render result,
    // which still exposes queries directly (via getQueriesForInstance).
    console.log('render result:', Object.keys(result));
    console.log('getByText:', typeof result.getByText);
    console.log('queryByText:', typeof result.queryByText);
    expect(typeof result.getByText).toBe('function');
    expect(typeof result.queryByText).toBe('function');

    // The `screen` export is bound to the latest render result as well.
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});