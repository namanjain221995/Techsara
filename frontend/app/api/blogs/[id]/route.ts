import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3, deleteFromS3 } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const INDEX_KEY = 'blogs/index.json';

function autoExcerpt(html: string, maxLen = 160): string {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '...' : text;
}

function categoryToArt(category: string): string {
  const map: Record<string, string> = {
    'AI Staffing': 'staffing',
    'Generative AI': 'genai',
    'Cloud & MLOps': 'cloud',
    'Industry Insights': 'industry',
  };
  return map[category] || 'staffing';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const raw = await readFromS3(INDEX_KEY);
    const blogs = JSON.parse(raw || '[]');
    const blog = blogs.find((b: any) => b.id === params.id);
    if (!blog) return NextResponse.json(
      { success: false, message: 'Blog not found' }, { status: 404 }
    );
    const content = await readFromS3(`blogs/${params.id}/content.html`);
    const response = NextResponse.json({ success: true, blog, content });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to load blog' }, { status: 500 }
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
    const blogs = JSON.parse(raw || '[]');
    const index = blogs.findIndex((b: any) => b.id === params.id);
    if (index === -1) return NextResponse.json(
      { success: false, message: 'Blog not found' }, { status: 404 }
    );

    const finalExcerpt = body.excerpt?.trim() ||
      (body.content ? autoExcerpt(body.content) : blogs[index].excerpt);

    const updated = {
      ...blogs[index],
      title: body.title?.trim() || blogs[index].title,
      excerpt: finalExcerpt,
      coverImage: body.coverImage ?? blogs[index].coverImage,
      status: body.status || blogs[index].status,
      kicker: body.kicker?.trim() || blogs[index].kicker,
      category: body.category?.trim() || blogs[index].category,
      art: body.category
        ? categoryToArt(body.category)
        : blogs[index].art,
      author: body.author ?? blogs[index].author,
      publishedDate: body.publishedDate || blogs[index].publishedDate,
      updatedAt: new Date().toISOString(),
    };

    blogs[index] = updated;

    if (body.content) {
      await uploadToS3(`blogs/${params.id}/content.html`, body.content, 'text/html');
    }

    await uploadToS3(INDEX_KEY, JSON.stringify(blogs), 'application/json');
    return NextResponse.json({ success: true, blog: updated });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update blog' }, { status: 500 }
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
    const blogs = JSON.parse(raw || '[]');
    const blogToDelete = blogs.find((b: any) => b.id === params.id);
    const filtered = blogs.filter((b: any) => b.id !== params.id);

    await deleteFromS3(`blogs/${params.id}/content.html`);

    if (blogToDelete?.coverImage) {
      try {
        const bucketBase = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
        if (blogToDelete.coverImage.startsWith(bucketBase)) {
          await deleteFromS3(blogToDelete.coverImage.replace(bucketBase, ''));
        }
      } catch { /* continue */ }
    }

    await uploadToS3(INDEX_KEY, JSON.stringify(filtered), 'application/json');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to delete blog' }, { status: 500 }
    );
  }
}
