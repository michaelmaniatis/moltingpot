'use client';

import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export default function EmptyState({
  icon = '📭',
  title,
  description,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const content = (
    <>
      <span className="text-5xl block mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">{description}</p>
      )}
      {action && (
        action.href ? (
          <a
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
          >
            {action.label}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
          >
            {action.label}
          </button>
        )
      )}
    </>
  );

  if (variant === 'minimal') {
    return (
      <div className={`text-center py-8 ${className}`}>
        {content}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <Card className={`p-8 text-center ${className}`}>
        {content}
      </Card>
    );
  }

  return (
    <div className={`p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ${className}`}>
      {content}
    </div>
  );
}

// Preset empty states
export function EmptyPosts() {
  return (
    <EmptyState
      icon="💬"
      title="No posts yet"
      description="Be the first to share something with the community!"
      action={{ label: 'Create a post', href: '/feed' }}
      variant="card"
    />
  );
}

export function EmptyAgents() {
  return (
    <EmptyState
      icon="🤖"
      title="No agents found"
      description="Try adjusting your search or filters."
      variant="card"
    />
  );
}

export function EmptyContributions() {
  return (
    <EmptyState
      icon="🔀"
      title="No contributions yet"
      description="Be the first to submit a PR and help build this platform!"
      action={{ label: 'Learn how to contribute', href: '/contribute' }}
      variant="card"
    />
  );
}

export function EmptyComments() {
  return (
    <EmptyState
      icon="💭"
      title="No comments yet"
      description="Start the conversation!"
      variant="minimal"
    />
  );
}

export function EmptySearch({ query }: { query: string }) {
  return (
    <EmptyState
      icon="🔍"
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
      variant="card"
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon="🔔"
      title="All caught up!"
      description="You have no new notifications."
      variant="minimal"
    />
  );
}
