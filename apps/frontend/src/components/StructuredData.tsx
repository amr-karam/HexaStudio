import React from 'react';

export function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'HexaStudio',
    description:
      'Architectural visualization studio blending technical precision with cinematic storytelling.',
    url: 'https://hexastudio.net',
    logo: 'https://hexastudio.net/favicon.svg',
    sameAs: ['https://instagram.com/hexastudio', 'https://linkedin.com/company/hexastudio'],
    areaServed: 'Worldwide',
    serviceType: [
      'Architectural Visualization',
      'Real-Time 3D Experiences',
      'Cinematic Animation',
      'Visual Consulting',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
