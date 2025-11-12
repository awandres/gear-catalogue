'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { GearItem, Project } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { useGearImage } from '@/hooks/useGearImage';
import { ImageSelector } from './ImageSelector';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';
import toast from 'react-hot-toast';

interface GearDetailProps {
  gear: GearItem;
}

export function GearDetail({ gear }: GearDetailProps) {
  const { isAdmin, adminKey } = useAdmin();
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [gearProjects, setGearProjects] = useState(gear.projectGear || []);
  
  const { imageUrl: mainImage, isLoading } = useGearImage({
    id: gear.id,
    name: gear.name,
    brand: gear.brand,
    existingImageUrl: currentImageUrl || gear.media?.photos?.[0]
  });

  useEffect(() => {
    if (isAdmin) {
      fetchProjects();
    }
  }, [isAdmin]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects?limit=10&status=PLANNING,CONFIRMED,IN_SESSION');
      const data = await response.json();
      setAvailableProjects(data.items || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setCurrentImageUrl(newImageUrl);
  };

  const isInProject = (projectId: string) => {
    return gearProjects.some(pg => pg.project.id === projectId);
  };

  const handleToggleProject = async (project: Project) => {
    const inProject = isInProject(project.id);
    const toastId = toast.loading(inProject ? 'Removing from project...' : 'Adding to project...');

    try {
      if (inProject) {
        // Remove from project
        const response = await fetch(`/api/projects/${project.id}/gear/${gear.id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(adminKey),
        });

        if (!response.ok) throw new Error('Failed to remove from project');

        toast.success(`Removed from ${project.name}`, { id: toastId });
        // Update local state
        setGearProjects(prev => prev.filter(pg => pg.project.id !== project.id));
      } else {
        // Add to project
        const response = await fetch(`/api/projects/${project.id}/gear`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAdminHeaders(adminKey),
          },
          body: JSON.stringify({ gearId: gear.id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add to project');
        }

        toast.success(`Added to ${project.name}`, { id: toastId });
        // Update local state
        setGearProjects(prev => [...prev, {
          id: '',
          projectId: project.id,
          gearId: gear.id,
          project: {
            id: project.id,
            name: project.name,
            primaryColor: project.primaryColor,
            status: project.status,
          }
        } as any]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update project', { id: toastId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="p-6">
            <div className="aspect-w-4 aspect-h-3 mb-4 relative">
              <ImageSelector 
                gear={gear} 
                currentImage={mainImage} 
                onImageUpdate={handleImageUpdate} 
              />
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
                  className="object-contain rounded-lg w-full h-[400px] bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-gear.svg';
                  }}
                  unoptimized={mainImage.startsWith('http')}
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
                    unoptimized={photo.startsWith('http')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="p-6 space-y-6">
            <div>
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{gear.name}</h1>
                <p className="text-xl text-gray-600">{gear.brand}</p>
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

            {/* Projects Management */}
            {isAdmin && availableProjects.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Projects</h3>
                <div className="flex flex-wrap gap-2">
                  {availableProjects.map((project) => {
                    const inProject = isInProject(project.id);
                    return (
                      <button
                        key={project.id}
                        onClick={() => handleToggleProject(project)}
                        className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border-2 font-medium transition-all hover:shadow-md"
                        style={{ 
                          backgroundColor: inProject ? project.primaryColor : 'white',
                          color: inProject ? 'white' : project.primaryColor,
                          borderColor: project.primaryColor
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          {inProject ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          )}
                        </svg>
                        {project.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Associated Projects (Non-Admin View) */}
            {!isAdmin && gearProjects.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Used in Projects</h3>
                <div className="flex flex-wrap gap-2">
                  {gearProjects.map(({ project }) => (
                    <Badge 
                      key={project.id} 
                      className="text-sm px-3 py-1.5 border-2 font-medium"
                      style={{ 
                        backgroundColor: `${project.primaryColor}20`,
                        color: project.primaryColor,
                        borderColor: project.primaryColor
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: project.primaryColor }}
                        />
                        {project.name}
                      </div>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

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
