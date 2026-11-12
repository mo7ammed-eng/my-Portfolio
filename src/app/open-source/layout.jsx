import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Open Source',
  description: 'Published repositories, source code and engineering notes from Mohammed Waleed.',
};

export default function OpenSourceLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#09090F] text-[#F5F3FF]">
      <div className="grain-overlay" />
      <Navbar />
      <main className="relative z-10 min-h-screen px-5 md:px-20 pt-28 md:pt-36 pb-20">{children}</main>
      <Footer />
    </div>
  );
}
