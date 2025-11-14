import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Helper function to convert our mock data format to Prisma format
export function toPrismaGear(gear: any) {
  return {
    ...gear,
    status: gear.status.replace('-', '_'), // Convert 'in-use' to 'in_use'
    soundCharacteristics: JSON.stringify(gear.soundCharacteristics),
    parameters: gear.parameters ? JSON.stringify(gear.parameters) : null,
    specifications: gear.specifications ? JSON.stringify(gear.specifications) : null,
    usage: gear.usage ? JSON.stringify(gear.usage) : null,
    media: gear.media ? JSON.stringify(gear.media) : null,
    connections: gear.connections ? JSON.stringify(gear.connections) : null,
    dateAdded: gear.dateAdded ? new Date(gear.dateAdded) : null,
    lastUsed: gear.lastUsed ? new Date(gear.lastUsed) : null,
  };
}

// Helper function to convert Prisma format back to our app format
export function fromPrismaGear(gear: any) {
  return {
    ...gear,
    status: gear.status.replace('_', '-'), // Convert 'in_use' back to 'in-use'
    soundCharacteristics: typeof gear.soundCharacteristics === 'string' 
      ? JSON.parse(gear.soundCharacteristics) 
      : gear.soundCharacteristics,
    parameters: gear.parameters 
      ? (typeof gear.parameters === 'string' ? JSON.parse(gear.parameters) : gear.parameters)
      : undefined,
    specifications: gear.specifications 
      ? (typeof gear.specifications === 'string' ? JSON.parse(gear.specifications) : gear.specifications)
      : undefined,
    usage: gear.usage 
      ? (typeof gear.usage === 'string' ? JSON.parse(gear.usage) : gear.usage)
      : undefined,
    media: gear.media 
      ? (typeof gear.media === 'string' ? JSON.parse(gear.media) : gear.media)
      : undefined,
    connections: gear.connections 
      ? (typeof gear.connections === 'string' ? JSON.parse(gear.connections) : gear.connections)
      : undefined,
    dateAdded: gear.dateAdded ? gear.dateAdded.toISOString().split('T')[0] : undefined,
    lastUsed: gear.lastUsed ? gear.lastUsed.toISOString().split('T')[0] : undefined,
  };
}
