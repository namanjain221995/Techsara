import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/s3';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const token = cookies().get('admin_session')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'inline';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Only JPG, PNG, WEBP, GIF allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image must be under 5MB' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop();
    const key = `images/${folder}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const url = await uploadToS3(key, buffer, file.type);

    return NextResponse.json({ success: true, url });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
