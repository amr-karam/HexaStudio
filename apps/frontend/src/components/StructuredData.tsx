import { sanitizeJsonLd } from "@/lib/jsonld";

export function StructuredData() {
  const baseUrl = "https://hexastudio.net";

  // Organization schema
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HexaStudio",
    alternateName: "HEXA STUDIO",
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    sameAs: [
      "https://instagram.com/hexastudio",
      "https://linkedin.com/company/hexastudio",
    ],
    description:
      "Living Spaces. Visualized. Immersive 3D architectural experiences and spatial intelligence for the world's most ambitious projects.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "Cairo",
    },
    areaServed: "Worldwide",
    foundingDate: "2024",
    knowsAbout: [
      "Architectural Visualization",
      "Real-Time 3D",
      "Cinematic Animation",
      "Spatial Computing",
      "Design Technology",
    ],
  };

  // Website schema
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HexaStudio",
    alternateName: "HEXA STUDIO",
    url: baseUrl,
    description:
      "Premium 3D architectural visualization studio. Photoreal, cinematic renders of living spaces that have not yet been built.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@id": `${baseUrl}#organization`,
    },
  };

  // ProfessionalService schema (main service offering)
  const professionalService = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${baseUrl}#professional-service`,
    name: "HexaStudio Architectural Visualization",
    description:
      "Immersive 3D architectural experiences and spatial intelligence for ambitious projects worldwide.",
    provider: {
      "@id": `${baseUrl}#organization`,
    },
    serviceType: [
      "Architectural Visualization",
      "Real-Time 3D Experiences",
      "Cinematic Animation",
      "Visual Consulting",
    ],
    areaServed: "Worldwide",
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${baseUrl}/contact`,
      servicePhone: "+20-2-XXXX-XXXX",
      availableLanguage: "English",
    },
    priceRange: "$$$",
  };

  // Homepage-specific schema (for the landing page)
  const homepage = {
    "@context": "https://schema.org",
    "@type": ["WebPage", "LandingPage"],
    "@id": `${baseUrl}#webpage`,
    url: baseUrl,
    name: "HEXA STUDIO — Living Spaces Visualized",
    description:
      "Premium 3D architectural visualization studio. Photoreal, cinematic renders of living spaces that have not yet been built. Silent luxury design system with artisan glassmorphism.",
    isPartOf: {
      "@id": `${baseUrl}#website`,
    },
    about: {
      "@id": `${baseUrl}#professional-service`,
    },
    publisher: {
      "@id": `${baseUrl}#organization`,
    },
    mainEntity: {
      "@id": `${baseUrl}#professional-service`,
    },
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(professionalService) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: sanitizeJsonLd(homepage) }}
      />
    </>
  );
}
