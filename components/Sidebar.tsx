'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PackageSearch, Settings, LogOut, Menu, Globe, User } from 'lucide-react';
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
         <img 
          src="https://i0.wp.com/fixswift.in/wp-content/uploads/2024/10/Group-69084.webp" 
          alt="FixSwift Logo" 
          className="h-8 w-auto object-contain" 
         />
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md">
           <Menu className="w-5 h-5" />
         </button>
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} pt-16 lg:pt-0`}>
        <div className="hidden lg:flex items-center justify-center h-16 bg-gray-950 border-b border-gray-800 px-4">
          <img 
            src="https://i0.wp.com/fixswift.in/wp-content/uploads/2024/10/Group-69084.webp" 
            alt="FixSwift Logo" 
            className="h-8 w-auto object-contain" 
          />
        </div>
        
        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all text-sm ${isActive('/dashboard') ? 'bg-brand-600 text-white' : 'hover:bg-gray-700 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          <Link
            href="/inventory"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all text-sm ${isActive('/inventory') ? 'bg-brand-600 text-white' : 'hover:bg-gray-700 hover:text-white'}`}
          >
            <PackageSearch className="w-4 h-4" />
            <span className="font-medium">Inventory & Billing</span>
          </Link>

          <a
            href="https://fixswift.in"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all hover:bg-gray-700 hover:text-white text-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Globe className="w-4 h-4" />
            <span className="font-medium">Go to Fixswift</span>
          </a>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
           {/* User Profile */}
           {user && (
             <div className="mb-3 px-4 py-2 bg-gray-800 rounded-md">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                   <User className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-medium text-white truncate">{user.name}</p>
                   <p className="text-xs text-gray-400 truncate">{user.email}</p>
                 </div>
               </div>
             </div>
           )}
           
           <div className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-700 transition-colors cursor-pointer text-gray-400 hover:text-white text-sm">
              <Settings className="w-4 h-4" />
              <span className="font-medium">Settings</span>
           </div>
           <button
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-red-700/30 text-red-400 hover:text-red-300 transition-colors mt-1 text-sm"
           >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
           </button>
        </div>
      </aside>
    </>
  );
}
