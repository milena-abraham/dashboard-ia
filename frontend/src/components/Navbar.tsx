'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { BarChart3, LogOut, UserCircle } from 'lucide-react';

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
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Dashboard<span className="text-indigo-600">.IA</span></span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200/60">
                <UserCircle className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{user.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 px-3 py-2 rounded-lg transition-colors font-medium"
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
                className="text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-indigo-200 hover:opacity-95 transition-all"
              >
                Empezar gratis
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
