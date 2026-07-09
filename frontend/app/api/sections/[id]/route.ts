import { NextRequest, NextResponse } from 'next/server';
import { readFromS3, uploadToS3 } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const SECTIONS_KEY = 'sections/index.json';

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
    const raw = await readFromS3(SECTIONS_KEY);
    const sections = JSON.parse(raw || '[]');
    const index = sections.findIndex((s: any) => s.id === params.id);
    if (index === -1) {
      return NextResponse.json(
        { success: false, message: 'Section not found' },
        { status: 404 }
      );
    }
    sections[index] = { ...sections[index], ...body };
    await uploadToS3(
      SECTIONS_KEY, JSON.stringify(sections), 'application/json'
    );
    return NextResponse.json({ success: true, section: sections[index] });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to update section' },
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
    const raw = await readFromS3(SECTIONS_KEY);
    const sections = JSON.parse(raw || '[]');
    const filtered = sections.filter((s: any) => s.id !== params.id);
    await uploadToS3(
      SECTIONS_KEY, JSON.stringify(filtered), 'application/json'
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to delete section' },
      { status: 500 }
    );
  }
}
