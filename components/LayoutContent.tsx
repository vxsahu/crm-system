'use client';

import React from 'react';
import { usePathname } from "next/navigation";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { TopNav } from "@/components/TopNav";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    // For login/register pages, render without nav
    return <>{children}</>;
  }

  // For authenticated pages, render with TopNav and main layout
  return (
    <InventoryProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <TopNav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
           {children}
        </main>
      </div>
    </InventoryProvider>
  );
}
