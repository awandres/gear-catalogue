'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
  isAdmin: boolean;
  adminKey: string | null;
  accessLevel: 'none' | 'full' | 'vetted';
  enableAdminMode: (key: string) => Promise<boolean>;
  disableAdminMode: () => void;
  activeProjectId: string | null;
  setActiveProjectId: (projectId: string | null) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<'none' | 'full' | 'vetted'>('none');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Check localStorage on mount for persisted admin state and active project (dev only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('gear_catalog_admin_key');
      const storedLevel = localStorage.getItem('gear_catalog_access_level') as 'full' | 'vetted' | null;
      
      if (storedKey) {
        validateAdminKey(storedKey);
      }
      
      const storedProjectId = localStorage.getItem('gear_catalog_active_project');
      if (storedProjectId) {
        setActiveProjectId(storedProjectId);
      }
    }
  }, []);

  // Persist active project to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (activeProjectId) {
        localStorage.setItem('gear_catalog_active_project', activeProjectId);
      } else {
        localStorage.removeItem('gear_catalog_active_project');
      }
    }
  }, [activeProjectId]);

  const validateAdminKey = async (key: string): Promise<boolean> => {
    try {
      // Validate key against server
      const response = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      const { valid, accessLevel: level } = await response.json();
      
      if (valid) {
        setIsAdmin(true);
        setAdminKey(key);
        setAccessLevel(level || 'full');
        localStorage.setItem('gear_catalog_admin_key', key);
        localStorage.setItem('gear_catalog_access_level', level || 'full');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error validating admin key:', error);
      return false;
    }
  };

  const enableAdminMode = async (key: string): Promise<boolean> => {
    return validateAdminKey(key);
  };

  const disableAdminMode = () => {
    setIsAdmin(false);
    setAdminKey(null);
    setAccessLevel('none');
    localStorage.removeItem('gear_catalog_admin_key');
    localStorage.removeItem('gear_catalog_access_level');
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        adminKey,
        accessLevel,
        enableAdminMode,
        disableAdminMode,
        activeProjectId,
        setActiveProjectId,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

// Helper to add admin headers to fetch requests
export function getAdminHeaders(adminKey: string | null): HeadersInit {
  if (!adminKey) return {};
  
  return {
    'x-admin-key': adminKey,
  };
}
