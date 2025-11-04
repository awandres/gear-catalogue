import { notFound } from 'next/navigation';
import Link from 'next/link';
import { GearDetail } from '@/components/gear/GearDetail';
import { GearItem } from '@/lib/types';

async function getGearItem(id: string): Promise<GearItem | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/gear/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching gear item:', error);
    return null;
  }
}

export default async function GearDetailPage({ params }: { params: { id: string } }) {
  const gear = await getGearItem(params.id);
  
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
