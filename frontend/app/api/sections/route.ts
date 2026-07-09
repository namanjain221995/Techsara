import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3 } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const SECTIONS_KEY = 'sections/index.json';

export async function GET() {
  try {
    const raw = await readFromS3(SECTIONS_KEY);
    const sections = JSON.parse(raw || '[]');
    const response = NextResponse.json({ success: true, sections });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return response;
  } catch {
    return NextResponse.json(
      { success: false, sections: [] },
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
    const { name, heading, description,
            categoryTags, icon, anchorId, gradient } = body;
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Section name is required' },
        { status: 400 }
      );
    }
    const raw = await readFromS3(SECTIONS_KEY);
    const sections = JSON.parse(raw || '[]');
    const id = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-').trim();
    const newSection = {
      id,
      name,
      anchorId: anchorId || `topic-${id}`,
      heading: heading || `${name} articles`,
      description: description || '',
      categoryTags: categoryTags || [],
      icon: icon || '',
      gradient: gradient ||
        'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      order: sections.length + 1,
    };
    sections.push(newSection);
    await uploadToS3(
      SECTIONS_KEY, JSON.stringify(sections), 'application/json'
    );
    return NextResponse.json({ success: true, section: newSection });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to create section' },
      { status: 500 }
    );
  }
}
