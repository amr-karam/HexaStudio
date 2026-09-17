/**
 * GET /api/odoo/products
 * Fetch all products with pagination and search support
 * Follows same pattern as /api/odoo/customers/route.ts
 */

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const url = new URL(request.url);
    
    const params = new URLSearchParams();
    const page = url.searchParams.get('page');
    const limit = url.searchParams.get('limit');
    const search = url.searchParams.get('search');
    if (limit) params.set('limit', limit);
    if (page) params.set('page', page);
    if (search) params.set('search', search);

    const response = await fetch(`${process.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/v1/odoo/products?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
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
    console.error('Odoo products fetch error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
