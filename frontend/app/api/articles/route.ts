import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3 } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const INDEX_KEY = 'articles/index.json';


function autoExcerpt(html: string, maxLen = 160): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLen
    ? text.slice(0, maxLen).trimEnd() + '...'
    : text;
}

export async function GET() {
  try {
    const raw = await readFromS3(INDEX_KEY);
    const articles = JSON.parse(raw || '[]');
    const response = NextResponse.json({ success: true, articles });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to load articles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = cookies().get('admin_session')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }
  try {
    const body = await req.json();
    const {
      title, content, excerpt, coverImage,
      type, status, sectionId, categoryLabel,
    } = body;

    if (!title?.trim()) return NextResponse.json(
      { success: false, message: 'Title is required' }, { status: 400 }
    );
    if (!content?.trim()) return NextResponse.json(
      { success: false, message: 'Content is required' }, { status: 400 }
    );
    if (!sectionId?.trim()) return NextResponse.json(
      { success: false, message: 'Section is required for articles' }, { status: 400 }
    );
    if (!categoryLabel?.trim()) return NextResponse.json(
      { success: false, message: 'Category label is required' }, { status: 400 }
    );

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-').trim();
    const id = `${slug}-${Date.now()}`;
    const now = new Date().toISOString();
    const finalExcerpt = excerpt?.trim() || autoExcerpt(content);

    const article = {
      id, title: title.trim(), slug,
      excerpt: finalExcerpt,
      coverImage: coverImage || '',
      type: type || 'article',
      status: status || 'published',
      sectionId: sectionId?.trim() || '',
      categoryLabel: categoryLabel?.trim().toUpperCase() || '',
      createdAt: now, updatedAt: now,
    };

    await uploadToS3(
      `articles/${id}/content.html`, content, 'text/html'
    );

    const raw = await readFromS3(INDEX_KEY);
    const articles = JSON.parse(raw || '[]');
    articles.unshift(article);
    await uploadToS3(INDEX_KEY, JSON.stringify(articles), 'application/json');

    return NextResponse.json({ success: true, article });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to create article' },
      { status: 500 }
    );
  }
}
