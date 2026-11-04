"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Book, Users, Home, LogOut, Search, Plus } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { user, login, logout, getToken, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'beranda' | 'anggota' | 'buku'>('beranda');
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setFetching(true);
    const token = await getToken();
    const endpoint = activeTab === 'anggota' ? '/api/members' : activeTab === 'buku' ? '/api/books' : null;
    
    if (!endpoint) {
      setData([]);
      setFetching(false);
      return;
    }

    try {
      const res = await fetch(`${endpoint}?q=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Fetch data failed:", error);
    } finally {
      setFetching(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-6">Sistem Perpustakaan</h1>
          <p className="mb-8 text-gray-600">Silakan login untuk mengakses sistem.</p>
          <button 
            onClick={login}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">L</div>
          SIPUS
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('beranda')}
            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors", activeTab === 'beranda' ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-400")}
          >
            <Home size={20} /> Beranda
          </button>
          <button 
            onClick={() => setActiveTab('anggota')}
            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors", activeTab === 'anggota' ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-400")}
          >
            <Users size={20} /> Anggota
          </button>
          <button 
            onClick={() => setActiveTab('buku')}
            className={cn("w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors", activeTab === 'buku' ? "bg-blue-600 text-white" : "hover:bg-gray-800 text-gray-400")}
          >
            <Book size={20} /> Buku
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full" />
            <div className="text-sm truncate">{user.displayName}</div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>
          {activeTab !== 'beranda' && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari..." 
                  className="pl-10 pr-4 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus size={18} /> Tambah
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8">
          {activeTab === 'beranda' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium mb-2">Selamat Datang, {user.displayName}!</h3>
                <p className="text-gray-600">Sistem Informasi Perpustakaan Digital.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
                  <div className="text-gray-500 text-sm font-medium">TOTAL BUKU</div>
                  <div className="text-3xl font-bold mt-1">128</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
                  <div className="text-gray-500 text-sm font-medium">TOTAL ANGGOTA</div>
                  <div className="text-3xl font-bold mt-1">45</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-yellow-500">
                  <div className="text-gray-500 text-sm font-medium">PEMINJAMAN AKTIF</div>
                  <div className="text-3xl font-bold mt-1">12</div>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'anggota' || activeTab === 'buku') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No</th>
                    {activeTab === 'anggota' ? (
                      <>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Anggota</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Buku</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Judul</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </>
                    )}
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fetching ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Memuat data...</td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">Tidak ada data ditemukan.</td></tr>
                  ) : data.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                      {activeTab === 'anggota' ? (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.idanggota}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.nama}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.jeniskelamin}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.alamat}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 text-sm text-gray-900">{item.idbuku}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{item.judulbuku}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.kategori}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <span className={cn("px-2 py-1 rounded-full text-xs", item.status === 'Tersedia' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                              {item.status}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-6 py-4 text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
