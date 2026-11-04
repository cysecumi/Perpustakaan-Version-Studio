"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Book, Users, Home, LogOut, Search, Plus, Edit2, Trash2, Printer, X, CheckCircle, RefreshCw, AlertTriangle, Filter, Menu } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BookType {
  idbuku: string;
  judulbuku: string;
  kategori: string;
  pengarang: string;
  penerbit: string;
  status: string;
  foto: string;
}

interface MemberType {
  idanggota: string;
  nama: string;
  jeniskelamin: string;
  alamat: string;
  status: string;
  foto: string;
}

export default function Dashboard() {
  const { user, login, loginDemo, logout, getToken, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'beranda' | 'anggota' | 'buku'>('beranda');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [books, setBooks] = useState<BookType[]>([]);
  const [members, setMembers] = useState<MemberType[]>([]);
  const [stats, setStats] = useState({ totalBooks: 7, totalMembers: 4, activeLoans: 0 });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [fetching, setFetching] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Modals state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [bookForm, setBookForm] = useState({
    idbuku: '',
    judulbuku: '',
    kategori: 'Ilmu Komputer',
    pengarang: '',
    penerbit: '',
    status: 'Tersedia',
    foto: '01.jpeg'
  });

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberType | null>(null);
  const [memberForm, setMemberForm] = useState({
    idanggota: '',
    nama: '',
    jeniskelamin: 'Pria',
    alamat: '',
    status: 'Tidak Meminjam',
    foto: '002.jpeg'
  });

  const [cardModalMember, setCardModalMember] = useState<MemberType | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<{ type: 'buku' | 'anggota', id: string, name: string } | null>(null);

  useEffect(() => {
    fetchStats();
    if (user) {
      fetchData();
    }
  }, [user, activeTab, selectedCategory]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const fetchData = async () => {
    setFetching(true);
    const token = await getToken();
    const endpoint = activeTab === 'anggota' ? '/api/members' : activeTab === 'buku' ? '/api/books' : null;
    
    if (!endpoint) {
      setFetching(false);
      return;
    }

    try {
      let url = `${endpoint}?q=${encodeURIComponent(searchQuery)}`;
      if (activeTab === 'buku' && selectedCategory !== 'Semua') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (Array.isArray(json)) {
        if (activeTab === 'buku') setBooks(json);
        if (activeTab === 'anggota') setMembers(json);
      } else {
        if (activeTab === 'buku') setBooks([]);
        if (activeTab === 'anggota') setMembers([]);
      }
    } catch (error) {
      console.error("Fetch data failed:", error);
      showToast("Gagal mengambil data dari server", 'error');
    } finally {
      setFetching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // BOOK ACTIONS
  const openAddBookModal = () => {
    setEditingBook(null);
    setBookForm({
      idbuku: `BK${Math.floor(100 + Math.random() * 900)}`,
      judulbuku: '',
      kategori: 'Ilmu Komputer',
      pengarang: '',
      penerbit: '',
      status: 'Tersedia',
      foto: '01.jpeg'
    });
    setShowBookModal(true);
  };

  const openEditBookModal = (book: BookType) => {
    setEditingBook(book);
    setBookForm({
      idbuku: book.idbuku,
      judulbuku: book.judulbuku,
      kategori: book.kategori,
      pengarang: book.pengarang,
      penerbit: book.penerbit,
      status: book.status,
      foto: book.foto || '01.jpeg'
    });
    setShowBookModal(true);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const method = editingBook ? 'PUT' : 'POST';
    const url = '/api/books';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bookForm)
      });

      if (res.ok) {
        setShowBookModal(false);
        showToast(editingBook ? "Buku berhasil diperbarui!" : "Buku baru berhasil ditambahkan!");
        fetchData();
        fetchStats();
      } else {
        showToast("Gagal menyimpan data buku", 'error');
      }
    } catch (err) {
      console.error("Save book error:", err);
      showToast("Terjadi kesalahan saat menyimpan buku", 'error');
    }
  };

  const executeDelete = async () => {
    if (!deletingTarget) return;
    const token = await getToken();
    const { type, id } = deletingTarget;
    const endpoint = type === 'buku' ? '/api/books' : '/api/members';

    try {
      const res = await fetch(`${endpoint}?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast(`Data ${type === 'buku' ? 'Buku' : 'Anggota'} berhasil dihapus!`);
        setDeletingTarget(null);
        fetchData();
        fetchStats();
      } else {
        showToast(`Gagal menghapus ${type}`, 'error');
      }
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Terjadi kesalahan sistem", 'error');
    }
  };

  // MEMBER ACTIONS
  const openAddMemberModal = () => {
    setEditingMember(null);
    setMemberForm({
      idanggota: `0${Math.floor(10 + Math.random() * 90)}`,
      nama: '',
      jeniskelamin: 'Pria',
      alamat: '',
      status: 'Tidak Meminjam',
      foto: '002.jpeg'
    });
    setShowMemberModal(true);
  };

  const openEditMemberModal = (member: MemberType) => {
    setEditingMember(member);
    setMemberForm({
      idanggota: member.idanggota,
      nama: member.nama,
      jeniskelamin: member.jeniskelamin,
      alamat: member.alamat,
      status: member.status,
      foto: member.foto || '002.jpeg'
    });
    setShowMemberModal(true);
  };

  const handleMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = await getToken();
    const method = editingMember ? 'PUT' : 'POST';
    const url = '/api/members';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(memberForm)
      });

      if (res.ok) {
        setShowMemberModal(false);
        showToast(editingMember ? "Data anggota berhasil diperbarui!" : "Anggota baru berhasil ditambahkan!");
        fetchData();
        fetchStats();
      } else {
        showToast("Gagal menyimpan data anggota", 'error');
      }
    } catch (err) {
      console.error("Save member error:", err);
      showToast("Terjadi kesalahan saat menyimpan anggota", 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Memuat Sistem Perpustakaan...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="p-8 bg-white rounded-xl shadow-xl w-full max-w-md text-center border border-slate-200">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-blue-500/30">
            P
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Sistem Perpustakaan (SIPUS)</h1>
          <p className="mb-6 text-slate-500 text-sm">Masuk untuk mengelola data buku, anggota, dan transaksi perpustakaan.</p>
          
          <div className="space-y-3">
            <button 
              type="button"
              onClick={loginDemo}
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <CheckCircle size={18} /> Masuk Mode Admin Perpustakaan
            </button>

            <button 
              type="button"
              onClick={login}
              className="w-full bg-slate-100 text-slate-700 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-200 transition-all active:scale-95 border border-slate-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              Login dengan Google OAuth
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans select-none overflow-hidden">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={cn(
          "fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold flex items-center gap-2 transition-all animate-bounce",
          toastMsg.type === 'success' ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        )}>
          {toastMsg.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toastMsg.text}
        </div>
      )}

      {/* Sidebar Overlay on Mobile */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)} 
          className="fixed inset-0 bg-slate-900/60 z-20 md:hidden backdrop-blur-xs" 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col shadow-xl z-30 transition-transform duration-200 md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md">
              P
            </div>
            <div>
              <div className="font-bold text-base leading-none">PERPUSTAKAAN</div>
              <div className="text-xs text-slate-400 mt-1">Sistem Informasi Digital</div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button 
            type="button"
            onClick={() => { setActiveTab('beranda'); setMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95", 
              activeTab === 'beranda' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Home size={18} /> Beranda
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('anggota'); setMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95", 
              activeTab === 'anggota' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Users size={18} /> Data Anggota
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('buku'); setMobileMenuOpen(false); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer active:scale-95", 
              activeTab === 'buku' ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "hover:bg-slate-800 text-slate-400 hover:text-white"
            )}
          >
            <Book size={18} /> Data Buku
          </button>
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-semibold text-sm border border-blue-500/30">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate text-slate-200">{user.displayName || 'Administrator'}</div>
              <div className="text-xs text-slate-500 truncate">{user.isDemo ? 'Mode Admin Demo' : user.email}</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-500/20 cursor-pointer active:scale-95"
          >
            <LogOut size={14} /> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              type="button" 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize truncate">
              {activeTab === 'beranda' && 'Beranda Utama'}
              {activeTab === 'anggota' && 'Kelola Data Anggota'}
              {activeTab === 'buku' && 'Kelola Data Buku'}
            </h1>
          </div>

          {activeTab !== 'beranda' && (
            <div className="flex items-center gap-2 md:gap-3">
              {/* Category Filter Dropdown for Books */}
              {activeTab === 'buku' && (
                <div className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 text-xs md:text-sm">
                  <Filter size={14} className="text-slate-400 hidden sm:inline" />
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent font-medium text-slate-700 text-xs md:text-sm focus:outline-none cursor-pointer"
                  >
                    <option value="Semua">Semua Kategori</option>
                    <option value="Ilmu Komputer">Ilmu Komputer</option>
                    <option value="Fiksi">Fiksi</option>
                    <option value="Sastra">Sastra</option>
                    <option value="Sains">Sains</option>
                    <option value="Sejarah">Sejarah</option>
                  </select>
                </div>
              )}

              <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder={activeTab === 'buku' ? "Cari judul / pengarang..." : "Cari nama / alamat..."} 
                  className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm w-44 md:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {activeTab === 'buku' && (
                <button 
                  type="button"
                  onClick={openAddBookModal}
                  className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">Tambah Buku</span><span className="sm:hidden">Tambah</span>
                </button>
              )}

              {activeTab === 'anggota' && (
                <button 
                  type="button"
                  onClick={openAddMemberModal}
                  className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer shrink-0"
                >
                  <Plus size={16} /> <span className="hidden sm:inline">Tambah Anggota</span><span className="sm:hidden">Tambah</span>
                </button>
              )}
            </div>
          )}
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {activeTab === 'beranda' && (
            <div className="space-y-6 max-w-6xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 rounded-2xl text-white shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold mb-2">Selamat Datang di Sistem Perpustakaan Digital!</h2>
                <p className="text-blue-100 max-w-2xl text-sm md:text-base leading-relaxed">
                  Kelola data anggota, persediaan buku, serta informasi peminjaman dengan cepat, mudah, dan aman.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">TOTAL KOLEKSI BUKU</div>
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{stats.totalBooks}</div>
                  </div>
                  <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Book size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">TOTAL ANGGOTA</div>
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{stats.totalMembers}</div>
                  </div>
                  <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Users size={22} />
                  </div>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">STATUS PEMINJAMAN</div>
                    <div className="text-2xl md:text-3xl font-extrabold text-slate-800 mt-1">{stats.activeLoans}</div>
                  </div>
                  <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Home size={22} />
                  </div>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-2">
                <div 
                  onClick={() => setActiveTab('anggota')}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-98"
                >
                  <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Users className="text-blue-600" size={20} /> Manajemen Anggota
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">Lihat daftar anggota terdaftar, tambah data anggota baru, atau cetak kartu anggota perpustakaan.</p>
                  <span className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                    Buka Data Anggota &rarr;
                  </span>
                </div>

                <div 
                  onClick={() => setActiveTab('buku')}
                  className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-98"
                >
                  <h3 className="font-bold text-slate-800 text-lg mb-2 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                    <Book className="text-blue-600" size={20} /> Katalog Buku
                  </h3>
                  <p className="text-slate-600 text-sm mb-4">Cari buku berdasarkan judul, pengarang, atau kategori, serta perbarui ketersediaan koleksi.</p>
                  <span className="text-blue-600 font-semibold text-sm flex items-center gap-1">
                    Buka Data Buku &rarr;
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB BUKU */}
          {activeTab === 'buku' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">No</th>
                    <th className="px-5 py-3.5">ID Buku</th>
                    <th className="px-5 py-3.5">Judul Buku</th>
                    <th className="px-5 py-3.5">Kategori</th>
                    <th className="px-5 py-3.5">Pengarang</th>
                    <th className="px-5 py-3.5">Penerbit</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Opsi / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {fetching ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Memuat data buku...
                      </td>
                    </tr>
                  ) : books.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                        Tidak ada data buku ditemukan {selectedCategory !== 'Semua' && `untuk kategori "${selectedCategory}"`}.
                      </td>
                    </tr>
                  ) : (
                    books.map((b, idx) => (
                      <tr key={b.idbuku} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{b.idbuku}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{b.judulbuku}</td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700 font-medium border border-slate-200">
                            {b.kategori}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{b.pengarang}</td>
                        <td className="px-5 py-4 text-slate-600">{b.penerbit}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold inline-block",
                            b.status === 'Tersedia' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
                          )}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => openEditBookModal(b)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                              title="Edit Buku"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDeletingTarget({ type: 'buku', id: b.idbuku, name: b.judulbuku })}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                              title="Hapus Buku"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB ANGGOTA */}
          {activeTab === 'anggota' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">No</th>
                    <th className="px-5 py-3.5">ID Anggota</th>
                    <th className="px-5 py-3.5">Nama</th>
                    <th className="px-5 py-3.5">Jenis Kelamin</th>
                    <th className="px-5 py-3.5">Alamat</th>
                    <th className="px-5 py-3.5">Status Peminjaman</th>
                    <th className="px-5 py-3.5 text-center">Cetak / Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {fetching ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                        Memuat data anggota...
                      </td>
                    </tr>
                  ) : members.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        Tidak ada data anggota ditemukan.
                      </td>
                    </tr>
                  ) : (
                    members.map((m, idx) => (
                      <tr key={m.idanggota} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4 font-medium text-slate-400">{idx + 1}</td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{m.idanggota}</td>
                        <td className="px-5 py-4 font-medium text-slate-900">{m.nama}</td>
                        <td className="px-5 py-4 text-slate-600">{m.jeniskelamin}</td>
                        <td className="px-5 py-4 text-slate-600">{m.alamat}</td>
                        <td className="px-5 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-semibold inline-block",
                            m.status === 'Tidak Meminjam' ? "bg-slate-100 text-slate-700 border border-slate-200" : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          )}>
                            {m.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              type="button"
                              onClick={() => setCardModalMember(m)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-slate-300 cursor-pointer active:scale-95"
                              title="Cetak Kartu Anggota"
                            >
                              <Printer size={14} /> Cetak Kartu
                            </button>
                            <button 
                              type="button"
                              onClick={() => openEditMemberModal(m)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                              title="Edit Data"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => setDeletingTarget({ type: 'anggota', id: m.idanggota, name: m.nama })}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer active:scale-90"
                              title="Hapus Data"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">Hapus Data Ini?</h3>
            <p className="text-slate-600 text-sm mb-6">
              Apakah Anda yakin ingin menghapus {deletingTarget.type === 'buku' ? 'buku' : 'anggota'} <span className="font-bold text-slate-900">&quot;{deletingTarget.name}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => setDeletingTarget(null)}
                className="w-1/2 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={executeDelete}
                className="w-1/2 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors shadow-md shadow-red-600/20 cursor-pointer active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUKU (TAMBAH / EDIT) */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingBook ? 'Edit Data Buku' : 'Tambah Buku Baru'}</h3>
              <button type="button" onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleBookSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Buku</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingBook}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                  value={bookForm.idbuku}
                  onChange={(e) => setBookForm({...bookForm, idbuku: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Buku</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={bookForm.judulbuku}
                  onChange={(e) => setBookForm({...bookForm, judulbuku: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori Buku</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                    value={bookForm.kategori}
                    onChange={(e) => setBookForm({...bookForm, kategori: e.target.value})}
                  >
                    <option value="Ilmu Komputer">Ilmu Komputer</option>
                    <option value="Fiksi">Fiksi</option>
                    <option value="Sastra">Sastra</option>
                    <option value="Sains">Sains</option>
                    <option value="Sejarah">Sejarah</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Ketersediaan</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                    value={bookForm.status}
                    onChange={(e) => setBookForm({...bookForm, status: e.target.value})}
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Dipinjam">Dipinjam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pengarang</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={bookForm.pengarang}
                  onChange={(e) => setBookForm({...bookForm, pengarang: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Penerbit</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={bookForm.penerbit}
                  onChange={(e) => setBookForm({...bookForm, penerbit: e.target.value})}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
                >
                  Simpan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANGGOTA (TAMBAH / EDIT) */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingMember ? 'Edit Data Anggota' : 'Input Data Anggota'}</h3>
              <button type="button" onClick={() => setShowMemberModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMemberSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Anggota</label>
                <input 
                  type="text" 
                  required
                  disabled={!!editingMember}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100"
                  value={memberForm.idanggota}
                  onChange={(e) => setMemberForm({...memberForm, idanggota: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={memberForm.nama}
                  onChange={(e) => setMemberForm({...memberForm, nama: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jenis Kelamin</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                    value={memberForm.jeniskelamin}
                    onChange={(e) => setMemberForm({...memberForm, jeniskelamin: e.target.value})}
                  >
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status Peminjaman</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                    value={memberForm.status}
                    onChange={(e) => setMemberForm({...memberForm, status: e.target.value})}
                  >
                    <option value="Tidak Meminjam">Tidak Meminjam</option>
                    <option value="Meminjam">Meminjam</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Alamat Lengkap</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={memberForm.alamat}
                  onChange={(e) => setMemberForm({...memberForm, alamat: e.target.value})}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CETAK KARTU ANGGOTA */}
      {cardModalMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Printer size={16} /> Pratinjau Kartu Anggota
              </h3>
              <button type="button" onClick={() => setCardModalMember(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Card Badge Design */}
              <div className="border-2 border-slate-800 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden shadow-inner">
                <div className="text-center border-b border-slate-200 pb-3 mb-4">
                  <h4 className="font-extrabold text-blue-900 text-sm tracking-wider uppercase">PERPUSTAKAAN UMUM</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-widest">KARTU TANDA ANGGOTA</p>
                </div>

                <div className="flex gap-4 items-center">
                  <div className="w-20 h-24 bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-600 font-bold text-xl">
                      {cardModalMember.nama.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ID ANGGOTA</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">{cardModalMember.idanggota}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">NAMA</span>
                      <span className="font-bold text-slate-900">{cardModalMember.nama}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">JENIS KELAMIN</span>
                      <span>{cardModalMember.jeniskelamin}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">ALAMAT</span>
                      <span className="truncate block max-w-[180px]">{cardModalMember.alamat}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Berlaku Selamanya</span>
                  <span className="font-bold text-blue-800">SIPUS DIGITAL</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setCardModalMember(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95"
              >
                Tutup
              </button>
              <button 
                type="button"
                onClick={() => {
                  showToast("Kartu Anggota dicetak!");
                  setCardModalMember(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer active:scale-95"
              >
                <Printer size={14} /> Cetak Kartu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
