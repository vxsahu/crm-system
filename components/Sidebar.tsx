'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackageSearch, Settings, LogOut, Menu, Globe, User } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-gray-200 p-4 flex justify-between items-center fixed top-0 left-0 right-0 h-16 z-40">
         <div className="relative h-8 w-32">
           <Image 
            src="/logo.webp" 
            alt="FixSwift Logo" 
            fill
            className="object-contain"
            priority
           />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
           <Menu className="w-5 h-5" />
         </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white text-slate-600 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} pt-16 lg:pt-0`}>
        <div className="hidden lg:flex items-center h-20 px-6">
          <div className="relative h-8 w-32">
            <Image 
              src="https://i0.wp.com/fixswift.in/wp-content/uploads/2024/10/Group-69084.webp" 
              alt="FixSwift Logo" 
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        
        <div className="px-4 py-2">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Overview</p>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium ${isActive('/dashboard') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            
            <Link
              href="/inventory"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium ${isActive('/inventory') ? 'bg-slate-100 text-slate-900' : 'hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <PackageSearch className="w-4 h-4" />
              <span>Inventory & Billing</span>
            </Link>
          </nav>
        </div>

        <div className="px-4 py-2 mt-4">
          <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">External</p>
          <nav className="space-y-1">
            <a
              href="https://fixswift.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-slate-50 hover:text-slate-900 text-sm font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Globe className="w-4 h-4" />
              <span>Go to Fixswift</span>
            </a>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-100">
           {/* User Profile */}
           {user && (
             <div className="mb-3 px-4 py-2">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                   <User className="w-4 h-4 text-slate-600" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                   <p className="text-xs text-slate-500 truncate">{user.email}</p>
                 </div>
               </div>
             </div>
           )}
           
           <div className="space-y-1">
             <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-slate-600 hover:text-slate-900 text-sm font-medium">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
             </div>
             <button
               onClick={handleLogout}
               className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium"
             >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
             </button>
           </div>
        </div>
      </aside>
    </>
  );
}
