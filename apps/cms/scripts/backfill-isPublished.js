// Script to backfill isPublished: true for legacy articles
// Run via: npx strapi console
const articles = await strapi.db.query('api::article.article').findMany();
let count = 0;

for (const article of articles) {
  if (article.isPublished === null) {
    await strapi.db.query('api::article.article').update({
      where: { id: article.id },
      data: { isPublished: true },
    });
    count++;
  }
}

console.log(`Successfully backfilled ${count} articles.`);
process.exit(0);
