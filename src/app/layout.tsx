import type { Metadata } from 'next';
import { StoreProvider } from '@/context/store-context';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SearchModal } from '@/components/ui/SearchModal';
import { QuickViewModal } from '@/components/products/QuickViewModal';
import { ToastContainer } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'JILLU KLOSET — WEAR YOUR STORY',
  description: 'Premium luxury fashion for the ones who choose confidence over trends. Discover curated streetwear, fine tailoring, archival denim, and artisanal footwear.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080807] text-[#F4EFE7] flex flex-col font-sans selection:bg-[#C5A880] selection:text-[#080807]">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <SearchModal />
          <QuickViewModal />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
