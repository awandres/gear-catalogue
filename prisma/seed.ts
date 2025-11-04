import { PrismaClient } from '@prisma/client';
import { mockGearData } from '../src/data/mock-gear';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.gear.deleteMany();
  console.log('Cleared existing gear data');

  // Insert mock data with minimal fields
  for (const item of mockGearData) {
    const gear = await prisma.gear.create({
      data: {
        id: item.id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        subcategory: item.subcategory,
        description: item.description,
        soundCharacteristics: JSON.parse(JSON.stringify(item.soundCharacteristics)),
        tags: item.tags,
        status: item.status.replace('-', '_') as any, // Convert 'in-use' to 'in_use' for enum
        notes: item.notes || null,
        dateAdded: item.dateAdded ? new Date(item.dateAdded) : null,
        lastUsed: item.lastUsed ? new Date(item.lastUsed) : null,
      },
    });
    console.log(`Created gear: ${gear.name}`);
  }

  console.log(`✅ Seeded ${mockGearData.length} gear items`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e);
    await prisma.$disconnect();
    process.exit(1);
  });