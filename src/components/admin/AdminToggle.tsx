'use client';

import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';

export function AdminToggle() {
  const { isAdmin, enableAdminMode, disableAdminMode } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await enableAdminMode(key);
    
    setLoading(false);
    
    if (success) {
      setShowModal(false);
      setKey('');
    } else {
      setError('Invalid admin key');
    }
  };

  if (isAdmin) {
    return (
      <button
        onClick={disableAdminMode}
        className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
      >
        Exit Admin Mode
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
      >
        Admin Access
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 font-mono">Enter Admin Key</h2>
            
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Admin access key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                autoFocus
              />
              
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              
              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading || !key}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Validating...' : 'Enable Admin Mode'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setKey('');
                    setError('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
