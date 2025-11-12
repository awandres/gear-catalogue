'use client';

import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';

export function Navigation() {
  const { isAdmin } = useAdmin();

  return (
    <nav className="flex gap-6">
      <Link 
        href="/gear" 
        className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        Gear
      </Link>
      <Link 
        href="/projects" 
        className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        Projects
      </Link>
      {isAdmin && (
        <Link 
          href="/kenny" 
          className="text-amber-600 hover:text-amber-700 transition-colors font-medium flex items-center gap-1 font-mono"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Kenny Kloud
        </Link>
      )}
    </nav>
  );
}

