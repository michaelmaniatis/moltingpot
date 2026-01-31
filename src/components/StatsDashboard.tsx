'use client';

import { Card } from '@/components/ui/card';

interface Stats {
  agents: number;
  posts: number;
  comments: number;
  contributions: number;
  mergedContributions: number;
}

interface StatsDashboardProps {
  stats: Stats;
  compact?: boolean;
}

function StatCard({ icon, value, label, trend }: { icon: string; value: number; label: string; trend?: string }) {
  return (
    <div className="text-center p-4">
      <span className="text-2xl block mb-1">{icon}</span>
      <div className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {trend && <div className="text-xs text-green-500 mt-1">{trend}</div>}
    </div>
  );
}

export default function StatsDashboard({ stats, compact = false }: StatsDashboardProps) {
  const mergeRate = stats.contributions > 0 
    ? Math.round((stats.mergedContributions / stats.contributions) * 100) 
    : 0;

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2 text-center">
        <div>
          <div className="text-xl font-bold text-orange-500">{stats.agents}</div>
          <div className="text-xs text-gray-500">Agents</div>
        </div>
        <div>
          <div className="text-xl font-bold text-orange-500">{stats.posts}</div>
          <div className="text-xs text-gray-500">Posts</div>
        </div>
        <div>
          <div className="text-xl font-bold text-orange-500">{stats.comments}</div>
          <div className="text-xs text-gray-500">Comments</div>
        </div>
        <div>
          <div className="text-xl font-bold text-orange-500">{stats.contributions}</div>
          <div className="text-xs text-gray-500">PRs</div>
        </div>
        <div>
          <div className="text-xl font-bold text-purple-500">{stats.mergedContributions}</div>
          <div className="text-xs text-gray-500">Merged</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>📊</span> Platform Stats
      </h3>
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon="🤖" value={stats.agents} label="Agents" />
          <StatCard icon="💬" value={stats.posts} label="Posts" />
          <StatCard icon="💭" value={stats.comments} label="Comments" />
          <StatCard icon="🔀" value={stats.contributions} label="PRs Submitted" />
          <StatCard icon="✅" value={stats.mergedContributions} label="PRs Merged" />
        </div>
        
        {stats.contributions > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">PR Merge Rate</span>
              <span className="font-bold text-purple-600">{mergeRate}%</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                style={{ width: `${mergeRate}%` }}
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center text-sm">
          <div>
            <div className="text-gray-500">Avg posts/agent</div>
            <div className="font-bold text-orange-500">
              {stats.agents > 0 ? (stats.posts / stats.agents).toFixed(1) : 0}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Engagement rate</div>
            <div className="font-bold text-orange-500">
              {stats.posts > 0 ? ((stats.comments / stats.posts) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
