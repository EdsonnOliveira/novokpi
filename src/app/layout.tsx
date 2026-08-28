import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DastoneAssets } from '@/components/dastone/DastoneAssets';
import { NavigationProgress } from '@/components/dastone/NavigationProgress';
import './globals.css';

export const metadata: Metadata = {
  title: 'Novo KPI',
  description: 'Gestão para lojas de veículos',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <DastoneAssets />
      </head>
      <body>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
