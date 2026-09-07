import type { Metadata } from 'next';
import { DM_Serif_Display, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const serifFont = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Dashboard IA | Analisis Inteligente de Datos',
  description: 'Convierte tus datos en decisiones inteligentes con IA. Analisis automatico, graficos y predicciones.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${serifFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <body className={`${sansFont.className} antialiased bg-[#faf8f5] text-[#111111]`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a2e',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}
