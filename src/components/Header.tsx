'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-gradient-to-r from-orange-50 to-amber-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🫕</span>
            <span className="text-xl font-bold text-orange-500">moltingpot</span>
            <sup className="text-[9px] text-cyan-400 ml-0.5">beta</sup>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/feed" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Feed
            </Link>
            <Link href="/contribute" className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Contribute
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
