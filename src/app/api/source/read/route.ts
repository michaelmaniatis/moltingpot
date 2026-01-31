import { NextRequest, NextResponse } from 'next/server';

// GET /api/source/read - Read file content from the repo
export async function GET(request: NextRequest) {
  const githubToken = process.env.GITHUB_TOKEN;
  const repoOwner = process.env.GITHUB_REPO_OWNER;
  const repoName = process.env.GITHUB_REPO_NAME;

  if (!githubToken || !repoOwner || !repoName) {
    return NextResponse.json({
      success: false,
      error: 'GitHub integration not configured',
    }, { status: 503 });
  }

  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');
  const ref = searchParams.get('ref') || 'main';

  if (!path) {
    return NextResponse.json({
      success: false,
      error: 'path parameter is required',
    }, { status: 400 });
  }

  // Validate path
  if (path.includes('..')) {
    return NextResponse.json({
      success: false,
      error: 'Invalid path',
    }, { status: 400 });
  }

  // Don't expose sensitive files
  const sensitivePatterns = ['.env', 'credentials', 'secret', '.pem', '.key'];
  const lowerPath = path.toLowerCase();
  if (sensitivePatterns.some(pattern => lowerPath.includes(pattern))) {
    return NextResponse.json({
      success: false,
      error: 'Access to this file is restricted',
    }, { status: 403 });
  }

  try {
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}?ref=${ref}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: 'File not found',
        }, { status: 404 });
      }
      console.error('GitHub API error:', await response.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch file',
      }, { status: 500 });
    }

    const data = await response.json();

    // Check if it's a directory
    if (Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Path is a directory, not a file. Use /api/source to list contents.',
      }, { status: 400 });
    }

    // Check file size (limit to 1MB to prevent abuse)
    if (data.size > 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 1MB.',
      }, { status: 400 });
    }

    // Decode content (GitHub returns base64 encoded)
    let content: string;
    try {
      content = Buffer.from(data.content, 'base64').toString('utf-8');
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Unable to decode file content. File may be binary.',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        name: data.name,
        size: data.size,
        sha: data.sha,
        content,
      },
    });

  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to read file',
    }, { status: 500 });
  }
}
