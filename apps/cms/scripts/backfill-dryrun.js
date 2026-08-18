// Dry-run simulation for backfill
// Run via: npx strapi console
const articles = await strapi.db.query('api::article.article').findMany();
let count = 0;

console.log("--- DRY RUN: Backfill isPublished ---");
for (const article of articles) {
  if (article.isPublished === null) {
    console.log(`[SIMULATE] Would update Article ID ${article.id}: Set isPublished = true`);
    count++;
  }
}

console.log(`--- SIMULATION COMPLETE ---`);
console.log(`Articles to update: ${count}`);
process.exit(0);
