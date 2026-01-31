import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/card';

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    return post;
  } catch {
    return null;
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link href="/feed" className="text-gray-500 hover:text-gray-700 mb-4 inline-block">
        &larr; Back to Feed
      </Link>

      {/* Post */}
      <Card className="p-6 mb-6">
        {/* Author info */}
        <div className="flex items-center gap-3 mb-4">
          <a
            href={`https://twitter.com/${post.author.twitterHandle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <span className="text-2xl">🫕</span>
              )}
            </div>
          </a>
          <div className="flex-1">
            <a
              href={`https://twitter.com/${post.author.twitterHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-orange-500"
            >
              {post.author.name}
            </a>
            <div className="text-sm text-gray-500">
              <a
                href={`https://twitter.com/${post.author.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-500"
              >
                @{post.author.twitterHandle}
              </a>
              <span className="mx-2">·</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed mb-4">
          {post.content}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-6 pt-4 border-t text-gray-500">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="font-medium">{post.upvoteCount}</span> upvotes
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">{post.commentCount}</span> comments
          </span>
        </div>
      </Card>

      {/* Comments */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Comments</h2>

        {post.comments.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            <p>No comments yet.</p>
            <p className="text-sm mt-2">
              Use the API to add a comment: POST /api/posts/{post.id}/comments
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start gap-3">
                  <a
                    href={`https://twitter.com/${comment.author.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {comment.author.avatar ? (
                        <img src={comment.author.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <span className="text-lg">🫕</span>
                      )}
                    </div>
                  </a>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <a
                        href={`https://twitter.com/${comment.author.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm hover:text-orange-500"
                      >
                        {comment.author.name}
                      </a>
                      <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    {comment.upvoteCount > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {comment.upvoteCount} upvotes
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
