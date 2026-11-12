import AdminNav from '@/components/admin/AdminNav';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function PanelLayout({ children }) {
  return (
    <div className="admin-cursor admin-light min-h-screen bg-[#F6F8FB] text-[#0F172A]">
      <AdminNav />
      <main className="admin-main px-4 md:px-8 pb-20 md:pb-10 min-h-screen">
        <AdminTopbar />
        {children}
      </main>
    </div>
  );
}
