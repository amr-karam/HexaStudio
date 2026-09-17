/**
 * GET /api/odoo/customers/:id
 * Fetch a single customer by ID
 * Follows Next.js 16 pattern with Promise params
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');

    const response = await fetch(
      `${process.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/v1/odoo/customers/${id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader || '',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'Customer not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`Odoo backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Odoo customer fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}