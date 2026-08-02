# Component Guide: Card

**Version:** 1.0.0  
**Last Updated:** 2026-07-08  

---

## Design Specification

Cards are the primary containers for grouping related content. In a luxury context, cards should feel like "Physical Objects" with subtle depth and lighting.

### Visuals
- **Background:** Very subtle gradient from `rgba(255,255,255,0.05)` to `rgba(255,255,255,0.02)`.
- **Border:** `1px solid rgba(255,255,255,0.1)`.
- **Corners:** `rounded-2xl`.
- **Hover State:** 
  - Slight lift (`translate-y-[-4px]`).
  - Border brightness increase (`border-white/30`).
  - Subtle outer glow (`shadow-[0_0_20px_rgba(255,255,255,0.05)]`).

### Variants
| Variant | Use Case | Special Feature |
|---------|----------|-----------------|
| `featured` | Hero sections, Highlighted projects | Gold accent border, larger scale |
| `minimal` | List items, Secondary content | No border, hover-only background |
| `glass` | Overlays on 3D scenes | Higher blur, lower opacity |

## Implementation Rules

### Layout
- **Padding:** Consistent internal padding (`p-6` for standard, `p-8` for featured).
- **Alignment:** Vertical stacking of elements (Image → Title → Description → Action).
- **Content Overflow:** Use `line-clamp` for descriptions to maintain grid uniformity.

### Interactions
- **Entrance:** Staggered fade-in and slide-up.
- **Click:** Scale down (0.98x) on press.

### Code Example

```typescript
interface CardProps {
  title: string;
  description: string;
  image?: string;
  variant?: 'featured' | 'minimal' | 'glass';
  children?: ReactNode;
}

export function Card({ title, description, image, variant = 'featured', children }: CardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border transition-all duration-300",
        variant === 'featured' && "border-white/20 bg-gradient-to-b from-white/10 to-transparent",
        variant === 'minimal' && "border-transparent hover:bg-white/5",
        variant === 'glass' && "bg-white/5 backdrop-blur-md border-white/10"
      )}
    >
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            alt={title} 
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-serif mb-2 group-hover:text-gold transition-colors">{title}</h3>
        <p className="text-sm text-white/60 line-clamp-2 mb-4">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}
```
