type EventProperties = Record<string, string | number | boolean | undefined>;

interface AnalyticsProvider {
  init(): void;
  pageView(path: string): void;
  track(event: string, properties?: EventProperties): void;
  identify(userId: string, traits?: EventProperties): void;
}

class PostHogProvider implements AnalyticsProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  init() {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = `https://us.i.posthog.com/static/array.js`;
    script.async = true;
    script.setAttribute('data-phjs', '1');
    script.setAttribute('data-api-key', this.apiKey);
    script.setAttribute('data-cdn', 'https://us.i.posthog.com');
    document.head.appendChild(script);
  }

  pageView(path: string) {
    if (typeof window === 'undefined') return;
    const ph = (window as unknown as Record<string, unknown>).posthog as { capture: (e: string, p: Record<string, unknown>) => void } | undefined;
    ph?.capture('$pageview', { path });
  }

  track(event: string, properties?: EventProperties) {
    if (typeof window === 'undefined') return;
    const ph = (window as unknown as Record<string, unknown>).posthog as { capture: (e: string, p?: Record<string, unknown>) => void } | undefined;
    ph?.capture(event, properties);
  }

  identify(userId: string, traits?: EventProperties) {
    if (typeof window === 'undefined') return;
    const ph = (window as unknown as Record<string, unknown>).posthog as { identify: (id: string, t?: Record<string, unknown>) => void } | undefined;
    ph?.identify(userId, traits);
  }
}

class GA4Provider implements AnalyticsProvider {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
  }

  init() {
    if (typeof window === 'undefined') return;
    const win = window as unknown as Record<string, unknown>;
    win.dataLayer = win.dataLayer || [];
    const gtag: (...args: unknown[]) => void = (...args) => {
      (win.dataLayer as unknown[]).push(args);
    };
    win.gtag = gtag;
    gtag('js', new Date());
    gtag('config', this.measurementId);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);
  }

  pageView(path: string) {
    this.track('page_view', { page_path: path });
  }

  track(event: string, properties?: EventProperties) {
    const gtag = (window as unknown as Record<string, unknown>).gtag as ((cmd: string, event: string, props?: Record<string, unknown>) => void) | undefined;
    gtag?.('event', event, properties);
  }

  identify(_userId: string, _traits?: EventProperties) {
    // GA4 doesn't have a direct identify; use user_id in config
  }
}

class NoopProvider implements AnalyticsProvider {
  init() {}
  pageView(_path: string) {}
  track(_event: string, _properties?: EventProperties) {}
  identify(_userId: string, _traits?: EventProperties) {}
}

function createProvider(): AnalyticsProvider {
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (phKey) return new PostHogProvider(phKey);
  if (gaId) return new GA4Provider(gaId);
  return new NoopProvider();
}

export const analytics = createProvider();
