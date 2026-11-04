import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbbuku } from '@/db/schema';
import { ilike, or } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    let books;
    if (query) {
      books = await db.select()
        .from(tbbuku)
        .where(
          or(
            ilike(tbbuku.judulbuku, `%${query}%`),
            ilike(tbbuku.pengarang, `%${query}%`)
          )
        );
    } else {
      books = await db.select().from(tbbuku);
    }
    return NextResponse.json(books);
  } catch (error) {
    console.error('Fetch books error:', error);
    return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
  }
}
