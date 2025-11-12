'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { GearModal } from '@/components/admin/gear/GearModal';
import { ConfirmModal } from '@/components/admin/gear/ConfirmModal';
import { useAdmin, getAdminHeaders } from '@/contexts/AdminContext';

export default function ProjectsPage() {
  const { isAdmin, adminKey } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to load projects');
      const data = await response.json();
      setProjects(data.items || data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (data: Partial<Project>) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create project');
      
      setShowCreateModal(false);
      await loadProjects();
    } catch (err) {
      throw err;
    }
  };

  const handleEditProject = async (data: Partial<Project>) => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAdminHeaders(adminKey),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      setShowEditModal(false);
      setSelectedProject(null);
      await loadProjects();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: 'DELETE',
        headers: getAdminHeaders(adminKey),
      });

      if (!response.ok) throw new Error('Failed to delete project');
      
      setShowDeleteModal(false);
      setSelectedProject(null);
      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Mobile: Stack vertically, Desktop: Side by side */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage recording sessions and gear loadouts</p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 md:flex-shrink-0 w-full md:w-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <ProjectList
        projects={projects}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {/* Create Project Modal */}
      <GearModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      >
        <ProjectForm
          onSubmit={handleCreateProject}
          onCancel={() => setShowCreateModal(false)}
        />
      </GearModal>

      {/* Edit Project Modal */}
      <GearModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      >
        <ProjectForm
          project={selectedProject || undefined}
          onSubmit={handleEditProject}
          onCancel={() => setShowEditModal(false)}
        />
      </GearModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Project"
        message={selectedProject ? `Are you sure you want to delete "${selectedProject.name}"? This will remove all gear selections for this project.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteProject}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}
