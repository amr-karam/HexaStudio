# Executive Dashboard Development - Delegation Prompt

## Project Overview
Build a premium executive dashboard with real-time analytics, premium glass morphism design, and seamless data integration across multiple sources.

## Technical Stack
- **Framework**: Next.js 14 App Router (TypeScript strict mode)
- **Styling**: TailwindCSS 4 with custom theme and glass morphism design system
- **Charts**: Recharts library with premium animations
- **Real-time**: Socket.IO client for live updates
- **Data Sources**: Odoo REST API + AI metrics integration
- **State Management**: Zustand (client state), TanStack Query (server state)
- **Performance**: Bundle size < 200KB, zero layout shifts, mobile responsive

## Architecture Requirements

### Component Structure (Atomic Design)
```
components/
├── dashboard/
│   ├── MetricsPanel.tsx (Organism) - Real-time metrics with glass cards
│   ├── Charts.tsx (Organism) - All visualization components
│   ├── Sidebar.tsx (Organism) - Navigation with glass morphism
│   ├── Layout.tsx (Template) - Dashboard layout wrapper
│   ├── SkeletonLoader.tsx (Atom) - Loading states
│   └── ErrorBoundary.tsx (Atom) - Error handling

lib/
├── services/
│   ├── SocketService.ts - Real-time presence and activity
│   ├── OdooService.ts - Project and invoice data
│   ├── AiService.ts - Copilot usage analytics
│   └── DashboardService.ts - Aggregated metrics
├── types/
│   ├── dashboard.ts - Type definitions
│   ├── odoo.ts - Odoo API types
│   ├── socket.ts - Socket.IO types
│   └── ai.ts - AI metrics types
└── utils/
    ├── api.ts - API client with error handling
    ├── cache.ts - Data caching strategies
    └── performance.ts - Performance monitoring

app/
└── dashboard/
    ├── page.tsx - Main dashboard
    ├── metrics/page.tsx - Detailed metrics view
    ├── charts/page.tsx - Visualizations page
    └── settings/page.tsx - User preferences

styles/
└── globals.css - Custom Tailwind theme with glass morphism
```

## Detailed Component Specifications

### 1. MetricsPanel.tsx (Organism)
**Requirements:**
- Active users count (live from Socket.IO, updates every 5 seconds)
- Projects in progress (Odoo API integration)
- Revenue summary (invoices paid vs pending from Odoo)
- AI copilot usage analytics (AIService integration)
- Channel activity heatmap (Socket.IO + custom visualization)
- Cards with premium glass morphism design
- Real-time updates every 5 seconds
- Loading states with skeleton screens
- Error boundaries for API failures

**Data Flow:**
```typescript
// Real-time updates via Socket.IO
useEffect(() => {
  const interval = setInterval(() => {
    fetchMetrics(); // OdooService
    fetchAiMetrics(); // AiService
    socket.emit('request_active_users');
  }, 5000);
  
  socket.on('active_users_update', (data) => {
    setActiveUsers(data.count);
  });
  
  return () => clearInterval(interval);
}, []);
```

**Styling Specifications:**
- Glass morphism: backdrop-filter: blur(12px); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
- Border radius: 16px
- Box shadow: 0 8px 32px rgba(0,0,0,0.1)
- Hover effects with transform: translateY(-2px) and transition
- Premium color palette: glass-blue (rgba(147, 197, 253, 0.2)), glass-purple (rgba(192, 132, 252, 0.2))

### 2. Charts.tsx (Organism)
**Requirements:**
- Line chart: Daily active users (last 30 days) with Recharts
- Bar chart: Projects by status (active, completed, pending)
- Donut chart: Revenue distribution (paid, pending, overdue)
- Heatmap: Channel activity by hour
- All charts with premium styling and GSAP animations
- Responsive design for 1440px and 1920px screens
- Zero layout shifts on data updates

**Chart Specifications:**
```typescript
// Line Chart - Daily Active Users
<LineChart data={dailyUsersData}>
  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
  <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
  <YAxis stroke="rgba(255,255,255,0.6)" />
  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)' }} />
  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} dot={{ r: 6 }} />
</LineChart>
```

**Animations:**
- GSAP for entrance animations (fadeIn, slideIn)
- Smooth transitions between chart types
- Hover effects on data points
- Loading skeletons for charts

### 3. Sidebar.tsx (Organism)
**Requirements:**
- Executive quick access menu
- Role-based permissions (admin view only sections)
- Quick stats cards at top
- Responsive design for desktop (1440px width)
- Glass morphism styling
- Active route highlighting with premium animations
- Collapsible state for mobile responsiveness

**Navigation Structure:**
```typescript
const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Metrics', href: '/dashboard/metrics', icon: ChartBarIcon },
  { name: 'Charts', href: '/dashboard/charts', icon: ChartPieIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
];
```

**Active Route Highlighting:**
```typescript
const isActive = usePathname() === item.href;
<li className={`${isActive ? 'bg-white/10 border-l-4 border-blue-400' : ''} transition-all duration-300`}>
```

### 4. Services Layer (lib/services/)

#### SocketService.ts
```typescript
class SocketService {
  private socket: Socket;
  
  connect(url: string): void {
    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  
  onActiveUsers(callback: (data: ActiveUsersData) => void): void {
    this.socket.on('active_users_update', callback);
  }
  
  disconnect(): void {
    this.socket.disconnect();
  }
}
```

#### OdooService.ts
```typescript
class OdooService {
  private baseUrl: string;
  private cache: Map<string, CachedData>;
  
  async getProjectsInProgress(): Promise<Project[]> {
    const cacheKey = 'projects_in_progress';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }
    
    const response = await fetch('/api/odoo/projects?status=in_progress');
    if (!response.ok) throw new Error('Failed to fetch projects');
    
    const data = await response.json();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
  
  async getRevenueSummary(): Promise<RevenueData> {
    // Implementation with error handling and caching
  }
}
```

#### AiService.ts
```typescript
class AiService {
  async getCopilotUsageAnalytics(): Promise<AiUsageData> {
    const response = await fetch('/api/ai/usage');
    if (!response.ok) throw new Error('AI service unavailable');
    return response.json();
  }
}
```

#### DashboardService.ts
```typescript
class DashboardService {
  async getAggregatedMetrics(): Promise<AggregatedMetrics> {
    const [activeUsers, projects, revenue, aiUsage] = await Promise.all([
      SocketService.getActiveUsers(),
      OdooService.getProjectsInProgress(),
      OdooService.getRevenueSummary(),
      AiService.getCopilotUsageAnalytics(),
    ]);
    
    return { activeUsers, projects, revenue, aiUsage };
  }
}
```

## Pages to Create

### /dashboard/page.tsx
- Main dashboard landing page
- Overview of all metrics
- Quick access to key data
- Real-time updates
- Layout with Sidebar and Main content

### /dashboard/metrics/page.tsx
- Detailed metrics view
- Individual metric cards
- Time period selectors
- Export functionality
- Full-screen mode toggle

### /dashboard/charts/page.tsx
- All visualizations in one view
- Chart type selectors
- Date range picker
- Chart configuration options
- Responsive grid layout

### /dashboard/settings/page.tsx
- User preferences
- Notification settings
- Theme selection (light/dark/glass)
- API key management
- Role-based access controls

## Technical Requirements Implementation

### Performance Optimization
1. **Bundle Size**: < 200KB (analyze with @next/bundle-analyzer)
2. **Zero Layout Shifts**: Use CSS aspect-ratio, define dimensions upfront
3. **Mobile Responsive**: Test at 1440px and 1920px, mobile breakpoints
4. **No Unnecessary Re-renders**: Use React.memo, useMemo, useCallback
5. **Code Splitting**: Dynamic imports for heavy components
6. **Image Optimization**: Next.js Image component with blur placeholders

### Error Handling
```typescript
// Error Boundary Component
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { contexts: { errorInfo } });
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Loading States
```typescript
// Skeleton Loader Component
const MetricCardSkeleton = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-4 bg-white/20 rounded mb-4"></div>
    <div className="h-8 bg-white/30 rounded mb-2"></div>
    <div className="h-3 bg-white/20 rounded w-3/4"></div>
  </div>
);
```

### Real-time Data Flow
```typescript
// Custom Hook for Real-time Metrics
function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await DashboardService.getAggregatedMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err as Error);
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    
    return () => clearInterval(interval);
  }, [fetchMetrics]);
  
  return { metrics, isLoading, error };
}
```

## Styling System

### Custom Tailwind Theme (tailwind.config.js)
```javascript
extend: {
  colors: {
    'glass-blue': 'rgba(147, 197, 253, 0.2)',
    'glass-purple': 'rgba(192, 132, 252, 0.2)',
    'glass-green': 'rgba(163, 230, 53, 0.2)',
  },
  backdropBlur: {
    '4xl': '40px',
    '5xl': '60px',
  },
},
plugins: [
  require('tailwindcss-glassmorphism'),
],
```

### Glass Morphism CSS
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  background: rgba(255, 255, 255, 0.15);
}
```

## Type Safety

### Type Definitions (packages/types/dashboard.ts)
```typescript
// Metrics Data Types
export interface ActiveUsersData {
  count: number;
  timestamp: string;
  sources: string[];
}

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'pending';
  progress: number;
  startDate: string;
  endDate?: string;
  budget: number;
}

export interface RevenueData {
  paid: number;
  pending: number;
  overdue: number;
  currency: string;
}

export interface AiUsageData {
  sessions: number;
  messages: number;
  activeUsers: number;
  responseTime: number;
}

export interface ChannelActivity {
  channel: string;
  hour: number;
  activity: number;
}

export interface AggregatedMetrics {
  activeUsers: ActiveUsersData;
  projects: Project[];
  revenue: RevenueData;
  aiUsage: AiUsageData;
  channelActivity: ChannelActivity[];
}
```

## Quality Assurance Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] All components typed with interfaces
- [ ] No `any` types used
- [ ] Error boundaries implemented
- [ ] Loading states with skeleton screens
- [ ] Performance monitoring with Sentry

### Performance
- [ ] Bundle size < 200KB (verify with @next/bundle-analyzer)
- [ ] Zero layout shifts (test with Lighthouse)
- [ ] Mobile responsive (test at 1440px and 1920px)
- [ ] No unnecessary re-renders (use React DevTools profiler)
- [ ] Images optimized with Next.js Image
- [ ] Code splitting implemented

### Testing
- [ ] Unit tests for services
- [ ] Integration tests for components
- [ ] E2E tests for user flows
- [ ] Lighthouse CI integration
- [ ] Accessibility audit (axe-core)

### Documentation
- [ ] Component documentation with Storybook
- [ ] API integration documentation
- [ ] Setup and deployment guide
- [ ] Performance optimization report
- [ ] Future extension documentation

## Deployment Requirements

### Environment Variables
```env
# Odoo API
NEXT_PUBLIC_ODOO_BASE_URL=https://odoo.hexastudio.net
NEXT_PUBLIC_ODOO_API_KEY=your-api-key

# Socket.IO
NEXT_PUBLIC_SOCKET_IO_URL=wss://socket.hexastudio.net

# AI Service
NEXT_PUBLIC_AI_SERVICE_URL=https://ai.hexastudio.net

# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

### Build Command
```bash
SKIP_ENV_VALIDATION=true npm run build --workspace=apps/frontend
```

### Quality Gate Sequence
```bash
npm run lint
npm run typecheck
npm run test
```

## Expected Output

1. **Complete Component Structure**
   - All React components with TypeScript
   - Proper atomic design organization
   - Reusable utility functions
   - Custom hooks for data fetching

2. **API Integration Code**
   - Odoo REST API client
   - Socket.IO real-time client
   - AI metrics integration
   - Error handling and retry logic
   - Caching strategies

3. **Real-time Data Flow**
   - Socket.IO event listeners
   - Polling mechanisms
   - WebSocket connection management
   - Data synchronization

4. **Premium Styling**
   - Custom Tailwind theme
   - Glass morphism design system
   - Responsive layouts
   - Premium animations (GSAP)
   - Dark/light mode support

5. **Performance Metrics Report**
   - Bundle analysis
   - Lighthouse scores
   - Performance bottlenecks identified
   - Optimization recommendations

6. **Documentation**
   - Component API documentation
   - Service usage guide
   - Setup instructions
   - Future extension points

7. **Test Suite**
   - Jest unit tests
   - React Testing Library integration tests
   - Playwright E2E tests
   - Lighthouse CI configuration

## Implementation Priority

### Phase 1: Foundation (Days 1-2)
- [ ] Project setup and configuration
- [ ] Type definitions and interfaces
- [ ] Service layer implementation
- [ ] Error handling utilities
- [ ] Custom Tailwind theme

### Phase 2: Core Components (Days 3-4)
- [ ] Sidebar component
- [ ] MetricsPanel component
- [ ] Charts component
- [ ] Layout wrapper
- [ ] Skeleton loaders

### Phase 3: Pages (Days 5-6)
- [ ] /dashboard page
- [ ] /dashboard/metrics page
- [ ] /dashboard/charts page
- [ ] /dashboard/settings page

### Phase 4: Real-time Integration (Days 7-8)
- [ ] Socket.IO connection
- [ ] Real-time updates implementation
- [ ] Polling mechanisms
- [ ] Data synchronization

### Phase 5: Polish & Optimization (Days 9-10)
- [ ] Premium animations (GSAP)
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Lighthouse optimization
- [ ] Bundle size reduction

### Phase 6: Testing & Documentation (Days 11-12)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Documentation
- [ ] Performance report

## Success Criteria

✅ **Luxury UX Score**: ≥9.5/10 on Luxury scale
✅ **Performance**: Bundle size < 200KB, 60+ FPS
✅ **Zero Layout Shifts**: Lighthouse CLS = 0
✅ **Mobile Responsive**: Works at 1440px and 1920px
✅ **Type Safety**: All components and services typed
✅ **Error Handling**: Graceful degradation, no crashes
✅ **Real-time**: Updates every 5 seconds without lag
✅ **Premium Design**: Glass morphism, premium animations
✅ **Documentation**: Complete and up-to-date

---

**Note**: This is a premium executive dashboard requiring Creative Excellence Mode. Every interaction must feel handcrafted and cinematic. Challenge every design decision. If a solution is "average," redesign it.

**Delegate to @3d-engineer** for any 3D elements if needed for premium visual effects.
**Delegate to @accessibility-engineer** for a11y audits.
**Delegate to @performance-engineer** for Core Web Vitals optimization.
**Delegate to @qa** for E2E tests and Lighthouse CI.
**Delegate to @docs** for component documentation and story variants.