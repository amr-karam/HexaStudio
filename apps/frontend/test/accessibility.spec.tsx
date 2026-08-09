import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '@hexastudio/ui';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('Button component has no accessibility violations', async () => {
    const { container } = render(<Button>Test Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
