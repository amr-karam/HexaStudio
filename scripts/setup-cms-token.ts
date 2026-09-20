/**
 * Strapi CMS API Token Setup Script.
 *
 * Creates a full-access API token via the Strapi admin panel REST API.
 * Requires Strapi admin credentials (email + password).
 *
 * Usage:
 *   npx tsx scripts/setup-cms-token.ts --admin-email admin@example.com --admin-password mypassword --name "HexaStudio API Token"
 *
 * Environment variables:
 *   STRAPI_URL         - Strapi base URL (default: http://localhost:1337)
 *   STRAPI_ADMIN_EMAIL - Admin email (fallback for --admin-email)
 *   STRAPI_ADMIN_PASSWORD - Admin password (fallback for --admin-password)
 *   TOKEN_NAME         - Token display name (default: "HexaStudio API Token")
 *
 * Output:
 *   Prints the generated API token to stdout. Set it as CMS_API_TOKEN in .env.
 */

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337';

const args = process.argv.slice(2);
const emailFlag = args.indexOf('--admin-email');
const passwordFlag = args.indexOf('--admin-password');
const nameFlag = args.indexOf('--name');

const adminEmail = emailFlag >= 0 ? args[emailFlag + 1] : (process.env.STRAPI_ADMIN_EMAIL ?? '');
const adminPassword = passwordFlag >= 0 ? args[passwordFlag + 1] : (process.env.STRAPI_ADMIN_PASSWORD ?? '');
const tokenName = nameFlag >= 0 ? args[nameFlag + 1] : (process.env.TOKEN_NAME ?? 'HexaStudio API Token');

if (!adminEmail || !adminPassword) {
  console.error('❌ Admin credentials required. Set STRAPI_ADMIN_EMAIL/STRAPI_ADMIN_PASSWORD or pass --admin-email/--admin-password');
  process.exit(1);
}

async function main() {
  console.log(`🔑 Logging into Strapi admin at ${STRAPI_URL}...`);

  const loginRes = await fetch(`${STRAPI_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    console.error(`❌ Login failed (${loginRes.status}): ${text}`);
    process.exit(1);
  }

  const { data } = await loginRes.json();
  const jwt = data.token;

  console.log('✅ Admin login successful. Creating API token...');

  const tokenRes = await fetch(`${STRAPI_URL}/api/admin/api-tokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      name: tokenName,
      description: 'Auto-generated API token for backend CMS access',
      type: 'full-access',
      lifespan: null,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error(`❌ Token creation failed (${tokenRes.status}): ${text}`);
    process.exit(1);
  }

  const tokenData = await tokenRes.json();

  console.log('\n✅ API token created successfully!');
  console.log(`   Name: ${tokenData.name ?? tokenName}`);
  console.log(`   ID:   ${tokenData.id}`);
  console.log(`   Token: ${tokenData.access_key ?? '(see below)'}\n`);
  console.log('='.repeat(60));
  console.log(`Add this to your .env file:\n`);
  console.log(`CMS_API_TOKEN=${tokenData.access_key}`);
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
