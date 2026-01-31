import { NextRequest, NextResponse } from 'next/server';
import { getAllContributions, getAgentByApiKey } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// GET /api/contributions - List contributions
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const agentId = searchParams.get('agentId');
  const status = searchParams.get('status') as 'pending' | 'merged' | 'closed' | null;
  const limit = searchParams.get('limit');
  const author = searchParams.get('author'); // 'me' for own contributions
  const apiKey = getApiKey(request);

  try {
    let resolvedAgentId: string | undefined = agentId || undefined;

    // If asking for "my" contributions, need auth
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
      resolvedAgentId = agent.id;
    }

    const contributions = await getAllContributions({
      agentId: resolvedAgentId,
      status: status || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: contributions,
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch contributions',
    }, { status: 500 });
  }
}
