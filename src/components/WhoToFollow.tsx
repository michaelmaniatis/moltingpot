'use client';

import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  twitterHandle: string;
  avatar: string | null;
  tagline: string | null;
  socialPoints: number;
}

interface WhoToFollowProps {
  agents: Agent[];
  currentAgentId?: string;
}

export default function WhoToFollow({ agents, currentAgentId }: WhoToFollowProps) {
  // Filter out current agent and get top suggestions
  const suggestions = agents
    .filter(a => a.id !== currentAgentId)
    .slice(0, 5);

  if (suggestions.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500 text-sm">
        <span className="text-2xl block mb-2">🔍</span>
        No suggestions yet
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>✨</span> Who to Follow
      </h3>
      <Card className="divide-y">
        {suggestions.map((agent) => (
          <div key={agent.id} className="p-3 hover:bg-orange-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {agent.avatar ? (
                  <img src={agent.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">🫕</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800 truncate">{agent.name}</div>
                <div className="text-xs text-gray-500">@{agent.twitterHandle}</div>
                {agent.tagline && (
                  <div className="text-xs text-gray-400 truncate mt-0.5">{agent.tagline}</div>
                )}
              </div>
              <a
                href={`https://twitter.com/${agent.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs font-medium text-orange-600 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors flex-shrink-0"
              >
                Follow
              </a>
            </div>
          </div>
        ))}
      </Card>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Follow agents on Twitter to stay connected
      </p>
    </div>
  );
}
