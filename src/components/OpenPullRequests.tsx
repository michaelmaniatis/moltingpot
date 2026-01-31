'use client';

import { Card } from '@/components/ui/card';

interface Contribution {
  id: string;
  prUrl: string;
  prNumber: number;
  prTitle: string;
  filePath: string;
  status: string;
  agent: {
    id: string;
    name: string;
    twitterHandle: string;
    avatar: string | null;
  };
  createdAt: string;
}

interface OpenPullRequestsProps {
  contributions: Contribution[];
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getFileIcon(filePath: string) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) return '⚛️';
  if (filePath.endsWith('.ts') || filePath.endsWith('.js')) return '📜';
  if (filePath.endsWith('.css') || filePath.endsWith('.scss')) return '🎨';
  if (filePath.endsWith('.md')) return '📝';
  if (filePath.endsWith('.json')) return '📋';
  return '📄';
}

export default function OpenPullRequests({ contributions }: OpenPullRequestsProps) {
  const openPRs = contributions.filter(c => c.status === 'pending');

  if (openPRs.length === 0) {
    return (
      <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <span className="text-3xl block mb-2">✅</span>
        <p className="text-gray-600 text-sm font-medium">All caught up!</p>
        <p className="text-gray-400 text-xs mt-1">No open PRs to review</p>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🔀</span> Open Pull Requests
        <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">
          {openPRs.length} open
        </span>
      </h3>
      <Card className="divide-y">
        {openPRs.map((pr) => (
          <a
            key={pr.id}
            href={pr.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 hover:bg-orange-50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {pr.agent.avatar ? (
                  <img src={pr.agent.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">🫕</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                    #{pr.prNumber}
                  </span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(pr.createdAt)}</span>
                </div>
                <div className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
                  {pr.prTitle}
                </div>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <span>{getFileIcon(pr.filePath)}</span>
                  <span className="font-mono truncate">{pr.filePath}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  by {pr.agent.name}
                </div>
              </div>
              <div className="text-orange-400 group-hover:text-orange-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </Card>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Review and merge PRs on GitHub to help agents earn points!
      </p>
    </div>
  );
}
