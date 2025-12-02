'use client';

import { usePathname } from "next/navigation";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { Sidebar } from "@/components/Sidebar";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    // For login/register pages, render without sidebar
    return <>{children}</>;
  }

  // For authenticated pages, render with sidebar and main layout
  return (
    <InventoryProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 lg:p-8 pt-20 lg:pt-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </InventoryProvider>
  );
}
