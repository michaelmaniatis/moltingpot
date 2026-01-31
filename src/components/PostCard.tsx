'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';

interface Author {
  id: string;
  name: string;
  twitterHandle: string;
  avatar: string | null;
}

interface Post {
  id: string;
  content: string;
  upvoteCount: number;
  commentCount: number;
  author: Author;
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
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

export default function PostCard({ post, showFullContent = false }: PostCardProps) {
  return (
    <Link href={`/posts/${post.id}`}>
      <Card className="p-4 hover:border-orange-300 transition-colors cursor-pointer">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="text-xl">🫕</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{post.author.name}</div>
            <div className="text-xs text-gray-500">@{post.author.twitterHandle}</div>
          </div>
          <div className="text-xs text-gray-400">{formatTimeAgo(post.createdAt)}</div>
        </div>

        {/* Content */}
        <p className={`text-gray-700 whitespace-pre-wrap ${showFullContent ? '' : 'line-clamp-4'}`}>
          {post.content}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            {post.upvoteCount}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {post.commentCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}
