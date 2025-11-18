'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';

interface NavLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function Navigation() {
  const { isAdmin, accessLevel } = useAdmin();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  const navLinks: NavLink[] = [
    { href: '/gear', label: 'Gear', icon: null },
    { href: '/projects', label: 'Projects', icon: null },
  ];

  // Only show Kenny Kloud for full admin access
  if (isAdmin && accessLevel === 'full') {
    navLinks.push({
      href: '/kenny',
      label: 'Kenny Kloud',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    });
  }

  // Show Vetted Roadmap for both full and vetted access
  if (isAdmin && (accessLevel === 'full' || accessLevel === 'vetted')) {
    navLinks.push({
      href: '/roadmap',
      label: 'Vetted Roadmap',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
    });
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex gap-6">
        {navLinks.map((link) => {
          // Kenny Kloud always gets yellow/amber, regardless of active state
          const isKenny = link.href === '/kenny';
          const isVettedRoadmap = link.href === '/roadmap';
          const linkClasses = isKenny
            ? 'text-amber-600 hover:text-amber-700 font-mono'
            : isVettedRoadmap
              ? (isActive(link.href) ? 'text-purple-600 hover:text-purple-700 font-semibold' : 'text-purple-500 hover:text-purple-600 font-semibold')
              : isActive(link.href)
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-gray-600 hover:text-gray-900';
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors font-medium flex items-center gap-1 ${linkClasses}`}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            // X icon
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-16 right-0 left-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-3">
                {navLinks.map((link) => {
                  // Kenny Kloud always gets yellow/amber, regardless of active state
                  const isKenny = link.href === '/kenny';
                  const isVettedRoadmap = link.href === '/roadmap';
                  const linkClasses = isKenny
                    ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 font-mono'
                    : isVettedRoadmap
                      ? 'bg-purple-50 text-purple-600 hover:bg-purple-100 font-semibold'
                      : isActive(link.href)
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-50';
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${linkClasses}`}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

