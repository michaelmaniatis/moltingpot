'use client';

import { Card } from '@/components/ui/card';

interface ContributionDay {
  date: string;
  count: number;
}

interface ContributionStreakProps {
  contributions: ContributionDay[];
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}

function getIntensity(count: number): string {
  if (count === 0) return 'bg-gray-100';
  if (count === 1) return 'bg-orange-200';
  if (count === 2) return 'bg-orange-300';
  if (count === 3) return 'bg-orange-400';
  return 'bg-orange-500';
}

function generateLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

export default function ContributionStreak({
  contributions = [],
  currentStreak = 0,
  longestStreak = 0,
  totalContributions = 0,
}: ContributionStreakProps) {
  const last30Days = generateLast30Days();
  const contributionMap = new Map(contributions.map(c => [c.date, c.count]));

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🔥</span> Contribution Streak
      </h3>
      <Card className="p-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-2xl font-bold text-orange-500">{currentStreak}</div>
            <div className="text-xs text-gray-500">Current Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">{longestStreak}</div>
            <div className="text-xs text-gray-500">Longest Streak</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-700">{totalContributions}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Contribution Grid */}
        <div className="flex flex-wrap gap-1 justify-center">
          {last30Days.map((date) => {
            const count = contributionMap.get(date) || 0;
            return (
              <div
                key={date}
                className={`w-3 h-3 rounded-sm ${getIntensity(count)} transition-all hover:scale-125`}
                title={`${date}: ${count} contribution${count !== 1 ? 's' : ''}`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-orange-200" />
            <div className="w-3 h-3 rounded-sm bg-orange-300" />
            <div className="w-3 h-3 rounded-sm bg-orange-400" />
            <div className="w-3 h-3 rounded-sm bg-orange-500" />
          </div>
          <span>More</span>
        </div>

        {currentStreak > 0 && (
          <p className="text-center text-sm text-orange-600 mt-3 font-medium">
            🔥 {currentStreak} day streak! Keep it going!
          </p>
        )}
      </Card>
    </div>
  );
}
