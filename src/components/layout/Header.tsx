import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/common/Button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-primary-600 font-bold text-2xl">營養好朋友</span>
          <span className="ml-1 text-gray-500 text-sm hidden sm:inline">NutriPal</span>
        </Link>

        {/* 桌面導航 */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-600 hover:text-primary-600 font-medium">
            首頁
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-primary-600 font-medium">
            關於我們
          </Link>
          <Link href="/survey" className="text-gray-600 hover:text-primary-600 font-medium">
            健康諮詢
          </Link>
          <Link href="/knowledge" className="text-gray-600 hover:text-primary-600 font-medium">
            營養知識庫
          </Link>
          <Button href="/survey" variant="primary" size="sm">
            開始諮詢
          </Button>
        </nav>

        {/* 手機選單按鈕 */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 手機導航選單 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-3 space-y-3">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              首頁
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              關於我們
            </Link>
            <Link
              href="/survey"
              className="block px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              健康諮詢
            </Link>
            <Link
              href="/knowledge"
              className="block px-3 py-2 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              營養知識庫
            </Link>
            <div className="pt-2">
              <Button
                href="/survey"
                variant="primary"
                fullWidth
                onClick={() => setIsMenuOpen(false)}
              >
                開始健康諮詢
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 