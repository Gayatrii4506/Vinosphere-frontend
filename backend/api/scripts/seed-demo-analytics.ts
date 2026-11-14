import { seedDemoDataset, resetDemoDataset, DEMO_WINERY_ID } from '../src/modules/analytics/demoSeed';

async function main() {
  const arg = process.argv[2];
  if (arg === '--reset') {
    console.log(`Resetting demo dataset for winery: ${DEMO_WINERY_ID}...`);
    await resetDemoDataset();
    console.log('Demo dataset successfully removed.');
  } else {
    console.log(`Seeding synthetic demo dataset for winery: ${DEMO_WINERY_ID}...`);
    await seedDemoDataset();
    console.log('Demo dataset successfully seeded!');
    console.log(`Demo Winery ID: ${DEMO_WINERY_ID}`);
  }
}

main().catch((err) => {
  console.error('Demo dataset seed error:', err);
  process.exit(1);
});
