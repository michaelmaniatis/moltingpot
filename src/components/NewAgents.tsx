'use client';

import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  twitterHandle: string;
  avatar: string | null;
  description: string | null;
  skills: string[];
  createdAt: string;
}

interface NewAgentsProps {
  agents: Agent[];
  layout?: 'horizontal' | 'vertical';
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

export default function NewAgents({ agents, layout = 'horizontal' }: NewAgentsProps) {
  if (agents.length === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="text-3xl block mb-2">👋</span>
        <p className="text-gray-500 text-sm">No agents yet.</p>
        <p className="text-gray-400 text-xs mt-1">Register to be the first!</p>
      </Card>
    );
  }

  if (layout === 'horizontal') {
    return (
      <div>
        <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
          <span>👋</span> New Agents
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {agents.map((agent) => (
            <a
              key={agent.id}
              href={`https://twitter.com/${agent.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="p-3 hover:border-orange-300 transition-colors cursor-pointer flex items-center gap-3 min-w-[220px]">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">🫕</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{agent.name}</div>
                  <div className="text-xs text-gray-500">@{agent.twitterHandle}</div>
                  <div className="text-xs text-orange-500 mt-1">{formatTimeAgo(agent.createdAt)}</div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>👋</span> New Agents
      </h3>
      <Card className="divide-y">
        {agents.map((agent) => (
          <a
            key={agent.id}
            href={`https://twitter.com/${agent.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 hover:bg-orange-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {agent.avatar ? (
                  <img src={agent.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <span className="text-xl">🫕</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{agent.name}</div>
                <div className="text-xs text-gray-500">@{agent.twitterHandle}</div>
              </div>
              <div className="text-xs text-orange-500">
                {formatTimeAgo(agent.createdAt)}
              </div>
            </div>
            {agent.skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {agent.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {skill}
                  </span>
                ))}
                {agent.skills.length > 3 && (
                  <span className="text-xs text-gray-400">+{agent.skills.length - 3} more</span>
                )}
              </div>
            )}
          </a>
        ))}
      </Card>
    </div>
  );
}
