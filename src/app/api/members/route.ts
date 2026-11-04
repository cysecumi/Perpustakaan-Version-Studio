import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbanggota } from '@/db/schema';
import { ilike } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    let members;
    if (query) {
      members = await db.select()
        .from(tbanggota)
        .where(ilike(tbanggota.nama, `%${query}%`));
    } else {
      members = await db.select().from(tbanggota);
    }
    return NextResponse.json(members);
  } catch (error) {
    console.error('Fetch members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
