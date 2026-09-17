import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Lexend_Giga, Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const lexend = Lexend_Giga({
  variable: '--font-lexend',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'Guia Flui Admin',
    template: '%s · Guia Flui Admin',
  },
  description: 'Painel administrativo do Guia Flui — eletropostos, avaliações e usuários.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${lexend.variable} h-full antialiased`}>
      <body className="h-full text-foreground">{children}</body>
    </html>
  );
}
