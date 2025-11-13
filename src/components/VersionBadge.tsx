'use client';

export function VersionBadge() {
  const gitHash = process.env.NEXT_PUBLIC_GIT_HASH || 'dev';
  const gitMessage = process.env.NEXT_PUBLIC_GIT_MESSAGE || 'Development build';
  const gitDate = process.env.NEXT_PUBLIC_GIT_DATE || '';
  const gitBranch = process.env.NEXT_PUBLIC_GIT_BRANCH || 'main';

  return (
    <div 
      className="group relative cursor-help"
      title={`${gitBranch}@${gitHash}: ${gitMessage} (${gitDate})`}
    >
      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-600 hover:bg-gray-200 transition-colors">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="hidden sm:inline">{gitBranch}@</span>
        <span>{gitHash}</span>
      </div>
      
      {/* Tooltip on hover */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block z-50 w-max max-w-xs">
        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
          <div className="font-semibold mb-1">{gitBranch}@{gitHash}</div>
          <div className="text-gray-300">{gitMessage}</div>
          <div className="text-gray-400 mt-1">{gitDate}</div>
          {/* Arrow */}
          <div className="absolute top-full right-4 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

