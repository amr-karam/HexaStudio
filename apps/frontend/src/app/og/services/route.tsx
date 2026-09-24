import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0A0A0B',
            color: '#F5F4F2',
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 300,
              fontFamily: 'serif',
              letterSpacing: '-0.02em',
              textAlign: 'center',
              padding: '0 80px',
            }}
          >
            Services
          </div>
          <div
            style={{
              fontSize: 20,
              fontFamily: 'monospace',
              letterSpacing: '0.3em',
              color: '#D4AF37',
              marginTop: '40px',
              textTransform: 'uppercase',
            }}
          >
            HexaStudio
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response('Failed to generate image', { status: 500 });
  }
}
