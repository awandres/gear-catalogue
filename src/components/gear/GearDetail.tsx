'use client';

import Image from 'next/image';
import { GearItem } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useGearImage } from '@/hooks/useGearImage';

interface GearDetailProps {
  gear: GearItem;
}

export function GearDetail({ gear }: GearDetailProps) {
  const { imageUrl: mainImage, isLoading } = useGearImage({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    existingImageUrl: gear.media?.photos?.[0]
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="p-6">
            <div className="aspect-w-4 aspect-h-3 mb-4">
              {isLoading ? (
                <div className="w-full h-[400px] flex items-center justify-center bg-gray-200 animate-pulse rounded-lg">
                  <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              ) : (
                <Image
                  src={mainImage}
                  alt={gear.name}
                  width={600}
                  height={450}
                  className="object-cover rounded-lg w-full h-[400px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-gear.svg';
                  }}
                />
              )}
            </div>
            {gear.media?.photos && gear.media.photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {gear.media.photos.slice(1, 5).map((photo, idx) => (
                  <Image
                    key={idx}
                    src={photo}
                    alt={`${gear.name} ${idx + 2}`}
                    width={150}
                    height={100}
                    className="object-cover rounded cursor-pointer hover:opacity-80 transition"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-gear.svg';
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{gear.name}</h1>
                  <p className="text-xl text-gray-600">{gear.brand}</p>
                </div>
                <StatusBadge status={gear.status} className="text-sm" />
              </div>
              
              <p className="text-gray-700">{gear.description}</p>
            </div>

            {/* Sound Characteristics */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Sound Characteristics</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Tone: </span>
                  {gear.soundCharacteristics.tone.map((tone) => (
                    <Badge key={tone} variant="secondary" className="mr-1">
                      {tone}
                    </Badge>
                  ))}
                </div>
                <div>
                  <span className="text-sm text-gray-600">Qualities: </span>
                  {gear.soundCharacteristics.qualities.map((quality) => (
                    <Badge key={quality} variant="secondary" className="mr-1">
                      {quality}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {gear.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-600 space-y-1">
              {gear.dateAdded && (
                <p>Added: {new Date(gear.dateAdded).toLocaleDateString()}</p>
              )}
              {gear.lastUsed && (
                <p>Last Used: {new Date(gear.lastUsed).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        {gear.parameters && gear.parameters.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <h2 className="text-xl font-semibold">Parameters & Controls</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gear.parameters.map((param, idx) => (
                  <div key={idx} className="border-b border-gray-200 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{param.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {param.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{param.range}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specifications */}
        {gear.specifications && Object.keys(gear.specifications).length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Specifications</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2">
                {Object.entries(gear.specifications).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <dt className="font-medium text-gray-600 capitalize">
                      {key.replace(/-/g, ' ')}:
                    </dt>
                    <dd className="text-gray-900">
                      {typeof value === 'object' 
                        ? JSON.stringify(value) 
                        : String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Usage History */}
      {gear.usage && gear.usage.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Usage History</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gear.usage.map((use, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{use.songTitle}</h3>
                      <p className="text-sm text-gray-600">{use.artist}</p>
                    </div>
                    <span className="text-sm text-gray-500">{use.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{use.context}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Gear */}
      {gear.connections?.pairedWith && gear.connections.pairedWith.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Frequently Paired With</h2>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gear.connections.pairedWith.map((id) => (
                <Badge key={id} variant="secondary">
                  {id}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {gear.notes && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Notes</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{gear.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Media */}
      {gear.media && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Media & Resources</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {gear.media.demoAudio && (
              <div>
                <h3 className="font-medium mb-2">Demo Audio</h3>
                <audio controls className="w-full">
                  <source src={gear.media.demoAudio} type="audio/wav" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
            
            {gear.media.demoVideo && (
              <div>
                <h3 className="font-medium mb-2">Demo Video</h3>
                <a 
                  href={gear.media.demoVideo} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Watch on YouTube →
                </a>
              </div>
            )}
            
            {gear.media.manualPdf && (
              <div>
                <h3 className="font-medium mb-2">Manual</h3>
                <a 
                  href={gear.media.manualPdf} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download PDF Manual →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
