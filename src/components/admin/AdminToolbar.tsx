'use client';

import { useAdmin } from '@/contexts/AdminContext';
import { useState, useEffect } from 'react';
import { ClearDatabaseModal, ClearOptions } from './ClearDatabaseModal';
import toast from 'react-hot-toast';

export function AdminToolbar() {
  const { isAdmin } = useAdmin();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [processingImages, setProcessingImages] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      // Check if user has seen the intro this session
      const seenIntro = sessionStorage.getItem('admin_toolbar_intro_seen');
      
      if (!seenIntro) {
        // After 2 seconds, shake and collapse
        const timer = setTimeout(() => {
          setIsShaking(true);
          
          // After shake animation (0.6s), collapse
          setTimeout(() => {
            setIsCollapsed(true);
            setIsShaking(false);
            sessionStorage.setItem('admin_toolbar_intro_seen', 'true');
          }, 600);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        setIsCollapsed(true);
      }
    }
  }, [isAdmin]);

  const handleClearSession = () => {
    if (confirm('Are you sure you want to clear all session data? This will reset the admin toolbar intro and active project selection.')) {
      sessionStorage.clear();
      localStorage.removeItem('gear_catalog_active_project');
      window.location.reload();
    }
  };

  const handleClearDatabase = async (options: ClearOptions) => {
    try {
      const response = await fetch('/api/admin/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': localStorage.getItem('gear_catalog_admin_key') || '',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear database');
      }

      const result = await response.json();
      
      const deletedItems = [];
      if (result.deleted.gear > 0) deletedItems.push(`${result.deleted.gear} gear`);
      if (result.deleted.projects > 0) deletedItems.push(`${result.deleted.projects} projects`);
      if (result.deleted.gearImages > 0) deletedItems.push(`${result.deleted.gearImages} images`);
      
      toast.success(`Database cleared! Deleted: ${deletedItems.join(', ')}`);
      
      setShowClearModal(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clear database');
    }
  };

  const handleProcessImages = async () => {
    if (!confirm('This will fetch images for up to 40 random gear items without images. Continue?')) {
      return;
    }

    setProcessingImages(true);
    try {
      const response = await fetch('/api/admin/process-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': localStorage.getItem('gear_catalog_admin_key') || '',
        },
        body: JSON.stringify({ mode: 'bulk' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process images');
      }

      const result = await response.json();
      
      if (result.skipped) {
        toast.success('All gear items already have images!');
      } else {
        toast.success(`Images fetched! ${result.succeeded} succeeded, ${result.failed} failed`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process images');
    } finally {
      setProcessingImages(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <>
      {/* Mobile: Floating button at bottom-right */}
      <div className="md:hidden">
        {!isCollapsed ? (
          /* Full toolbar overlay on mobile */
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-4" style={{ zIndex: 100000 }} onClick={() => setIsCollapsed(true)}>
            <div className="bg-gray-900 text-white rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Mobile Header */}
              <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold">Admin Mode</span>
                </div>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Content */}
              <div className="p-4 space-y-3">
                <button
                  onClick={() => window.location.href = '/gear?create=true'}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Gear
                </button>

                <button
                  onClick={() => window.location.href = '/projects'}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Projects
                </button>

                <button
                  onClick={() => window.location.href = '/kenny'}
                  className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Upload
                </button>

                <button
                  onClick={handleProcessImages}
                  disabled={processingImages}
                  className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {processingImages ? 'Fetching...' : 'Fetch Images'}
                </button>

                <button
                  onClick={handleClearSession}
                  className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Clear Session
                </button>

                <button
                  onClick={() => setShowClearModal(true)}
                  className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Database
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Floating button on mobile */
          <button
            onClick={() => setIsCollapsed(false)}
            className="fixed bottom-6 right-6 bg-gray-900 hover:bg-gray-800 text-white rounded-full p-4 shadow-2xl transition-all hover:scale-110 flex items-center gap-2"
            style={{ zIndex: 100000 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse absolute top-2 right-2"></div>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        )}
      </div>

      {/* Desktop: Original design */}
      <div className={`hidden md:block fixed top-24 right-6 bg-gray-900 text-white rounded-lg shadow-2xl transition-all duration-300 ${isCollapsed ? 'w-14' : 'w-64'} ${isShaking ? 'animate-shake' : ''}`} style={{ zIndex: 100000 }}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -left-3 top-4 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-2 shadow-lg transition-colors"
          title={isCollapsed ? 'Expand toolbar' : 'Collapse toolbar'}
        >
          <svg 
            className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

      {/* Toolbar Content */}
      <div className={`p-4 space-y-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Admin Mode</span>
        </div>
        
        {/* Stats */}

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => window.location.href = '/gear?create=true'}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Gear
          </button>
          
          <button
            onClick={() => window.location.href = '/projects'}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Projects
          </button>
          
          <button
            onClick={() => window.location.href = '/kenny'}
            className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Bulk Upload
          </button>

          <button
            onClick={handleProcessImages}
            disabled={processingImages}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {processingImages ? 'Fetching...' : 'Fetch Images'}
          </button>

          <button
            onClick={handleClearSession}
            className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear Session
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            className="w-full px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear Database
          </button>
        </div>
        
        {/* Shortcuts */}
        <div className="pt-3 border-t border-gray-700 space-y-1 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded">⌘N</kbd>
            <span>New gear</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-gray-800 rounded">⌘E</kbd>
            <span>Edit mode</span>
          </div>
        </div>
      </div>

      {/* Collapsed State - Icon Only */}
      {isCollapsed && (
        <div className="p-4 flex flex-col items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" title="Admin Mode Active"></div>
          <button
            onClick={() => window.location.href = '/gear?create=true'}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            title="Add Gear"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <button
            onClick={() => window.location.href = '/projects'}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            title="Projects"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          <button
            onClick={() => window.location.href = '/kenny'}
            className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            title="Bulk Upload"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>
          <button
            onClick={handleClearSession}
            className="p-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
            title="Clear Session"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            onClick={() => setShowClearModal(true)}
            className="p-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
            title="Clear Database"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
      </div>
      
      {/* Clear Database Modal - Shared between mobile and desktop */}
      <ClearDatabaseModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearDatabase}
      />
      
      {/* Shake Animation Styles */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-3px); }
          30% { transform: translateX(3px); }
          45% { transform: translateX(-2px); }
          60% { transform: translateX(2px); }
          75% { transform: translateX(-1px); }
          90% { transform: translateX(1px); }
        }
        
        .animate-shake {
          animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>
    </>
  );
}
