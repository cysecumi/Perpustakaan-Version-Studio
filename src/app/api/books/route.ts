import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tbbuku } from '@/db/schema';
import { ilike, or, eq, and } from 'drizzle-orm';
import { adminDb } from '@/lib/firebase-admin';

const INITIAL_BOOKS = [
  { idbuku: 'B001', judulbuku: 'Pemrograman Web dengan PHP & MySQL', kategori: 'Ilmu Komputer', pengarang: 'Budi Raharjo', penerbit: 'Informatika', status: 'Tersedia', foto: '01.jpeg' },
  { idbuku: 'B002', judulbuku: 'Belajar Next.js & React', kategori: 'Ilmu Komputer', pengarang: 'Eko Kurniawan', penerbit: 'Media Kita', status: 'Tersedia', foto: '02.jpeg' },
  { idbuku: 'B003', judulbuku: 'Laskar Pelangi', kategori: 'Fiksi', pengarang: 'Andrea Hirata', penerbit: 'Bentang Pustaka', status: 'Tersedia', foto: '03.jpeg' },
  { idbuku: 'B004', judulbuku: 'Bumi Manusia', kategori: 'Sastra', pengarang: 'Pramoedya Ananta Toer', penerbit: 'Hasta Mitra', status: 'Tersedia', foto: '04.jpeg' },
  { idbuku: 'B005', judulbuku: 'Algoritma dan Struktur Data', kategori: 'Ilmu Komputer', pengarang: 'Rinaldi Munir', penerbit: 'Informatika', status: 'Tersedia', foto: '002.jpeg' },
  { idbuku: 'B006', judulbuku: 'Pengantar Fisika Kuantum', kategori: 'Sains', pengarang: 'Prof. Supriyadi', penerbit: 'Penerbit Sains', status: 'Tersedia', foto: '012.jpeg' },
  { idbuku: 'B007', judulbuku: 'Sejarah Kerajaan Nusantara', kategori: 'Sejarah', pengarang: 'Drs. Sartono', penerbit: 'Balai Pustaka', status: 'Tersedia', foto: '01.jpeg' }
];

let inMemoryBooks = [...INITIAL_BOOKS];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const category = searchParams.get('category');

  let books: any[] = [];

  // 1. Try Cloud SQL
  try {
    const conditions = [];
    if (query && query.trim() !== '') {
      conditions.push(
        or(
          ilike(tbbuku.judulbuku, `%${query}%`),
          ilike(tbbuku.pengarang, `%${query}%`),
          ilike(tbbuku.kategori, `%${query}%`)
        )
      );
    }
    if (category && category !== 'Semua' && category.trim() !== '') {
      conditions.push(eq(tbbuku.kategori, category));
    }

    if (conditions.length > 0) {
      books = await db.select().from(tbbuku).where(and(...conditions));
    } else {
      books = await db.select().from(tbbuku);
    }
  } catch (err) {
    console.warn('Cloud SQL fetch warning:', err);
  }

  // 2. Try Firestore if Cloud SQL returned empty or failed
  if (!books || books.length === 0) {
    try {
      const snapshot = await adminDb.collection('books').get();
      if (!snapshot.empty) {
        books = snapshot.docs.map(doc => doc.data());
      }
    } catch (fsErr) {
      console.warn('Firestore fetch warning:', fsErr);
    }
  }

  // 3. Fallback to in-memory list
  if (!books || books.length === 0) {
    books = [...inMemoryBooks];
  }

  // Apply search and category filter if needed
  if (category && category !== 'Semua' && category.trim() !== '') {
    books = books.filter(b => b.kategori && b.kategori.toLowerCase() === category.toLowerCase());
  }

  if (query && query.trim() !== '') {
    const qLower = query.toLowerCase();
    books = books.filter(b => 
      (b.judulbuku && b.judulbuku.toLowerCase().includes(qLower)) || 
      (b.pengarang && b.pengarang.toLowerCase().includes(qLower)) || 
      (b.kategori && b.kategori.toLowerCase().includes(qLower))
    );
  }

  return NextResponse.json(books);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const bookObj = {
      idbuku: data.idbuku,
      judulbuku: data.judulbuku,
      kategori: data.kategori || 'Ilmu Komputer',
      pengarang: data.pengarang,
      penerbit: data.penerbit,
      foto: data.foto || '01.jpeg',
      status: data.status || 'Tersedia',
      createdAt: new Date().toISOString()
    };

    // 1. Save to Cloud SQL
    try {
      await db.insert(tbbuku).values(bookObj).onConflictDoNothing();
    } catch (sqlErr) {
      console.warn('Cloud SQL insert warning:', sqlErr);
    }

    // 2. Save to Firestore database collection 'books'
    try {
      await adminDb.collection('books').doc(bookObj.idbuku).set(bookObj, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore insert warning:', fsErr);
    }

    // 3. Save to in-memory list
    inMemoryBooks = [bookObj, ...inMemoryBooks.filter(b => b.idbuku !== bookObj.idbuku)];

    return NextResponse.json(bookObj);
  } catch (error) {
    console.error('Create book error:', error);
    return NextResponse.json({ error: 'Failed to create book' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();

    // 1. Update in Cloud SQL
    try {
      await db.update(tbbuku)
        .set({
          judulbuku: data.judulbuku,
          kategori: data.kategori,
          pengarang: data.pengarang,
          penerbit: data.penerbit,
          status: data.status,
          foto: data.foto
        })
        .where(eq(tbbuku.idbuku, data.idbuku));
    } catch (sqlErr) {
      console.warn('Cloud SQL update warning:', sqlErr);
    }

    // 2. Update in Firestore
    try {
      await adminDb.collection('books').doc(data.idbuku).set(data, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore update warning:', fsErr);
    }

    inMemoryBooks = inMemoryBooks.map(b => b.idbuku === data.idbuku ? { ...b, ...data } : b);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update book error:', error);
    return NextResponse.json({ error: 'Failed to update book' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    // 1. Delete from Cloud SQL
    try {
      await db.delete(tbbuku).where(eq(tbbuku.idbuku, id));
    } catch (sqlErr) {
      console.warn('Cloud SQL delete warning:', sqlErr);
    }

    // 2. Delete from Firestore
    try {
      await adminDb.collection('books').doc(id).delete();
    } catch (fsErr) {
      console.warn('Firestore delete warning:', fsErr);
    }

    inMemoryBooks = inMemoryBooks.filter(b => b.idbuku !== id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete book error:', error);
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 });
  }
}
