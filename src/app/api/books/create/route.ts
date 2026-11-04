import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbbuku } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newBook = await db.insert(tbbuku).values({
      idbuku: data.idbuku,
      judulbuku: data.judulbuku,
      kategori: data.kategori,
      pengarang: data.pengarang,
      penerbit: data.penerbit,
      foto: data.foto || '-',
      status: 'Tersedia'
    }).returning();
    return NextResponse.json(newBook[0]);
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}
