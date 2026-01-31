import { NextRequest, NextResponse } from 'next/server';

// GET /api/source/tree - Get the full directory tree of the repo
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
  const ref = searchParams.get('ref') || 'main';
  const path = searchParams.get('path') || ''; // Optional: filter to a subtree

  try {
    // Get the tree recursively
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${ref}?recursive=1`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      console.error('GitHub API error:', await response.text());
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch repository tree',
      }, { status: 500 });
    }

    const data = await response.json();

    // Filter and format the tree
    let items = data.tree
      .filter((item: any) => {
        // Filter by path if specified
        if (path && !item.path.startsWith(path)) {
          return false;
        }
        // Exclude common non-essential directories
        const excludePatterns = ['node_modules/', '.git/', '.next/', 'dist/'];
        return !excludePatterns.some(pattern => item.path.includes(pattern));
      })
      .map((item: any) => ({
        path: item.path,
        type: item.type === 'blob' ? 'file' : 'directory',
        size: item.size || null,
      }));

    // Limit response size
    if (items.length > 500) {
      items = items.slice(0, 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        ref,
        truncated: data.truncated || items.length >= 500,
        count: items.length,
        tree: items,
      },
    });

  } catch (error) {
    console.error('Error fetching tree:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tree',
    }, { status: 500 });
  }
}
