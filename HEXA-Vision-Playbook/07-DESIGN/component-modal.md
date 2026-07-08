# Component Guide: Modal

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Specification

Modals are used for focused tasks that require the user's full attention. In the HEXA Vision platform, modals must feel like "layers" of the experience, not disruptive pop-ups.

### Visuals
- **Backdrop:** Semi-transparent obsidian with a heavy blur.
  - `bg-obsidian/60 backdrop-blur-xl`
- **Container:** Glassmorphic panel with a thin, light border.
  - `bg-white/5 border border-white/10 backdrop-blur-2xl`
- **Corners:** Large radius for a soft, premium feel (`rounded-3xl`).
- **Entrance:** Scale-up and fade-in animation from the center.

### Variants
| Variant | Use Case | Layout |
|---------|----------|--------|
| `centered` | Alerts, Confirmations | Small, centered fixed position |
| `full-screen` | Complex Forms, Editors | Edge-to-edge, slide-up transition |
| `side-panel` | Settings, Detail views | Slide-in from right, takes 40% width |

## Implementation Rules

### UX & Behavior
- **Click-to-Close:** Clicking the backdrop must close the modal.
- **ESC Key:** Pressing `Escape` must close the modal.
- **Focus Trap:** Focus must be trapped inside the modal while open.
- **Scroll Lock:** The background page must not scroll when the modal is active.

### Animation (GSAP/Framer Motion)
- **Entrance:** `scale(0.95) -> scale(1)` with `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Exit:** `scale(1) -> scale(0.95)` with a fast fade-out.

### Code Example

```typescript
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'centered' | 'full-screen' | 'side-panel';
}

export function Modal({ isOpen, onClose, title, children, variant = 'centered' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/60 backdrop-blur-xl p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl",
              variant === 'centered' && "max-w-lg w-full",
              variant === 'side-panel' && "fixed right-0 top-0 h-full w-full max-w-md rounded-l-3xl rounded-tr-3xl"
            )}
          >
            <h2 className="text-2xl font-serif mb-6">{title}</h2>
            {children}
            <Button variant="ghost" onClick={onClose} className="absolute top-4 right-4">✕</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```
