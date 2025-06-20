import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from './hooks/useAuth';
import ClientLayout from './components/ClientLayout';
import ThemeProvider from './components/ThemeProvider';
import ThemeScript from './components/ThemeScript';
import './globals.css';
import { App } from 'antd';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AdonisJS + Next.js Template',
  description: 'Шаблон приложения с аутентификацией и ролями',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <title>AdonisJS + Next.js Template</title>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AntdRegistry>
          <ThemeProvider>
            <App>
              <AuthProvider>
                <ClientLayout>{children}</ClientLayout>
              </AuthProvider>
            </App>
          </ThemeProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
