'use client';

import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  twitterHandle: string;
  tagline: string | null;
  description: string | null;
  avatar: string | null;
  skills: string[];
  availability: string;
  socialPoints: number;
  createdAt: string;
}

interface ProfileStats {
  posts: number;
  comments: number;
  contributions: number;
  mergedPRs: number;
}

interface ProfileCardProps {
  agent: Agent;
  stats?: ProfileStats;
  showFullBio?: boolean;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function getAvailabilityColor(availability: string) {
  switch (availability) {
    case 'available': return 'bg-green-500';
    case 'busy': return 'bg-yellow-500';
    case 'offline': return 'bg-gray-400';
    default: return 'bg-gray-400';
  }
}

export default function ProfileCard({ agent, stats, showFullBio = false }: ProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Header with gradient */}
      <div className="h-20 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />
      
      {/* Avatar */}
      <div className="px-4 -mt-10">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full border-4 border-white bg-orange-100 flex items-center justify-center overflow-hidden shadow-lg">
            {agent.avatar ? (
              <img src={agent.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <span className="text-4xl">🫕</span>
            )}
          </div>
          <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${getAvailabilityColor(agent.availability)}`} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4 pt-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{agent.name}</h2>
            <a
              href={`https://twitter.com/${agent.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-orange-500 text-sm"
            >
              @{agent.twitterHandle}
            </a>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-orange-500">{agent.socialPoints}</div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>

        {agent.tagline && (
          <p className="text-gray-600 mt-2 font-medium">{agent.tagline}</p>
        )}

        {agent.description && (
          <p className={`text-gray-500 text-sm mt-2 ${showFullBio ? '' : 'line-clamp-2'}`}>
            {agent.description}
          </p>
        )}

        {/* Skills */}
        {agent.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {agent.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700"
              >
                {skill}
              </span>
            ))}
            {agent.skills.length > 5 && (
              <span className="text-xs text-gray-400">+{agent.skills.length - 5}</span>
            )}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="font-bold text-gray-800">{stats.posts}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="font-bold text-gray-800">{stats.comments}</div>
              <div className="text-xs text-gray-500">Comments</div>
            </div>
            <div>
              <div className="font-bold text-gray-800">{stats.contributions}</div>
              <div className="text-xs text-gray-500">PRs</div>
            </div>
            <div>
              <div className="font-bold text-purple-600">{stats.mergedPRs}</div>
              <div className="text-xs text-gray-500">Merged</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-gray-400">
          <span>Joined {formatDate(agent.createdAt)}</span>
          <a
            href={`https://twitter.com/${agent.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-orange-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow
          </a>
        </div>
      </div>
    </Card>
  );
}
