> ## ⚠️ STATUS: SUPERSEDED — NOT IMPLEMENTED
> This task spec was never implemented. The functional, production Portal AI Copilot
> (multimodal: text / image upload / voice input) lives at
> `apps/frontend/src/features/portal/components/PortalAiCopilot.tsx` and is wired into
> the Client Portal. Kept for historical reference only.
>
> Reviewed 2026-08-10 by @review.

# 🚀 Task Delegation: Premium Redesign of PortalAiCopilot.tsx

## Agent Assignment
**Primary Agent:** @frontend-dev (Creative Excellence Mode)
**Secondary Agents:** @accessibility-engineer, @performance-engineer, @qa
**Priority:** Critical - Luxury UX upgrade required

---

## Task Overview
Redesign PortalAiCopilot.tsx to luxury premium standard (9.5/10) with glass morphism, premium animations, and WCAG 2.1 AAA compliance.

## 📋 Detailed Requirements

### Design System (9.5/10 Standard)
**Glass Morphism:**
- backdrop-filter: blur(25px) with opacity 0.9
- Premium color palette: #1a1a2e → #16213e → #0f3460 gradients
- Multi-layer shadows with spread and blur
- Border radius: 20px for cards, 12px for buttons

**Typography:**
- Inter variable font for body text
- Playfair Display for headings
- Proper font weights and hierarchy

**Micro-interactions:**
- Scale 1.02 + opacity 0.95 on hover
- Animation timing: 0.4s cubic-bezier(0.17, 0.67, 0.12, 0.99)
- Smooth transitions between all states

### Components to Enhance (5 Core Components)

#### 1. Glass Morphism Navbar
**Requirements:**
- backdrop-filter: blur(25px) with glass effect
- Premium hover effects with GSAP animations
- Smooth scroll animations using GSAP ScrollTrigger
- Mobile-first responsive with hamburger menu
- Sticky positioning with shadow elevation
- WCAG 2.1 AAA compliant keyboard navigation

**Deliverables:**
- Navbar component with glass morphism
- GSAP scroll animations
- Mobile responsive design
- Accessibility compliance

#### 2. AI Chat Interface
**Requirements:**
- Message bubbles with glass effect backdrop-filter
- Typing indicators with pulse animation (Framer Motion)
- Presence indicators with online/offline states
- Source citations with premium styling
- Smooth message transitions
- Real-time message streaming

**Deliverables:**
- Chat message bubbles with glass effect
- Typing indicator component
- Presence status indicators
- Source citation styling
- Animation performance optimized

#### 3. Image Upload Component
**Requirements:**
- Drop zone with glass effect backdrop-filter
- Preview with smooth fade-in animation
- Upload progress with gradient fill
- Error states with premium design
- Drag and drop functionality
- File type validation

**Deliverables:**
- Drop zone with glass morphism
- File preview component
- Progress bar with gradient
- Error state styling
- Drag and drop handlers

#### 4. Voice-to-Text Button
**Requirements:**
- Mic icon with pulse animation
- Recording state with visual feedback
- Confidence meter with gradient animation
- Error states with premium styling
- Real-time audio visualization
- Microphone permission handling

**Deliverables:**
- Mic button with pulse animation
- Recording state visualizer
- Confidence meter component
- Error state styling
- Audio visualization

#### 5. Send Button
**Requirements:**
- Gradient background (luxury palette: #1a1a2e → #16213e → #0f3460)
- Scale animation on hover
- Loading state with premium spinner
- Success state with checkmark animation
- Disabled state with opacity
- Form submission handling

**Deliverables:**
- Gradient button component
- Hover animations
- Loading spinner
- Success checkmark animation
- Form integration

---

## 🎨 Animation System

### GSAP Animations
```typescript
// Navbar scroll animation
gsap.to(navRef.current, {
  y: 0,
  opacity: 1,
  duration: 0.8,
  ease: "power3.out",
  scrollTrigger: {
    trigger: "body",
    start: "top -100px",
    end: "top 0px",
    scrub: 0.5
  }
});

// Message bubble entrance animation
gsap.from(messageRef.current, {
  y: 20,
  opacity: 0,
  duration: 0.4,
  ease: "power2.out",
  stagger: 0.1
});
```

### Framer Motion Animations
```typescript
// Hover effects
<motion.div
  whileHover={{ scale: 1.02, opacity: 0.95 }}
  transition={{ duration: 0.4, ease: "easeInOut" }}
>
  {/* Content */}
</motion.div>

// Typing indicator
<motion.div
  animate={{ opacity: [0.4, 1, 0.4] }}
  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
/>
```

### Animation Performance Requirements
- All animations must run at 60fps
- Use GPU-accelerated transforms (translate3d, scale3d, opacity)
- Implement will-change: transform for animated elements
- Zero layout shifts during state transitions
- Smooth scrolling with GSAP ScrollTrigger

---

## ♿ Accessibility Implementation (WCAG 2.1 AAA)

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus states must be visible and meet contrast requirements (3:1 minimum)
- Tab order must follow logical UI flow
- Skip links for main content

### Screen Reader Support
- ARIA labels for all interactive elements
- Proper role attributes (button, dialog, region, etc.)
- Live regions for dynamic content (chat messages)
- Status messages for state changes
- Proper heading hierarchy (h1-h6)

### Color Contrast
- Text: Minimum 4.5:1 contrast ratio
- Interactive elements: Minimum 3:1 contrast ratio
- Focus indicators: Minimum 3:1 contrast ratio
- Error messages: Must be distinguishable from normal text

### Reduced Motion Support
- Respect prefers-reduced-motion media query
- Provide static alternatives for animations
- Ensure content remains accessible without animations

### Implementation Checklist
- [ ] Keyboard trap prevention
- [ ] Focus management on route changes
- [ ] ARIA live regions for chat messages
- [ ] Proper heading hierarchy
- [ ] Alt text for images
- [ ] Form labels and instructions
- [ ] Color blindness friendly palette
- [ ] Reduced motion support
- [ ] Touch target size (> 48x48px)
- [ ] Zoom support (200%)

---

## ⚡ Performance Optimization

### Bundle Size Targets
- Main component bundle: < 150KB gzipped
- Vendor bundle: < 50KB gzipped
- Total page load: < 200KB gzipped
- LCP (Largest Contentful Paint): < 0.8s

### Optimization Techniques
1. **Code Splitting:**
   - Dynamic imports for heavy components
   - Lazy load non-critical components
   - Route-based code splitting

2. **Animation Performance:**
   - GPU-accelerated transforms only
   - requestAnimationFrame for smooth animations
   - Avoid layout thrashing
   - Use will-change: transform

3. **Image Optimization:**
   - Responsive images with srcset
   - Modern formats (WebP, AVIF)
   - Lazy loading with Intersection Observer
   - Proper dimensions and aspect ratios

4. **Font Optimization:**
   - font-display: swap
   - Subset fonts for used characters
   - Preload critical fonts
   - Variable fonts for smaller size

5. **Caching Strategy:**
   - Service worker for offline support
   - Cache API responses
   - Long-term caching for static assets

### Performance Monitoring
- Bundle analyzer integration
- Real user monitoring (RUM)
- Animation performance metrics
- Memory usage tracking
- FPS monitoring during animations

---

## 📊 Deliverables

### 1. Enhanced PortalAiCopilot.tsx
**File:** `apps/frontend/src/components/organisms/portal-ai-copilot/PortalAiCopilot.tsx`

**Structure:**
```typescript
// Imports
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { useGSAP } from '@gsap/react';

// Components
import GlassNavbar from '@/components/molecules/glass-navbar';
import ChatInterface from '@/components/organisms/chat-interface';
import ImageUpload from '@/components/molecules/image-upload';
import VoiceToText from '@/components/atoms/voice-to-text-button';
import SendButton from '@/components/atoms/send-button';

// Types
import type { Message, PresenceStatus } from '@hexastudio/types';

// Main Component
export default function PortalAiCopilot() {
  // State management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // GSAP animations
  useGSAP(() => {
    // Navbar animations
    gsap.from('.navbar', {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
    
    // Scroll to bottom on new message
    gsap.to(messagesEndRef.current!, {
      scrollIntoView: true,
      behavior: 'smooth'
    });
  });
  
  // Component logic
  const handleSendMessage = async (message: string) => {
    // Implementation
  };
  
  const handleImageUpload = async (file: File) => {
    // Implementation
  };
  
  const handleVoiceInput = () => {
    // Implementation
  };
  
  return (
    <div className="portal-ai-copilot" ref={containerRef}>
      <GlassNavbar />
      <ChatInterface 
        messages={messages}
        onSend={handleSendMessage}
      />
      <div className="input-area">
        <ImageUpload onUpload={handleImageUpload} />
        <VoiceToText 
          isRecording={isRecording}
          onToggle={handleVoiceInput}
        />
        <SendButton 
          isLoading={isLoading}
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
}
```

### 2. Animation Performance Metrics
**File:** `apps/frontend/src/components/organisms/portal-ai-copilot/AnimationPerformance.tsx`

**Features:**
- Real-time FPS monitoring
- Animation duration tracking
- Bundle size reporting
- Memory usage tracking
- Performance budget alerts

### 3. Accessibility Audit Report
**File:** `apps/frontend/src/components/organisms/portal-ai-copilot/AccessibilityAudit.tsx`

**Features:**
- Automated accessibility checks (axe-core)
- Manual checklist verification
- Screen reader testing results
- Keyboard navigation testing
- Color contrast verification
- Compliance score tracking

### 4. Before/After Visual Comparisons
**Files:**
- `apps/frontend/public/before-after/portal-ai-copilot-before.png`
- `apps/frontend/public/before-after/portal-ai-copilot-after.png`
- `apps/frontend/public/before-after/animations-before.mp4`
- `apps/frontend/public/before-after/animations-after.mp4`

**Documentation:**
- Comparison report with metrics
- User experience improvements
- Visual quality enhancements
- Animation smoothness comparison

### 5. Performance Budget Compliance Verification
**File:** `apps/frontend/src/components/organisms/portal-ai-copilot/PerformanceBudget.tsx`

**Features:**
- Bundle size monitoring
- Load time tracking
- Animation performance metrics
- Memory usage analysis
- Performance budget alerts
- Optimization recommendations

---

## 🔧 Technical Implementation Details

### Required Dependencies
```bash
# Core animations
npm install gsap @gsap/react framer-motion

# UI components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Animation helpers
npm install @react-spring/web

# Performance monitoring
npm install web-vitals @next/bundle-analyzer

# Accessibility
npm install @axe-core/react react-aria

# GSAP plugins
npm install @gsap/shockingly
```

### TailwindCSS Configuration
**File:** `apps/frontend/src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --glass-blur: 25px;
    --glass-opacity: 0.9;
    --timing-function: cubic-bezier(0.17, 0.67, 0.12, 0.99);
    --radius-card: 20px;
    --radius-button: 12px;
  }
  
  .glass-effect {
    backdrop-filter: blur(var(--glass-blur));
    background: rgba(255, 255, 255, var(--glass-opacity));
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-card);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
  
  .luxury-gradient {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }
}

@layer utilities {
  .animation-smooth {
    transition: all 0.4s var(--timing-function);
  }
  
  .hover-scale {
    transition: transform 0.4s var(--timing-function);
  }
  
  .hover-scale:hover {
    transform: scale(1.02);
  }
}
```

### GSAP Configuration
**File:** `apps/frontend/src/utils/gsap-config.ts`

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { TextPlugin } from 'gsap/TextPlugin';

// Register plugins
gsap.registerPlugin(ScrollTrigger, Flip, MotionPathPlugin, TextPlugin);

// Defaults
gsap.defaults({
  duration: 0.4,
  ease: 'power2.out',
  overwrite: true,
});

// ScrollTrigger defaults
ScrollTrigger.defaults({
  markers: process.env.NODE_ENV === 'development',
  invalidateOnRefresh: true,
});

export { gsap, ScrollTrigger };
```

---

## 📅 Implementation Timeline

### Phase 1: Setup & Configuration (2 hours)
- [ ] Install dependencies
- [ ] Configure TailwindCSS
- [ ] Set up GSAP
- [ ] Configure Framer Motion
- [ ] Set up accessibility tools
- [ ] Configure performance monitoring

### Phase 2: Component Redesign (6 hours)
- [ ] Glass morphism navbar
- [ ] AI chat interface with glass bubbles
- [ ] Image upload component with drop zone
- [ ] Voice-to-text button with animations
- [ ] Send button with gradient and states

### Phase 3: Animation Integration (4 hours)
- [ ] GSAP ScrollTrigger for navbar
- [ ] Framer Motion for component animations
- [ ] Micro-interactions for all interactive elements
- [ ] Loading states with smooth transitions
- [ ] Message animations

### Phase 4: Accessibility Implementation (3 hours)
- [ ] Keyboard navigation support
- [ ] Screen reader improvements
- [ ] Focus management
- [ ] Color contrast verification
- [ ] Reduced motion support

### Phase 5: Performance Optimization (3 hours)
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle analysis
- [ ] Animation performance tuning
- [ ] Image optimization

### Phase 6: Testing & QA (4 hours)
- [ ] Cross-browser testing
- [ ] Device testing (mobile, tablet, desktop)
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] User testing
- [ ] Bug fixes

### Total Estimated Time: 22 hours

---

## 🎯 Success Criteria Checklist

### Design Quality (9.5/10 Standard)
- [ ] Glass morphism implemented correctly with backdrop-filter
- [ ] Premium color palette applied throughout
- [ ] Typography hierarchy established (Inter for body, Playfair for headings)
- [ ] Multi-layer shadows with spread and blur
- [ ] Border radius: 20px for cards, 12px for buttons
- [ ] Micro-interactions: scale 1.02 + opacity 0.95 on hover
- [ ] Animation timing: 0.4s cubic-bezier(0.17, 0.67, 0.12, 0.99)

### Animation Performance
- [ ] All animations run at 60fps
- [ ] GPU-accelerated transforms used (translate3d, scale3d, opacity)
- [ ] will-change: transform for animated elements
- [ ] Zero layout shifts during state transitions
- [ ] GSAP ScrollTrigger for smooth scrolling
- [ ] Framer Motion for React animations

### Accessibility (WCAG 2.1 AAA)
- [ ] Keyboard navigation fully functional
- [ ] Focus states visible and meet contrast requirements
- [ ] Screen reader support with proper ARIA attributes
- [ ] Color contrast verified (4.5:1 minimum)
- [ ] Reduced motion support implemented
- [ ] Touch target size > 48x48px
- [ ] Zoom support (200%)

### Performance
- [ ] Bundle size < 200KB gzipped
- [ ] LCP < 0.8s
- [ ] Zero layout shifts
- [ ] Code splitting implemented
- [ ] Lazy loading for non-critical components
- [ ] Animation performance optimized
- [ ] Memory usage optimized

### Code Quality
- [ ] TypeScript strict mode
- [ ] No console.log statements in production
- [ ] All types shared via packages/types
- [ ] Follows HEXA Studio coding standards
- [ ] Atomic Design structure maintained
- [ ] No unused imports
- [ ] Proper error handling

### Testing
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness (iOS, Android)
- [ ] Accessibility audit passed
- [ ] Performance testing passed
- [ ] User testing completed
- [ ] E2E tests passing

---

## 📞 Coordination with Other Agents

### Required Agent Coordination

#### @3d-engineer (if applicable)
- Coordinate on any 3D elements in the interface
- Ensure GPU acceleration compatibility
- Performance optimization for 3D components

#### @backend-dev
- API contract verification
- Data fetching optimization
- Error handling improvements

#### @accessibility-engineer
- Accessibility audit and remediation
- Screen reader testing
- Keyboard navigation testing
- Color contrast verification

#### @performance-engineer
- Bundle analysis and optimization
- Animation performance profiling
- Memory usage analysis
- Lighthouse scores verification

#### @qa
- E2E test coverage
- Cross-browser testing
- Device testing
- Regression testing

#### @docs
- Component documentation
- Animation API documentation
- Accessibility documentation
- Usage examples

---

## 📝 Documentation Requirements

### Code Documentation
- JSDoc comments for all components
- TypeScript interfaces and types
- Animation configuration documentation
- Accessibility attributes documentation

### Component Documentation
- Storybook stories for all components
- Usage examples
- Props documentation
- Animation states documentation

### Design Documentation
- Color palette reference
- Typography scale
- Animation timing reference
- Component specifications

### API Documentation
- Component props and events
- Animation configuration options
- Accessibility attributes
- Performance characteristics

---

## 🚨 Quality Gates

### Before Submission
1. **Lint Check:** `npm run lint` - Must pass with no errors
2. **Type Check:** `npm run typecheck` - Must pass with no errors
3. **Test:** `npm run test` - Must pass with 100% coverage
4. **E2E Test:** `npm run test:e2e` - Must pass all tests
5. **Lighthouse:** Must score > 95 in all categories
6. **Accessibility:** axe-core scan must pass with 0 critical issues
7. **Bundle Analysis:** Must meet size requirements
8. **Performance Budget:** Must meet all performance targets

### Review Process
- Code review by @review agent
- Accessibility review by @accessibility-engineer
- Performance review by @performance-engineer
- QA review by @qa
- Documentation review by @docs

---

## 🎉 Final Deliverables

1. ✅ Enhanced PortalAiCopilot.tsx with premium design
2. ✅ Animation performance metrics dashboard
3. ✅ Accessibility audit report (WCAG 2.1 AAA compliant)
4. ✅ Before/after visual comparisons
5. ✅ Performance budget compliance verification
6. ✅ Comprehensive documentation
7. ✅ All tests passing
8. ✅ Code quality gates passed
9. ✅ Performance metrics met
10. ✅ Luxury UX score: 9.5/10

---

## 📞 Contact & Support

**Primary Contact:** @frontend-dev
**Secondary Contacts:** @accessibility-engineer, @performance-engineer, @qa
**Documentation:** See PREMIUM_REDESIGN_PORTAL_AI_COPILOT.md

**Status:** Ready for Implementation
**Priority:** Critical - Luxury UX Upgrade Required
**Estimated Completion:** 22 hours
**Success Metric:** 9.5/10 Luxury UX Score

---

**Last Updated:** August 1, 2026
**Version:** 1.0
**Status:** Active Task