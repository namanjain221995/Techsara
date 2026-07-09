import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3, deleteFromS3 } from '@/lib/s3';
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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await readFromS3(INDEX_KEY);
    const articles = JSON.parse(raw || '[]');
    const article = articles.find((a: any) => a.id === params.id);
    if (!article) return NextResponse.json(
      { success: false, message: 'Article not found' }, { status: 404 }
    );
    const content = await readFromS3(
      `articles/${params.id}/content.html`
    );
    const response = NextResponse.json({ success: true, article, content });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to load article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = cookies().get('admin_session')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  try {
    const body = await req.json();
    const raw = await readFromS3(INDEX_KEY);
    const articles = JSON.parse(raw || '[]');
    const index = articles.findIndex((a: any) => a.id === params.id);
    if (index === -1) return NextResponse.json(
      { success: false, message: 'Article not found' }, { status: 404 }
    );

    const finalExcerpt = body.excerpt?.trim() ||
      (body.content ? autoExcerpt(body.content) : articles[index].excerpt);

    const updated = {
      ...articles[index],
      title: body.title?.trim() || articles[index].title,
      excerpt: finalExcerpt,
      coverImage: body.coverImage ?? articles[index].coverImage,
      type: body.type || articles[index].type,
      status: body.status || articles[index].status,
      sectionId: body.sectionId?.trim() ?? articles[index].sectionId ?? '',
      categoryLabel: body.categoryLabel?.trim().toUpperCase()
        ?? articles[index].categoryLabel ?? '',
      updatedAt: new Date().toISOString(),
    };

    articles[index] = updated;

    if (body.content) {
      await uploadToS3(
        `articles/${params.id}/content.html`, body.content, 'text/html'
      );
    }

    await uploadToS3(INDEX_KEY, JSON.stringify(articles), 'application/json');
    return NextResponse.json({ success: true, article: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = cookies().get('admin_session')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  try {
    const raw = await readFromS3(INDEX_KEY);
    const articles = JSON.parse(raw || '[]');
    const articleToDelete = articles.find((a: any) => a.id === params.id);
    const filtered = articles.filter((a: any) => a.id !== params.id);

    await deleteFromS3(`articles/${params.id}/content.html`);

    if (articleToDelete?.coverImage) {
      try {
        const bucketBase = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (articleToDelete.coverImage.startsWith(bucketBase)) {
          await deleteFromS3(
            articleToDelete.coverImage.replace(bucketBase, '')
          );
        }
      } catch { /* continue even if cover delete fails */ }
    }

    await uploadToS3(INDEX_KEY, JSON.stringify(filtered), 'application/json');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
