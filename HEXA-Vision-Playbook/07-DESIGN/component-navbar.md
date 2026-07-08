# Component Guide: NavBar

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Specification

The NavBar is the "Anchor" of the site. It must remain unobtrusive during the 3D experience but provide instant access to navigation.

### Visuals
- **Position:** Fixed top.
- **Background:** Glassmorphism.
  - `bg-obsidian/20 backdrop-blur-md border-b border-white/10`.
- **Logo:** High-contrast, vector-based, centered or left-aligned.
- **Navigation Links:**
  - Default: `text-white/60` with `tracking-wide`.
  - Hover: `text-white` with a subtle underline slide-in animation.
  - Active: `text-gold`.

### Layout Variants
| Variant | Use Case | Structure |
|---------|----------|-----------|
| `main` | Public Site | Logo (Left) | Links (Center) | CTA (Right) |
| `portal` | Client Portal | Logo (Left) | User Menu (Right) |
| `minimal` | Landing Page | Logo (Center) | Burger Menu (Right) |

## Implementation Rules

### Behavior
- **Scroll Transition:** The NavBar should be transparent at the top of the page and gain background blur/opacity after scrolling 50px.
- **Z-Index:** Must be above all elements except Modals (`z-40`).
- **Sticky Header:** Use `position: sticky` or `fixed` with a placeholder to prevent layout jump.

### Animations (GSAP)
- **Link Hover:** The underline should expand from the center outwards.
- **Scroll Effect:** The height of the NavBar should subtly shrink on scroll to maximize viewport space.

### Code Example

```typescript
export function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-40 transition-all duration-500 px-8 py-4 flex items-center justify-between",
      scrolled ? "bg-obsidian/40 backdrop-blur-lg border-b border-white/10 py-3" : "bg-transparent py-6"
    )}>
      <div className="flex items-center gap-2 font-serif text-2xl font-bold text-white">
        HEXA <span className="text-gold">STUDIO</span>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        {['Projects', 'Studio', 'Contact'].map((item) => (
          <a key={item} href={`#${item.toLowerCase()}`} className="relative text-sm uppercase tracking-widest text-white/60 hover:text-white transition-colors group">
            {item}
            <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" />
          </a>
        ))}
      </div>

      <Button variant="primary" size="sm" className="rounded-full px-6">
        Start Project
      </Button>
    </nav>
  );
}
```
