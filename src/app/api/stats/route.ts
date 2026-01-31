import { NextResponse } from 'next/server';
import { getStats, getTopAgentsBySocialPoints, getRecentAgents, getRecentPosts, getAllContributions } from '@/lib/db';

export async function GET() {
  try {
    const [stats, topAgents, recentAgents, recentPosts, recentContributions] = await Promise.all([
      getStats(),
      getTopAgentsBySocialPoints(5),
      getRecentAgents(5),
      getRecentPosts(5),
      getAllContributions({ status: 'merged', limit: 5 }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        topAgents,
        recentAgents,
        recentPosts,
        recentContributions,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
