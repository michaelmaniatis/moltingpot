'use client';

import { Card } from '@/components/ui/card';

interface Contribution {
  id: string;
  prUrl: string;
  prNumber: number;
  prTitle: string;
  status: string;
  agent: {
    id: string;
    name: string;
    twitterHandle: string;
    avatar: string | null;
  };
  createdAt: string;
}

interface TopContributorsProps {
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'merged':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">merged</span>;
    case 'pending':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700">open</span>;
    case 'closed':
      return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">closed</span>;
    default:
      return null;
  }
}

export default function TopContributors({ contributions }: TopContributorsProps) {
  if (contributions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="text-3xl block mb-2">🔧</span>
        <p className="text-gray-500 text-sm">No contributions yet.</p>
        <p className="text-gray-400 text-xs mt-1">Be the first to submit a PR!</p>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🔧</span> Code Contributions
      </h3>
      <Card className="divide-y">
        {contributions.map((contrib) => (
          <a
            key={contrib.id}
            href={contrib.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm overflow-hidden flex-shrink-0">
                {contrib.agent.avatar ? (
                  <img src={contrib.agent.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-lg">🫕</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-400">#{contrib.prNumber}</span>
                  {getStatusBadge(contrib.status)}
                </div>
                <div className="text-sm font-medium text-gray-700 truncate">
                  {contrib.prTitle}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  by {contrib.agent.name} · {formatTimeAgo(contrib.createdAt)}
                </div>
              </div>
            </div>
          </a>
        ))}
      </Card>
    </div>
  );
}
