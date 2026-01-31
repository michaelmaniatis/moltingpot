import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, createContribution } from '@/lib/db';

function getApiKey(request: NextRequest): string | null {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return null;
  }
  return auth.substring(7);
}

// Generate a unique branch name
function generateBranchName(agentName: string): string {
  const timestamp = Date.now();
  const safeName = agentName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
  return `agent/${safeName}-${timestamp}`;
}

// POST /api/contribute - Submit a code contribution via GitHub API
export async function POST(request: NextRequest) {
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing authorization header. Include Bearer <api_key>',
    }, { status: 401 });
  }

  // Check for required environment variables
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    return NextResponse.json({
      success: false,
      error: 'GitHub integration not configured. Contact platform administrator.',
    }, { status: 503 });
  }

  try {
    const agent = await getAgentByApiKey(apiKey);
    if (!agent) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key',
      }, { status: 401 });
    }

    const body = await request.json();
    const { filePath, content, commitMessage, prTitle, prDescription } = body;

    // Validate required fields
    if (!filePath || !content || !commitMessage || !prTitle) {
      return NextResponse.json({
        success: false,
        error: 'filePath, content, commitMessage, and prTitle are required',
      }, { status: 400 });
    }

    // Validate file path (prevent directory traversal)
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid file path. Must be a relative path without ".."',
      }, { status: 400 });
    }

    const branchName = generateBranchName(agent.name);
    const headers = {
      'Authorization': `Bearer ${githubToken}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };

    // Step 1: Get the default branch's latest commit SHA
    const repoRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
      headers,
    });

    if (!repoRes.ok) {
      console.error('Failed to get repo info:', await repoRes.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to access repository',
      }, { status: 500 });
    }

    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    // Get the SHA of the default branch
    const refRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/${defaultBranch}`, {
      headers,
    });

    if (!refRes.ok) {
      console.error('Failed to get branch ref:', await refRes.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to get branch reference',
      }, { status: 500 });
    }

    const refData = await refRes.json();
    const baseSha = refData.object.sha;

    // Step 2: Create a new branch
    const createBranchRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/git/refs`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    });

    if (!createBranchRes.ok) {
      console.error('Failed to create branch:', await createBranchRes.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to create branch',
      }, { status: 500 });
    }

    // Step 3: Check if file exists (to get its SHA if it does)
    let fileSha: string | undefined;
    const fileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}?ref=${branchName}`, {
      headers,
    });

    if (fileRes.ok) {
      const fileData = await fileRes.json();
      fileSha = fileData.sha;
    }

    // Step 4: Create or update the file
    const fileContent = Buffer.from(content).toString('base64');
    const createFileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `${commitMessage}\n\nContributed by ${agent.name} (@${agent.twitterHandle}) via moltingpot API`,
        content: fileContent,
        branch: branchName,
        sha: fileSha, // Only include if updating existing file
      }),
    });

    if (!createFileRes.ok) {
      console.error('Failed to create/update file:', await createFileRes.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to commit file',
      }, { status: 500 });
    }

    // Step 5: Create the pull request
    const prBody = `${prDescription || ''}\n\n---\n\n**Contributed by:** ${agent.name} (@${agent.twitterHandle})\n**Via:** moltingpot API\n**Agent ID:** ${agent.id}`;

    const createPrRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: prTitle,
        body: prBody,
        head: branchName,
        base: defaultBranch,
      }),
    });

    if (!createPrRes.ok) {
      console.error('Failed to create PR:', await createPrRes.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to create pull request',
      }, { status: 500 });
    }

    const prData = await createPrRes.json();

    // Step 6: Record the contribution in our database
    const contribution = await createContribution(apiKey, {
      prUrl: prData.html_url,
      prNumber: prData.number,
      prTitle: prTitle,
      branch: branchName,
      filePath: filePath,
    });

    if ('error' in contribution) {
      // PR was created but we failed to record it - still return success
      console.error('Failed to record contribution:', contribution.error);
    }

    return NextResponse.json({
      success: true,
      data: {
        prUrl: prData.html_url,
        prNumber: prData.number,
        branch: branchName,
        contribution: 'error' in contribution ? null : contribution,
      },
      message: `Pull request #${prData.number} created successfully! Your contribution is now pending review.`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create contribution',
    }, { status: 500 });
  }
}
