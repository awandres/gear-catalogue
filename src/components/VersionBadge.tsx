'use client';

import { useState, useEffect } from 'react';

export function VersionBadge() {
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH || 'dev';
  const gitMessage = process.env.NEXT_PUBLIC_GIT_MESSAGE || 'Development build';
  const gitDate = process.env.NEXT_PUBLIC_GIT_DATE || '';
  const gitBranch = process.env.NEXT_PUBLIC_GIT_BRANCH || 'main';
  const [deployTime, setDeployTime] = useState<string>('');

  useEffect(() => {
    // Get deployment time from build (shows when page was deployed/loaded)
    const now = new Date();
    setDeployTime(now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit'
    }));
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 group cursor-help"
      title={`Version ${gitHash} - Deployed ${deployTime}`}
    >
      {/* Main badge - shows deployment time */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-md text-[15px] font-mono text-gray-200 hover:bg-opacity-90 transition-all shadow-lg">
        <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="opacity-90">{deployTime || 'Loading...'}</span>
      </div>
      
      {/* Tooltip on hover - detailed version info */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-max max-w-sm">
        <div className="bg-gray-900 text-white text-base rounded-lg p-5 shadow-xl border border-gray-700">
          <div className="font-semibold mb-2.5 text-blue-400 text-xl">v{gitHash}</div>
          <div className="text-gray-200 mb-3 leading-relaxed text-[15px]">{gitMessage}</div>
          <div className="text-gray-400 text-sm space-y-1.5 border-t border-gray-700 pt-2.5">
            <div className="flex justify-between gap-6">
              <span className="opacity-70">Branch:</span>
              <span className="font-mono">{gitBranch}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="opacity-70">Built:</span>
              <span>{gitDate}</span>
            </div>
            {deployTime && (
              <div className="flex justify-between gap-6">
                <span className="opacity-70">Deployed:</span>
                <span>{deployTime}</span>
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-4 -mt-1">
            <div className="border-[5px] border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

