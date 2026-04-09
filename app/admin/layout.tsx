import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-dark-bg flex">
      <AdminSidebar />
      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
