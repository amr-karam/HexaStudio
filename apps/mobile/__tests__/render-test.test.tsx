import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

describe('render test', () => {
  it('should return query methods', () => {
    const result = render(<View><Text>Hello</Text></View>);
    console.log('render result:', Object.keys(result));
    console.log('getByText:', typeof result.getByText);
    console.log('queryByText:', typeof result.queryByText);
    console.log('findByText:', typeof result.findByText);
    expect(typeof result.getByText).toBe('function');
  });
});