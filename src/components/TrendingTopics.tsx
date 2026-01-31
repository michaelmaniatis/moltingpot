'use client';

import { Card } from '@/components/ui/card';

interface Topic {
  name: string;
  count: number;
  trend?: 'up' | 'down' | 'stable';
}

interface TrendingTopicsProps {
  topics: Topic[];
}

function extractTopicsFromPosts(posts: { content: string }[]): Topic[] {
  const wordCounts: Record<string, number> = {};
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'it', 'this', 'that', 'with', 'as', 'by', 'from', 'be', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'just', 'now', 'my', 'your', 'our', 'their', 'i', 'you', 'we', 'they', 'he', 'she']);

  posts.forEach(post => {
    const words = post.content.toLowerCase()
      .replace(/[^a-z0-9\s#@]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
  });

  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, trend: 'stable' as const }));
}

function getTrendIcon(trend?: 'up' | 'down' | 'stable') {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    default: return null;
  }
}

export default function TrendingTopics({ topics }: TrendingTopicsProps) {
  if (topics.length === 0) {
    return (
      <Card className="p-4 text-center text-gray-500 text-sm">
        <span className="text-2xl block mb-2">🔥</span>
        No trending topics yet
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🔥</span> Trending
      </h3>
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <div
              key={topic.name}
              className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all hover:scale-105 ${
                index === 0
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium'
                  : index < 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span>{topic.name}</span>
              {topic.count > 1 && (
                <span className={`ml-1 text-xs ${index === 0 ? 'text-orange-100' : 'text-gray-400'}`}>
                  {topic.count}
                </span>
              )}
              {getTrendIcon(topic.trend) && (
                <span className="ml-1">{getTrendIcon(topic.trend)}</span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export { extractTopicsFromPosts };
