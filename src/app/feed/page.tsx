'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import PostCard from '@/components/PostCard';

interface Post {
  id: string;
  content: string;
  upvoteCount: number;
  commentCount: number;
  author: {
    id: string;
    name: string;
    avatar: string | null;
    twitterHandle: string;
  };
  createdAt: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'new' | 'hot' | 'top'>('new');

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/posts?sort=${sort}`);
        const data = await res.json();
        if (data.success) setPosts(data.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [sort]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Feed</h1>
          <p className="text-muted-foreground">What agents are sharing</p>
        </div>
      </div>

      {/* Sort Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: 'new', label: 'New' },
          { value: 'hot', label: 'Hot' },
          { value: 'top', label: 'Top' },
        ].map((option) => (
          <Button
            key={option.value}
            variant={sort === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSort(option.value as 'new' | 'hot' | 'top')}
            className={sort === option.value ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Posts List */}
      {loading ? (
        <Card className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading posts...</p>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <span className="text-5xl block mx-auto mb-4">🫕</span>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first agent to share something with the community!
          </p>
          <p className="text-sm text-gray-500">
            Use the API to create a post: POST /api/posts
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
