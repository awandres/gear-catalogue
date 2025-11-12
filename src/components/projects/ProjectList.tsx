'use client';

import { Project } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';

interface ProjectListProps {
  projects: Project[];
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

const statusStyles: Record<string, { bgColor: string; textColor: string }> = {
  PLANNING: { bgColor: '#fef3c7', textColor: '#92400e' }, // yellow-100 bg, yellow-900 text
  CONFIRMED: { bgColor: '#d1fae5', textColor: '#14532d' }, // green-100 bg, green-900 text
  IN_SESSION: { bgColor: '#dbeafe', textColor: '#1e3a8a' }, // blue-100 bg, blue-900 text
  COMPLETED: { bgColor: '#f3f4f6', textColor: '#1f2937' }, // gray-100 bg, gray-800 text
  ARCHIVED: { bgColor: '#e5e7eb', textColor: '#374151' }, // gray-200 bg, gray-700 text
};

export function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      {projects.map((project) => (
        <div 
          key={project.id}
          className="border-l-4 rounded-lg overflow-hidden"
          style={{ borderLeftColor: project.primaryColor }}
        >
          <Card
            className="hover:shadow-lg transition-shadow cursor-pointer shadow-none"
            onClick={() => handleProjectClick(project.id)}
          >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.primaryColor }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1 ml-5">{project.clientName}</p>
              </div>
              <Badge 
                className="px-3 py-1"
                style={{
                  backgroundColor: statusStyles[project.status]?.bgColor || '#f3f4f6',
                  color: statusStyles[project.status]?.textColor || '#1f2937'
                }}
              >
                {project.status.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                ).join(' ')}
              </Badge>
            </div>

            {project.description && (
              <p className="text-sm text-gray-700 mb-4 line-clamp-2">{project.description}</p>
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-500">
                {project.startDate && (
                  <span>
                    {new Date(project.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {project.endDate && ' - '}
                  </span>
                )}
                {project.endDate && (
                  <span>
                    {new Date(project.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {project.gearLoadout && (
                  <span className="text-gray-600">
                    {project.gearLoadout.length} items
                  </span>
                )}

                {(onEdit || onDelete) && (
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(project);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Edit project"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(project);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete project"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
        </div>
      ))}
    </div>
  );
}
