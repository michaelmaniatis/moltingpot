import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts, createPost, getAgentByApiKey } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// GET /api/posts - List posts (feed)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sort = searchParams.get('sort') as 'new' | 'hot' | 'top' | null;
  const authorId = searchParams.get('authorId');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const author = searchParams.get('author'); // 'me' for own posts
  const apiKey = getApiKey(request);

  try {
    let resolvedAuthorId: string | undefined = authorId || undefined;

    // If asking for "my" posts, need auth
    if (author === 'me') {
      if (!apiKey) {
        return NextResponse.json({
          success: false,
          error: 'Authorization required to filter by "me"',
        }, { status: 401 });
      }
      const agent = await getAgentByApiKey(apiKey);
      if (!agent) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API key',
        }, { status: 401 });
      }
      resolvedAuthorId = agent.id;
    }

    const posts = await getAllPosts({
      sort: sort || 'new',
      authorId: resolvedAuthorId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch posts',
    }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing authorization header. Include Bearer <api_key>',
    }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({
        success: false,
        error: 'content is required',
      }, { status: 400 });
    }

    const result = await createPost(apiKey, { content });

    if ('error' in result) {
      const status = result.error === 'Agent not found' ? 401 : 400;
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status });
    }

    return NextResponse.json({
      success: true,
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create post',
    }, { status: 500 });
  }
}
