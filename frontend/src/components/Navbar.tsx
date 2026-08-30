'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Share2, LogOut, UserCircle, Layers, Activity } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="w-full bg-white border-b-2 border-[#111] sticky top-0 z-50 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Share2 className="w-6 h-6 text-mio-violet" strokeWidth={2.5} />
            <span className="text-2xl font-extrabold text-gray-900 tracking-wide">MIO</span>
          </div>
        </Link>

        <div className="flex items-center gap-6">
          {user && (
            <div className="flex items-center gap-6">
              {['tadeomunozgarces@gmail.com', 'milenapabraham@gmail.com'].includes(user.email || '') && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-900 bg-mio-lime border-2 border-[#111] shadow-[3px_3px_0px_#111] hover:shadow-none hover:translate-y-[2px] hover:translate-x-[2px] transition-all px-3 py-1.5"
                >
                  <Activity className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Link
                href="/projects"
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-mio-violet transition-colors"
              >
                <Layers className="w-4 h-4" />
                Mis Proyectos
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-1.5 rounded-none border border-[#111] border-2/60">
                <UserCircle className="w-4 h-4 text-mio-violet" />
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-3 py-2 rounded-none transition-colors font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-900 bg-gradient-to-r from-mio-lime to-[#c8ff6a] px-4 py-2 rounded-none shadow-[4px_4px_0px_#111] hover:shadow-mio-violet/30 hover:opacity-95 transition-all"
              >
                Empezar gratis
              </Link>
            </div>
          )}
          </div>
        </div>
      </div>
    </nav>
  );
}
