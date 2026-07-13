const path = require('path');
process.env.NODE_ENV = 'production';

const strapi = require(path.resolve(__dirname, '../../node_modules/@strapi/strapi'));

const app = strapi.createStrapi({
  appDir: __dirname,
  distDir: path.join(__dirname, 'dist'),
});

app.start();
