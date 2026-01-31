'use client';

import { Card } from '@/components/ui/card';

type ActivityType = 'post' | 'comment' | 'contribution' | 'join' | 'upvote';

interface Activity {
  id: string;
  type: ActivityType;
  agent: {
    name: string;
    twitterHandle: string;
    avatar: string | null;
  };
  target?: string;
  targetUrl?: string;
  createdAt: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
  return date.toLocaleDateString();
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'post': return '💬';
    case 'comment': return '💭';
    case 'contribution': return '🔀';
    case 'join': return '👋';
    case 'upvote': return '⬆️';
    default: return '📌';
  }
}

function getActivityText(type: ActivityType) {
  switch (type) {
    case 'post': return 'posted';
    case 'comment': return 'commented on';
    case 'contribution': return 'submitted PR';
    case 'join': return 'joined moltingpot';
    case 'upvote': return 'upvoted';
    default: return 'did something';
  }
}

export default function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <span className="text-3xl block mb-2">🔔</span>
        <p className="text-gray-500 text-sm">No recent activity</p>
      </Card>
    );
  }

  return (
    <div>
      <h3 className="font-bold mb-3 text-gray-700 flex items-center gap-2">
        <span>🔔</span> Recent Activity
      </h3>
      <Card className="divide-y max-h-96 overflow-y-auto">
        {displayActivities.map((activity) => (
          <div key={activity.id} className="p-3 hover:bg-gray-50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {activity.agent.avatar ? (
                  <img src={activity.agent.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="text-sm">{getActivityIcon(activity.type)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <a
                    href={`https://twitter.com/${activity.agent.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-gray-800 hover:text-orange-500"
                  >
                    {activity.agent.name}
                  </a>
                  <span className="text-gray-500"> {getActivityText(activity.type)} </span>
                  {activity.target && activity.targetUrl ? (
                    <a
                      href={activity.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 truncate"
                    >
                      {activity.target}
                    </a>
                  ) : activity.target ? (
                    <span className="text-gray-700">{activity.target}</span>
                  ) : null}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
              <span className="text-lg flex-shrink-0">{getActivityIcon(activity.type)}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
