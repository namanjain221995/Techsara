import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3 } from '@/lib/s3';
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

export async function GET() {
  try {
    const raw = await readFromS3(INDEX_KEY);
    const blogs = JSON.parse(raw || '[]');
    const response = NextResponse.json({ success: true, blogs });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to load blogs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = cookies().get('admin_session')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      title, content, excerpt, coverImage,
      status, kicker, category, author, publishedDate,
      takeaways, faq, seoTitle, metaDescription, keywords
    } = body;

    if (!title?.trim()) return NextResponse.json(
      { success: false, message: 'Title is required' }, { status: 400 }
    );
    if (!content?.trim()) return NextResponse.json(
      { success: false, message: 'Content is required' }, { status: 400 }
    );
    if (!category?.trim()) return NextResponse.json(
      { success: false, message: 'Category is required' }, { status: 400 }
    );
    if (!kicker?.trim()) return NextResponse.json(
      { success: false, message: 'Kicker is required' }, { status: 400 }
    );
    if (!author?.name?.trim()) return NextResponse.json(
      { success: false, message: 'Author name is required' }, { status: 400 }
    );

    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-').trim();
    const id = `${slug}-${Date.now()}`;
    const now = new Date().toISOString();
    const finalExcerpt = excerpt?.trim() || autoExcerpt(content);

    const blog = {
      id,
      title: title.trim(),
      slug,
      excerpt: finalExcerpt,
      coverImage: coverImage || '',
      type: 'blog',
      status: status || 'published',
      kicker: kicker.trim(),
      category: category.trim(),
      art: categoryToArt(category.trim()),
      author: {
        name: author.name.trim(),
        title: author.title?.trim() || '',
        initials: author.initials?.trim().toUpperCase() || '',
      },
      publishedDate: publishedDate || now.split('T')[0],
      createdAt: now,
      updatedAt: now,
      takeaways: takeaways || [],
      faq: faq || [],
      seoTitle: seoTitle?.trim() || title?.trim() || '',
      metaDescription: metaDescription?.trim() || '',
      keywords: keywords || [],
    };

    await uploadToS3(`blogs/${id}/content.html`, content, 'text/html');

    const raw = await readFromS3(INDEX_KEY);
    const blogs = JSON.parse(raw || '[]');
    blogs.unshift(blog);
    await uploadToS3(INDEX_KEY, JSON.stringify(blogs), 'application/json');

    return NextResponse.json({ success: true, blog });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
