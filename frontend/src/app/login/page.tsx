'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import toast from 'react-hot-toast';
import { BarChart3, Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor completá todos los campos');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('¡Cuenta creada exitosamente!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('¡Sesión iniciada!');
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.error('Email o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        toast.error('Este email ya está registrado. Intentá iniciar sesión.');
      } else if (err.code === 'auth/weak-password') {
        toast.error('La contraseña debe tener al menos 6 caracteres.');
      } else {
        toast.error(err.message || 'Ocurrió un error al autenticar.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('¡Autenticado con Google!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      toast.error('Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafc] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
          <div className="w-10 h-10 rounded-none bg-gradient-to-tr from-mio-lime to-[#c8ff6a] flex items-center justify-center text-gray-900 shadow-[6px_6px_0px_#111] shadow-mio-lime/40">
            <BarChart3 className="w-5 h-5" />
          </div>
          <span>Dashboard<span className="text-mio-violet">.IA</span></span>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isRegister ? 'Creá tu cuenta gratis' : 'Ingresá a tu cuenta'}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés una cuenta?'}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="font-semibold text-mio-violet hover:text-indigo-500 transition-colors"
          >
            {isRegister ? 'Iniciá sesión acá' : 'Registrate gratis'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[4px_4px_0px_#111] border border-[#111] border-2 rounded-none">
          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative rounded-none shadow-[4px_4px_0px_#111]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="block w-full pl-10 pr-4 py-3 border border-[#111] border-2 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-mio-violet focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative rounded-none shadow-[4px_4px_0px_#111]">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-4 py-3 border border-[#111] border-2 rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-mio-violet focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-none bg-gradient-to-r from-mio-lime to-[#c8ff6a] text-gray-900 font-semibold text-sm shadow-[6px_6px_0px_#111] shadow-mio-violet/30 hover:shadow-mio-violet/40 hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                'Procesando...'
              ) : (
                <>
                  <span>{isRegister ? 'Registrarse' : 'Ingresar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#111] border-2" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">O continuar con</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full mt-4 py-3 px-4 border border-[#111] border-2 rounded-none text-sm font-medium text-gray-700 bg-white hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="mt-4 pt-4 border-t border-[#111] border-2 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-mio-violet hover:text-mio-violet/90 bg-mio-violet/10/70 hover:bg-indigo-100/70 px-4 py-2 rounded-none transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explorar Dashboard en Modo Demo (sin cuenta)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
