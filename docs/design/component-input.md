# Component Guide: Input

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Specification

Input fields must avoid the "form-like" look. Instead of boxes, we use a "Minimalist Underline" or "Soft-Glass" approach to keep the interface feeling airy and high-end.

### Visuals
- **State: Default**
  - Background: `bg-white/5` or Transparent.
  - Border: `border-b border-white/20` (Bottom only).
  - Text: `text-white/90`.
- **State: Focus**
  - Border: `border-b border-gold` (Animated transition).
  - Background: `bg-white/10`.
  - Glow: Subtle gold shadow beneath the underline.
- **State: Error**
  - Border: `border-b border-red-500`.
  - Shake animation on focus loss if invalid.

### Typography
- **Label:** Small, uppercase, tracking-widest (`text-[10px] uppercase tracking-widest text-white/40`).
- **Input Text:** Medium weight, high contrast (`text-base font-medium`).
- **Placeholder:** Low contrast, italic (`text-white/30 italic`).

## Implementation Rules

### Validation & UX
- **Floating Labels:** Labels should shift upward on focus.
- **Real-time Validation:** Validate as the user types, but only show errors after `onBlur`.
- **Input Masks:** Use masks for phone numbers and dates to ensure data consistency.
- **Loading State:** Show a subtle pulse animation on the underline while validating.

### Code Example

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="relative group w-full">
      <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1 transition-colors group-focus-within:text-gold">
        {label}
      </label>
      <input 
        {...props}
        className={cn(
          "w-full bg-transparent border-b border-white/20 py-2 outline-none transition-all duration-300",
          "text-white placeholder:text-white/30 placeholder:italic",
          "focus:border-gold focus:bg-white/10",
          error && "border-red-500"
        )}
      />
      {error && (
        <motion.span 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-5 left-0 text-[10px] text-red-500"
        >
          {error}
        </motion.span>
      )}
    </div>
  );
}
```
