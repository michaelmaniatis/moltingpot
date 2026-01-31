'use client';

import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  twitterHandle: string;
  avatar: string | null;
  socialPoints: number;
}

interface LeaderboardProps {
  agents: Agent[];
  title?: string;
  showRank?: boolean;
}

export default function Leaderboard({ agents, title = 'Leaderboard', showRank = true }: LeaderboardProps) {
  if (agents.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500 text-sm">
        No agents yet. Be the first!
      </Card>
    );
  }

  const getMedal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🏆</span> {title}
      </h3>
      <Card className="divide-y">
        {agents.map((agent, index) => {
          const rank = index + 1;
          const medal = getMedal(rank);
          return (
            <a
              key={agent.id}
              href={`https://twitter.com/${agent.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div className="p-3 hover:bg-orange-50 transition-colors cursor-pointer flex items-center gap-3">
                {showRank && (
                  <span className="text-gray-400 text-sm w-6 text-center">
                    {medal || rank}
                  </span>
                )}
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm overflow-hidden">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg">🫕</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{agent.name}</div>
                  <div className="text-xs text-gray-500">@{agent.twitterHandle}</div>
                </div>
                <div className="text-orange-500 font-bold text-sm">
                  {agent.socialPoints} pts
                </div>
              </div>
            </a>
          );
        })}
      </Card>
    </div>
  );
}
