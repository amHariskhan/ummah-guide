import { Suspense } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminUserCard from "@/components/admin/AdminUserCard";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-screen flex-1 bg-slate-50">
      <AdminSidebar
        userCard={
          <Suspense
            fallback={<div className="h-24 animate-pulse rounded-xl bg-gray-100" />}
          >
            <AdminUserCard />
          </Suspense>
        }
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}