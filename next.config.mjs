module.exports = {
  reactStrictMode:true,
  swcMinify:false,
  experimental:{
    externalOutput: {allowSyntaxVariationFromWildcard:true},
    optimizePackageImports:true,
    serverActions:true,
    strictRootHeaders:true,
    turbo: {transpilePackages:["@hexastudio/ui"]},
  },
  async headers() {
    return [ {
      source:"/(projects|blog|about|services|privacy|terms|contact|premium-chat)",
      headers:[{key:"Cache-Control",value:"public, s-maxage=3600, stale-while-revalidate=86400"}] },
      {source:"/:path*",headers:[{key:"Content-Security-Policy",value:"default-src \"self\"; script-src \"self\" https://www.googletagmanager.com https://us.i.posthog.com https://www.gstatic.com https://static.cloudflareinsights.com https://*.cloudflare.com https://*.posthog.com https://api.hexastudio.net wss://*.cloudflare.com data: blob:; style-src \"self\" \"unsafe-inline\" https://fonts.googleapis.com; font-src \"self\" https://fonts.gstatic.com data:; img-src \"self\" data: blob: https:; media-src \"self\" blob: https:; connect-src \"self\" http://api.localhost ws://api.localhood ws://localhost:4000 wss://localhost:4000 https://api.hexastudio.net wss://api.hexastudio.net https://*.hexastudio.net;" }, {key:"X-Content-Type-Options",value:"nosniff"}, {key:"X-Frame-Options",value:"SAMEORIGIN"}, {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=(), xr-spatial-tracking=(self)"}, {key:"Strict-Transport-Security",value:"max-age=63072000; includeSubDomains; preload"}] } ];
  },
  images:{remotePatterns:[{protocol:"https",hostname:"images.unsplash.com"},{protocol:"https",hostname:"*.unsplash.com"},{protocol:"https",hostname:"storage.hexastudio.net"}]},
  async rewrites() {
    return [{source:"/favicon.ico",destination:"/favicon.svg"}] } ;
};
