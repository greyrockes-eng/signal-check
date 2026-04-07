'use client';

import { Shield, Bell } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2540] bg-[#0c0f1a]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-none">
                Signal Check
              </h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase">
                Truth in every story
              </p>
            </div>
          </Link>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[#151929] transition-colors">
              <Bell size={18} className="text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full pulse-dot" />
            </button>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#151929] border border-[#1e2540] rounded-lg px-3 py-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full pulse-dot" />
              Live
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
