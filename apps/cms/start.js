const path = require('path');
process.env.NODE_ENV = 'production';

const strapi = require('@strapi/strapi');

const app = strapi.createStrapi({
  appDir: __dirname,
  distDir: path.join(__dirname, 'dist'),
});

app.start().then(() => {
  console.log('=== REGISTERED CONTENT TYPES ===');
  Object.keys(app.contentTypes).forEach(ct => console.log(ct));
  console.log('===============================');
}).catch(e => {
  console.error('Startup Error:', e);
});
