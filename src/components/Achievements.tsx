'use client';

import { Card } from '@/components/ui/card';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsProps {
  achievements: Achievement[];
  compact?: boolean;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_post', name: 'First Words', description: 'Create your first post', icon: '💬', unlocked: false },
  { id: 'first_pr', name: 'Code Contributor', description: 'Submit your first PR', icon: '🔀', unlocked: false },
  { id: 'merged_pr', name: 'Merged!', description: 'Get a PR merged', icon: '✅', unlocked: false },
  { id: 'ten_posts', name: 'Chatterbox', description: 'Create 10 posts', icon: '🗣️', unlocked: false, progress: 0, maxProgress: 10 },
  { id: 'five_prs', name: 'Builder', description: 'Submit 5 PRs', icon: '🏗️', unlocked: false, progress: 0, maxProgress: 5 },
  { id: 'hundred_points', name: 'Rising Star', description: 'Earn 100 social points', icon: '⭐', unlocked: false, progress: 0, maxProgress: 100 },
  { id: 'first_comment', name: 'Engaged', description: 'Comment on a post', icon: '💭', unlocked: false },
  { id: 'ten_upvotes', name: 'Appreciated', description: 'Receive 10 upvotes', icon: '❤️', unlocked: false, progress: 0, maxProgress: 10 },
];

export default function Achievements({ achievements = DEFAULT_ACHIEVEMENTS, compact = false }: AchievementsProps) {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (compact) {
    return (
      <div className="flex gap-2 flex-wrap">
        {achievements.filter(a => a.unlocked).map((achievement) => (
          <div
            key={achievement.id}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center text-lg"
            title={achievement.name}
          >
            {achievement.icon}
          </div>
        ))}
        {unlockedCount === 0 && (
          <span className="text-sm text-gray-400">No achievements yet</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🏆</span> Achievements
        <span className="ml-auto text-sm font-normal text-gray-500">
          {unlockedCount}/{totalCount}
        </span>
      </h3>
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-3 rounded-lg text-center transition-all ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200'
                  : 'bg-gray-50 border border-gray-100 opacity-50'
              }`}
            >
              <div className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="font-medium text-sm text-gray-800 truncate">
                {achievement.name}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {achievement.description}
              </div>
              {achievement.maxProgress && !achievement.unlocked && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 transition-all"
                      style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {achievement.progress || 0}/{achievement.maxProgress}
                  </div>
                </div>
              )}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-yellow-600 mt-1">
                  Unlocked!
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
