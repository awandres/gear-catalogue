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
      hour: '2-digit', 
      minute: '2-digit'
    }));
  }, []);

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 group cursor-help"
      title={`${gitBranch}@${gitHash}: ${gitMessage}`}
    >
      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded text-[10px] font-mono text-gray-300 hover:bg-opacity-80 transition-all">
        <span className="opacity-60">{gitHash}</span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-max max-w-xs">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700">
          <div className="font-semibold mb-1.5 text-blue-400">{gitBranch}@{gitHash}</div>
          <div className="text-gray-300 mb-2">{gitMessage}</div>
          <div className="text-gray-400 text-[10px] space-y-0.5">
            <div>Built: {gitDate}</div>
            {deployTime && <div>Deployed: {deployTime}</div>}
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-4 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

