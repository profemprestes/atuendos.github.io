import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Head from './head';
import { Scripts } from '@/components/Scripts';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <Head />
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased scroll-smooth transition-colors duration-500`}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

