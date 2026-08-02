# Component Guide: Button

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Specification

Buttons are the primary interaction points. They must be clearly distinguishable by their intent.

### Variants

| Variant | Use Case | Visuals |
|---------|----------|----------|
| `primary` | Main call to action (CTA) | Brand color, high contrast |
| `secondary` | Alternative actions | Subtle background, outlined |
| `ghost` | Low priority actions | No background, text only |
| `danger` | Destructive actions | Red background/border |

### Sizes

| Size | Height | Padding | Typography |
|------|---------|---------|-------------|
| `sm` | 32px | px-3 | text-sm |
| `md` | 44px | px-6 | text-base |
| `lg` | 56px | px-8 | text-lg |

## Implementation Rules

### Accessibility
- `type="button"` by default.
- `aria-label` required if the button contains only an icon.
- High contrast ratios for all variants.
- Clear `:focus-visible` ring.

### States
- **Hover:** Slight scale (1.02x) and color shift.
- **Active:** Scale down (0.98x).
- **Disabled:** Opacity 50%, `cursor-not-allowed`, no pointer events.
- **Loading:** Replace text with `Spinner` and disable interaction.

### Code Example

```typescript
import { ButtonProps, ButtonVariant } from '@/types/ui';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ variant = 'primary', size = 'md', isLoading, children, ...props }: ButtonProps) {
  return (
    <button 
      className={cn(
        "transition-all duration-200 rounded-full font-medium",
        variants[variant],
        sizes[size],
        isLoading && "cursor-wait opacity-70"
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : children}
    </button>
  );
}
```
