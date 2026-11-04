import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const admin = pgTable('admin', {
  idAdmin: serial('id_admin').primaryKey(),
  nmAdmin: varchar('nm_admin', { length: 35 }).notNull(),
  username: varchar('username', { length: 35 }).notNull(),
  password: varchar('password', { length: 35 }).notNull(),
});

export const tbanggota = pgTable('tbanggota', {
  idanggota: varchar('idanggota', { length: 5 }).primaryKey(),
  nama: varchar('nama', { length: 30 }).notNull(),
  jeniskelamin: varchar('jeniskelamin', { length: 10 }).notNull(),
  alamat: varchar('alamat', { length: 40 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  foto: varchar('foto', { length: 35 }).notNull(),
});

export const tbbuku = pgTable('tbbuku', {
  idbuku: varchar('idbuku', { length: 5 }).primaryKey(),
  judulbuku: varchar('judulbuku', { length: 50 }).notNull(),
  kategori: varchar('kategori', { length: 20 }).notNull(),
  pengarang: varchar('pengarang', { length: 35 }).notNull(),
  penerbit: varchar('penerbit', { length: 35 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('Tersedia'),
  foto: varchar('foto', { length: 35 }).notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
