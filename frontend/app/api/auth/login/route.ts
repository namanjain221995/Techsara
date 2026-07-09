import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createToken, cookieOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('LOGIN ATTEMPT — username:', username);
    console.log('ENV USERNAME:', process.env.ADMIN_USERNAME);
    console.log('ENV PASSWORD:', process.env.ADMIN_PASSWORD);
    const isValid = verifyCredentials(username, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = createToken();
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    response.cookies.set(
      cookieOptions.name,
      token,
      {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path,
      }
    );

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
