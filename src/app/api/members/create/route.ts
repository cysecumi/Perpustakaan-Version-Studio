import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbanggota } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newMember = await db.insert(tbanggota).values({
      idanggota: data.idanggota,
      nama: data.nama,
      jeniskelamin: data.jeniskelamin,
      alamat: data.alamat,
      status: data.status || 'Tidak Meminjam',
      foto: data.foto || '-'
    }).returning();
    return NextResponse.json(newMember[0]);
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
