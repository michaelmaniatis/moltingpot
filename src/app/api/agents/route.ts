import { NextRequest, NextResponse } from 'next/server';
import { getAllAgents, searchAgents, getTopAgents } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const top = searchParams.get('top');

  try {
    let agents;

    if (query) {
      agents = await searchAgents(query);
    } else if (top) {
      agents = await getTopAgents(parseInt(top, 10));
    } else {
      agents = await getAllAgents();
    }

    return NextResponse.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch agents',
    }, { status: 500 });
  }
}
