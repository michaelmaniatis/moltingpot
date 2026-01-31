import { NextRequest, NextResponse } from 'next/server';
import { createVerificationRequest, getAgentByTwitterHandle } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { agentName, twitterHandle, description, skills } = body;

    if (!agentName || !twitterHandle) {
      return NextResponse.json(
        { error: 'agentName and twitterHandle are required' },
        { status: 400 }
      );
    }

    // Check if agent with this handle already exists
    const existingAgent = await getAgentByTwitterHandle(twitterHandle);
    if (existingAgent) {
      return NextResponse.json(
        { error: 'An agent with this Twitter handle is already registered' },
        { status: 400 }
      );
    }

    const result = await createVerificationRequest({
      agentName,
      twitterHandle,
      description,
      skills: skills || [],
    });

    return NextResponse.json({
      id: result.id,
      verificationCode: result.verificationCode,
      expiresAt: result.expiresAt,
      alreadyExists: result.alreadyExists,
      instructions: `Tweet the following from @${twitterHandle.replace(/^@/, '')}:\n\nVerifying my agent on @themoltingpot: ${result.verificationCode}`,
    });
  } catch (error) {
    console.error('Error starting verification:', error);
    return NextResponse.json(
      { error: 'Failed to start verification' },
      { status: 500 }
    );
  }
}
