'use client';

import { Project } from '@/lib/types';

interface ProjectFilterProps {
  projects: Project[];
  selected?: string;
  onChange: (projectId: string | undefined) => void;
}

export function ProjectFilter({ projects, selected, onChange }: ProjectFilterProps) {
  const handleToggle = (projectId: string) => {
    if (selected === projectId) {
      onChange(undefined);
    } else {
      onChange(projectId);
    }
  };

  if (projects.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900">Projects</h3>
      <div className="space-y-2">
        {projects.map((project) => (
          <label key={project.id} className="flex items-center space-x-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={selected === project.id}
              onChange={() => handleToggle(project.id)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <div className="flex items-center gap-2 flex-1">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.primaryColor }}
              />
              <span 
                className="text-sm font-medium transition-colors"
                style={{ color: selected === project.id ? project.primaryColor : undefined }}
              >
                {project.name}
              </span>
              {project.gearLoadout && (
                <span className="text-xs text-gray-500">
                  ({project.gearLoadout.length})
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}




