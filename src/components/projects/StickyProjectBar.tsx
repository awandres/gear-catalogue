'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Project } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { getCategoryColor } from '@/lib/categoryColors';
import { getContrastTextColor } from '@/lib/colorUtils';

interface StickyProjectBarProps {
  projects: Project[];
  activeProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
  activeProject: Project | null;
  triggerElementId?: string; // ID of element to watch for scrolling past
  onRemoveGear?: (projectId: string, gearId: string) => void;
  onClearLoadout?: (projectId: string) => void;
}

export function StickyProjectBar({ 
  projects, 
  activeProjectId, 
  onProjectSelect,
  activeProject,
  triggerElementId = 'static-project-selector',
  onRemoveGear,
  onClearLoadout
}: StickyProjectBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const triggerElement = document.getElementById(triggerElementId);
      if (triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        // Show sticky bar when static element's bottom scrolls past the top of viewport
        setIsVisible(rect.bottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [triggerElementId]);

  // Collapse expanded project when active project changes
  useEffect(() => {
    setExpandedProjectId(null);
  }, [activeProjectId]);

  const toggleExpanded = (projectId: string) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  if (projects.length === 0) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 shadow-lg transition-all duration-200 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`} style={{ zIndex: isVisible ? 99999 : 0 }}>
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-75">
              Active Project:
            </span>
            
            <div className="flex items-center gap-2 flex-1 ml-4">
              <button
                onClick={() => onProjectSelect(null)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${!activeProjectId
                    ? 'bg-white text-blue-900'
                    : 'bg-blue-800 text-white hover:bg-blue-700'
                  }
                `}
              >
                None
              </button>
              
              {projects.map(project => {
                const isActive = activeProjectId === project.id;
                const isExpanded = expandedProjectId === project.id;
                
                return (
                  <div key={project.id} className="relative">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onProjectSelect(project.id)}
                        className={`
                          px-3 py-1.5 rounded-l-full text-xs font-medium transition-all border-2
                          ${isActive
                            ? 'shadow-lg'
                            : 'bg-gray-100 hover:bg-gray-200'
                          }
                        `}
                        style={
                          isActive 
                            ? { 
                                backgroundColor: project.primaryColor, 
                                borderColor: project.primaryColor,
                                color: getContrastTextColor(project.primaryColor)
                              } 
                            : { color: project.primaryColor, borderColor: project.primaryColor }
                        }
                      >
                        {project.name}
                        {project.gearLoadout && (
                          <span className="ml-1 opacity-75">
                            ({project.gearLoadout.length} items)
                          </span>
                        )}
                      </button>
                      
                      {project.gearLoadout && project.gearLoadout.length > 0 && (
                        <button
                          onClick={() => toggleExpanded(project.id)}
                          className={`
                            px-2 py-1.5 rounded-r-full text-xs transition-all border-2 border-l-0
                            ${isActive
                              ? 'shadow-lg'
                              : 'bg-gray-100 hover:bg-gray-200'
                            }
                          `}
                          style={
                            isActive 
                              ? { 
                                  backgroundColor: project.primaryColor, 
                                  borderColor: project.primaryColor,
                                  color: getContrastTextColor(project.primaryColor)
                                } 
                              : { color: project.primaryColor, borderColor: project.primaryColor }
                          }
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          <svg 
                            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <Link 
              href="/projects" 
              className="text-xs text-blue-200 hover:text-white transition-colors ml-4"
            >
              View All →
            </Link>
          </div>

          {/* Expandable Gear Lists */}
          {projects.map(project => {
            if (expandedProjectId !== project.id || !project.gearLoadout) return null;
            
            return (
              <div 
                key={`expanded-${project.id}`}
                className="border-t py-3 animate-slideDown"
                style={{ 
                  borderColor: project.primaryColor,
                  backgroundColor: `${project.primaryColor}15` // 15 = ~8% opacity
                }}
              >
                {onClearLoadout && project.gearLoadout && project.gearLoadout.length > 0 && (
                  <div className="mb-2 flex justify-end">
                    <button
                      onClick={() => onClearLoadout(project.id)}
                      className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {project.gearLoadout.filter(item => item.gear).map(({ gear }) => {
                    if (!gear) return null;
                    return (
                      <div
                        key={gear.id}
                        className="bg-white bg-opacity-90 p-2 rounded text-xs hover:bg-opacity-100 transition-colors relative group border"
                        style={{ borderColor: `${project.primaryColor}40` }}
                      >
                        {/* Category Badge - Upper Right */}
                        <div 
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold shadow-sm z-20"
                          style={{ 
                            backgroundColor: getCategoryColor(gear.category),
                            color: 'white'
                          }}
                        >
                          {gear.category}
                        </div>

                        {onRemoveGear && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveGear(project.id, gear.id);
                            }}
                            className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-30"
                            title="Remove from project"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                        <p className="font-medium truncate text-gray-900 pr-16">{gear.name}</p>
                        <p className="text-gray-500 text-[10px] truncate">{gear.brand}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

