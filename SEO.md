# 🔍 HEXA STUDIO — SEO & METADATA GOVERNANCE

**Version:** 1.0.0  
**Authority Level:** 9  
**Scope:** Search Engine Optimization, OpenGraph, JSON-LD Structured Data, & ISR Revalidation  

---

## 1. SEO STANDARDS

1. **Title & Meta Descriptions**: Every public page MUST export proper `generateMetadata()` with unique title templates (`%s | HexaStudio`) and compelling meta descriptions.
2. **OpenGraph & Twitter Cards**: Image previews (`og:image`), site titles, and descriptions MUST be defined for social sharing.
3. **Structured Data (JSON-LD)**: Schema.org `Organization`, `LocalBusiness`, and `CreativeWork` JSON-LD scripts embedded on public routes.
4. **On-Demand ISR Revalidation**: Public pages use `export const revalidate = 3600;` combined with backend webhook trigger `/api/revalidate` for instant content updates.
