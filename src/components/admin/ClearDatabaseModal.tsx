'use client';

import { useState } from 'react';
import { GearModal } from './gear/GearModal';
import { Card, CardContent } from '@/components/ui/Card';

interface ClearDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: ClearOptions) => void;
}

export interface ClearOptions {
  clearGear: boolean;
  clearProjects: boolean;
  clearImages: boolean;
  clearProjectAssignments: boolean;
}

export function ClearDatabaseModal({ isOpen, onClose, onConfirm }: ClearDatabaseModalProps) {
  const [options, setOptions] = useState<ClearOptions>({
    clearGear: false,
    clearProjects: false,
    clearImages: false,
    clearProjectAssignments: false,
  });

  const handleToggle = (key: keyof ClearOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    const hasSelection = Object.values(options).some(v => v);
    
    if (!hasSelection) {
      alert('Please select at least one option to clear');
      return;
    }

    const confirmMessage = buildConfirmMessage();
    
    if (confirm(`⚠️ WARNING: This action CANNOT be undone!\n\n${confirmMessage}\n\nAre you sure?`)) {
      if (confirm('Final confirmation: Proceed with deletion?')) {
        onConfirm(options);
      }
    }
  };

  const buildConfirmMessage = () => {
    const items = [];
    if (options.clearGear) items.push('All gear items');
    if (options.clearProjects) items.push('All projects');
    if (options.clearImages) items.push('All gear images');
    if (options.clearProjectAssignments) items.push('All project-gear assignments');
    return `You will delete:\n${items.map(i => `- ${i}`).join('\n')}`;
  };

  const selectAll = () => {
    setOptions({
      clearGear: true,
      clearProjects: true,
      clearImages: true,
      clearProjectAssignments: true,
    });
  };

  const deselectAll = () => {
    setOptions({
      clearGear: false,
      clearProjects: false,
      clearImages: false,
      clearProjectAssignments: false,
    });
  };

  return (
    <GearModal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-red-600">Clear Database</h2>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-semibold">⚠️ Warning: This action cannot be undone!</p>
            <p className="text-sm mt-1">Select what you want to delete from the database.</p>
          </div>

          <div className="space-y-4 mb-6">
            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options.clearGear}
                onChange={() => handleToggle('clearGear')}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Clear All Gear</p>
                <p className="text-sm text-gray-600">Delete all gear items from the catalog</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options.clearProjects}
                onChange={() => handleToggle('clearProjects')}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Clear All Projects</p>
                <p className="text-sm text-gray-600">Delete all projects and their loadouts</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options.clearImages}
                onChange={() => handleToggle('clearImages')}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Clear All Images</p>
                <p className="text-sm text-gray-600">Delete all gear images from the database</p>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={options.clearProjectAssignments}
                onChange={() => handleToggle('clearProjectAssignments')}
                className="w-5 h-5 rounded text-red-600 focus:ring-red-500"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Clear Project Assignments</p>
                <p className="text-sm text-gray-600">Remove all gear from projects (keeps gear and projects)</p>
              </div>
            </label>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="flex-1 px-3 py-1.5 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Deselect All
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear Selected
            </button>
          </div>
        </CardContent>
      </Card>
    </GearModal>
  );
}


