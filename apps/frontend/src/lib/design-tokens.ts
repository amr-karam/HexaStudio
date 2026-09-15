export type DesignSettings = {
  colors: {
    gold: string;
    void: string;
    obsidian: string;
    alabaster: string;
    muted: string;
    goldSubtle: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    monoFont: string;
    headingTracking: string;
    bodySize: string;
  };
  siteIdentity: {
    logo: string;
    wordmark: string;
    tagline: string;
  };
  header: {
    variant: 'transparent' | 'solid';
    menu: Array<{ label: string; href: string }>;
  };
  hero: {
    variant: 'void-garden' | 'fracture-ring';
    monolithCount: number;
    showChapterRail: boolean;
  };
  footer: {
    kicker: string;
    cta: string;
    wordmarkItalic: boolean;
  };
  customCss: string;
}

const DEFAULT_SETTINGS: DesignSettings = {
  colors: {
    gold: '#D4AF37',
    void: '#0A0A0B',
    obsidian: '#121214',
    alabaster: '#F5F4F2',
    muted: '#A8A8A8',
    goldSubtle: 'rgba(212,175,55,0.15)',
  },
  typography: {
    headingFont: 'Bodoni Moda',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
    headingTracking: '-0.02em',
    bodySize: '1rem',
  },
  siteIdentity: {
    logo: '',
    wordmark: 'HexaStudio',
    tagline: 'Living Spaces. Visualized.',
  },
  header: {
    variant: 'transparent',
    menu: [],
  },
  hero: {
    variant: 'void-garden',
    monolithCount: 24,
    showChapterRail: true,
  },
  footer: {
    kicker: 'Hexa Studio — Architectural Visualization',
    cta: "Let's build — something extraordinary.",
    wordmarkItalic: true,
  },
  customCss: '',
};

/**
 * Generate CSS variables string from design settings.
 * Injected into the preview iframe's <head> as a <style> tag.
 */
export function injectDesignTokens(settings: DesignSettings): string {
  const { colors, typography } = settings;
  return `
    :root {
      --sl-void: ${colors.void};
      --sl-obsidian: ${colors.obsidian};
      --sl-alabaster: ${colors.alabaster};
      --sl-silver: ${colors.muted};
      --sl-gold: ${colors.gold};
      --sl-gold-subtle: ${colors.goldSubtle};
      --sl-heading-font: '${typography.headingFont}', 'Cormorant Garamond', Georgia, serif;
      --sl-body-font: '${typography.bodyFont}', system-ui, sans-serif;
      --sl-mono-font: '${typography.monoFont}', monospace;
    }
    * {
      color-scheme: dark;
    }
    body {
      background: var(--sl-void);
      color: var(--sl-alabaster);
      font-family: var(--sl-body-font);
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--sl-heading-font);
      letter-spacing: ${typography.headingTracking};
    }
    .mono, code, pre {
      font-family: var(--sl-mono-font);
    }
    ${settings.customCss}
  `;
}

/**
 * Fetch the latest design settings from Strapi.
 * Falls back to DEFAULT_SETTINGS if Strapi is unreachable.
 */
export async function fetchDesignSettings(): Promise<DesignSettings> {
  const cmsUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CMS_URL : undefined;
  if (!cmsUrl) return DEFAULT_SETTINGS;

  try {
    const res = await fetch(`${cmsUrl}/api/design-settings?populate=*`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Strapi returned ${res.status}`);
    const data = await res.json();
    // Strapi v4 nests fields under `attributes`; Strapi v5 returns them
    // flattened on `data`. Accept both shapes.
    const draft = data.data?.attributes ?? data.data ?? null;
    if (!draft) return DEFAULT_SETTINGS;

    return {
      colors: {
        gold: draft.colors?.gold ?? DEFAULT_SETTINGS.colors.gold,
        void: draft.colors?.void ?? DEFAULT_SETTINGS.colors.void,
        obsidian: draft.colors?.obsidian ?? DEFAULT_SETTINGS.colors.obsidian,
        alabaster: draft.colors?.alabaster ?? DEFAULT_SETTINGS.colors.alabaster,
        muted: draft.colors?.muted ?? DEFAULT_SETTINGS.colors.muted,
        goldSubtle: draft.colors?.goldSubtle ?? DEFAULT_SETTINGS.colors.goldSubtle,
      },
      typography: {
        headingFont: draft.typography?.headingFont ?? DEFAULT_SETTINGS.typography.headingFont,
        bodyFont: draft.typography?.bodyFont ?? DEFAULT_SETTINGS.typography.bodyFont,
        monoFont: draft.typography?.monoFont ?? DEFAULT_SETTINGS.typography.monoFont,
        headingTracking: draft.typography?.headingTracking ?? DEFAULT_SETTINGS.typography.headingTracking,
        bodySize: draft.typography?.bodySize ?? DEFAULT_SETTINGS.typography.bodySize,
      },
      siteIdentity: {
        // v4 media shape ({ data: { attributes: { url } } }), v5 flattened
        // ({ url }), or a plain URL string when stored as JSON.
        logo:
          draft.siteIdentity?.logo?.data?.attributes?.url ??
          draft.siteIdentity?.logo?.url ??
          (typeof draft.siteIdentity?.logo === 'string' ? draft.siteIdentity.logo : '') ??
          '',
        wordmark: draft.siteIdentity?.wordmark ?? DEFAULT_SETTINGS.siteIdentity.wordmark,
        tagline: draft.siteIdentity?.tagline ?? DEFAULT_SETTINGS.siteIdentity.tagline,
      },
      header: {
        variant: draft.header?.variant ?? DEFAULT_SETTINGS.header.variant,
        menu: draft.header?.menu ?? DEFAULT_SETTINGS.header.menu,
      },
      hero: {
        variant: draft.hero?.variant ?? DEFAULT_SETTINGS.hero.variant,
        monolithCount: draft.hero?.monolithCount ?? DEFAULT_SETTINGS.hero.monolithCount,
        showChapterRail: draft.hero?.showChapterRail ?? DEFAULT_SETTINGS.hero.showChapterRail,
      },
      footer: {
        kicker: draft.footer?.kicker ?? DEFAULT_SETTINGS.footer.kicker,
        cta: draft.footer?.cta ?? DEFAULT_SETTINGS.footer.cta,
        wordmarkItalic: draft.footer?.wordmarkItalic ?? DEFAULT_SETTINGS.footer.wordmarkItalic,
      },
      customCss: draft.customCss ?? DEFAULT_SETTINGS.customCss,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Publish design settings to Strapi.
 * Cache revalidation is owned server-side: the `design-settings` single
 * type lifecycles POST to Next.js `/api/revalidate` with the shared secret,
 * which the browser can never hold. No client-side revalidation here.
 */
export async function publishDesignSettings(settings: DesignSettings): Promise<void> {
  const cmsUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_CMS_URL : undefined;
  if (!cmsUrl) return;

  try {
    await fetch(`${cmsUrl}/api/design-settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          colors: settings.colors,
          typography: settings.typography,
          siteIdentity: settings.siteIdentity,
          header: settings.header,
          hero: settings.hero,
          footer: settings.footer,
          customCss: settings.customCss,
        },
      }),
    });
  } catch {
    // Silently fail — the user can retry
  }
}

export { DEFAULT_SETTINGS };
