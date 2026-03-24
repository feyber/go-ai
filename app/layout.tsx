import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Go. | AI Video Commerce Agency',
  description: 'AI Video Commerce Agency providing daily exclusive videos.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-white bg-black min-h-screen flex flex-col" suppressHydrationWarning>
        <Providers>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
