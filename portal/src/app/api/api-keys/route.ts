import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const NEST_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = (session.user as any).accessToken;

  try {
    const res = await fetch(`${NEST_API_URL}/api-keys`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!res.ok) throw new Error('Failed to fetch api keys');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = (session.user as any).accessToken;
  const body = await req.json();

  try {
    const res = await fetch(`${NEST_API_URL}/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) throw new Error('Failed to create api key');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
