import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GearDetail } from '@/components/gear/GearDetail';
import { GearItem } from '@/lib/types';
import { prisma } from '@/lib/db';

async function getGearItem(id: string): Promise<GearItem | null> {
  try {
    const gear = await prisma.gear.findUnique({
      where: { id },
      include: {
        projectGear: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                primaryColor: true,
                status: true,
              }
            }
          }
        }
      }
    });
    
    if (!gear) {
      return null;
    }
    
    // Transform the data to match GearItem type
    const gearItem: GearItem = {
      id: gear.id,
      name: gear.name,
      brand: gear.brand,
      category: gear.category,
      subcategory: gear.subcategory,
      description: gear.description,
      soundCharacteristics: gear.soundCharacteristics as any,
      tags: gear.tags,
      parameters: gear.parameters as any,
      specifications: gear.specifications as any,
      usage: gear.usage as any,
      media: gear.media as any,
      connections: gear.connections as any,
      notes: gear.notes || undefined,
      dateAdded: gear.dateAdded?.toISOString().split('T')[0],
      lastUsed: gear.lastUsed?.toISOString().split('T')[0],
      projectGear: gear.projectGear as any,
    };
    
    return gearItem;
  } catch (error) {
    console.error('Error fetching gear item:', error);
    return null;
  }
}

export default async function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gear = await getGearItem(id);
  
  if (!gear) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/gear" className="text-blue-600 hover:underline">
                Gear Catalog
              </Link>
            </li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-700 capitalize">{gear.category}</li>
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">{gear.name}</li>
          </ol>
        </nav>

        <GearDetail gear={gear} />
      </div>
    </div>
  );
}
