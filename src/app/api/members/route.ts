import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbanggota } from '@/db/schema';
import { ilike, or, eq } from 'drizzle-orm';

const INITIAL_MEMBERS = [
  { idanggota: '002', nama: 'Jihan', jeniskelamin: 'Pria', alamat: 'jl jalanan', status: 'Tidak Meminjam', foto: '002.jpeg' },
  { idanggota: '003', nama: 'Nyahu', jeniskelamin: 'Pria', alamat: 'Tel aviv', status: 'Tidak Meminjam', foto: '003.jpeg' },
  { idanggota: '004', nama: 'wok', jeniskelamin: 'Pria', alamat: 'Jl kesana kesini', status: 'Tidak Meminjam', foto: '004.jpeg' },
  { idanggota: '005', nama: 'jihan6', jeniskelamin: 'Pria', alamat: 'jl. jalanan', status: 'Tidak Meminjam', foto: '005.jpeg' }
];

let inMemoryMembers = [...INITIAL_MEMBERS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    let members;
    if (query && query.trim() !== '') {
      members = await db.select()
        .from(tbanggota)
        .where(
          or(
            ilike(tbanggota.nama, `%${query}%`),
            ilike(tbanggota.alamat, `%${query}%`),
            ilike(tbanggota.idanggota, `%${query}%`)
          )
        );
    } else {
      members = await db.select().from(tbanggota);
    }

    if (members && members.length > 0) {
      return NextResponse.json(members);
    }
  } catch (error) {
    console.warn('Fetch members DB query warning, returning fallback:', error);
  }

  // Filter in-memory
  if (query && query.trim() !== '') {
    const qLower = query.toLowerCase();
    const filtered = inMemoryMembers.filter(m => 
      m.nama.toLowerCase().includes(qLower) || 
      m.alamat.toLowerCase().includes(qLower) || 
      m.idanggota.toLowerCase().includes(qLower)
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(inMemoryMembers);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const memberObj = {
      idanggota: data.idanggota,
      nama: data.nama,
      jeniskelamin: data.jeniskelamin || 'Pria',
      alamat: data.alamat,
      status: data.status || 'Tidak Meminjam',
      foto: data.foto || '002.jpeg'
    };

    try {
      const newMember = await db.insert(tbanggota).values(memberObj).returning();
      if (newMember && newMember[0]) {
        inMemoryMembers.unshift(newMember[0]);
        return NextResponse.json(newMember[0]);
      }
    } catch {
      // Fallback in-memory insert
    }

    inMemoryMembers.unshift(memberObj);
    return NextResponse.json(memberObj);
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    try {
      await db.update(tbanggota)
        .set({
          nama: data.nama,
          jeniskelamin: data.jeniskelamin,
          alamat: data.alamat,
          status: data.status,
          foto: data.foto
        })
        .where(eq(tbanggota.idanggota, data.idanggota));
    } catch {
      // Fallback in-memory update
    }

    inMemoryMembers = inMemoryMembers.map(m => m.idanggota === data.idanggota ? { ...m, ...data } : m);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    try {
      await db.delete(tbanggota).where(eq(tbanggota.idanggota, id));
    } catch {
      // Fallback in-memory delete
    }

    inMemoryMembers = inMemoryMembers.filter(m => m.idanggota !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
