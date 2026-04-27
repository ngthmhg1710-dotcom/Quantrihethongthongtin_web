import { Link } from 'react-router';
import { ShoppingCart, User, Search, Menu, X, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import React, { useState } from 'react';
import { toast } from 'sonner';

export function Header() {
  const { cart, user, logout, wishlistIds } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistIds.length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#FFE4E9]" />
            <span className="font-['Poppins'] text-xl font-semibold">Glow</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm hover:text-[#FFC0CB] transition-colors">
              Trang chủ
            </Link>
            <Link to="/products" className="text-sm hover:text-[#FFC0CB] transition-colors">
              Cửa hàng
            </Link>
            <Link to="/about" className="text-sm hover:text-[#FFC0CB] transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-sm hover:text-[#FFC0CB] transition-colors">
              Liên hệ
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              to="/products?focus=search"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="w-5 h-5" />
            </Link>

            <Link
              to={user ? '/dashboard?tab=wishlist' : '/login?redirect=%2Fdashboard%3Ftab%3Dwishlist'}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Wishlist"
              onClick={() => {
                if (!user) {
                  toast.error('Vui lòng đăng nhập để xem danh sách yêu thích');
                }
              }}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFC0CB] text-black text-xs min-w-5 h-5 px-1 rounded-full flex items-center justify-center font-semibold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Tài khoản của tôi
                  </Link>
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50">
                      Trang quản trị
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}

            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FFC0CB] text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-sm hover:text-[#FFC0CB] transition-colors">
                Trang chủ
              </Link>
              <Link to="/products" className="text-sm hover:text-[#FFC0CB] transition-colors">
                Cửa hàng
              </Link>
              <Link to="/about" className="text-sm hover:text-[#FFC0CB] transition-colors">
                Giới thiệu
              </Link>
              <Link to="/contact" className="text-sm hover:text-[#FFC0CB] transition-colors">
                Liên hệ
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
