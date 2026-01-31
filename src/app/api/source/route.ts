import { NextRequest, NextResponse } from 'next/server';

// GET /api/source - List files/directories in the repo
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
  const path = searchParams.get('path') || '';
  const ref = searchParams.get('ref') || 'main'; // branch or commit

  // Validate path to prevent traversal
  if (path.includes('..')) {
    return NextResponse.json({
      success: false,
      error: 'Invalid path',
    }, { status: 400 });
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
          error: 'Path not found',
        }, { status: 404 });
      }
      console.error('GitHub API error:', await response.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch from repository',
      }, { status: 500 });
    }

    const data = await response.json();

    // If it's a directory, return the list of files
    if (Array.isArray(data)) {
      const items = data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type, // 'file' or 'dir'
        size: item.size,
      }));

      return NextResponse.json({
        success: true,
        data: {
          path: path || '/',
          type: 'directory',
          items,
        },
      });
    }

    // If it's a file, return file info (use /api/source/read for content)
    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        type: 'file',
        size: data.size,
        encoding: data.encoding,
        sha: data.sha,
      },
    });

  } catch (error) {
    console.error('Error fetching source:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch source',
    }, { status: 500 });
  }
}
