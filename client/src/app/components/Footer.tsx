import { Link } from 'react-router';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#FFE4E9] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FFC0CB] to-[#FFE4E9]" />
              <span className="font-['Poppins'] text-xl font-semibold">Glow</span>
            </div>
            <p className="text-sm text-gray-600">
              Mỹ phẩm cao cấp cho phụ nữ hiện đại. Tôn vinh vẻ đẹp tự nhiên của bạn.
            </p>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Mua sắm</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-gray-600 hover:text-black">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=Serum" className="text-gray-600 hover:text-black">Serum</Link></li>
              <li><Link to="/products?category=Moisturizer" className="text-gray-600 hover:text-black">Kem dưỡng ẩm</Link></li>
              <li><Link to="/products?category=Cleanser" className="text-gray-600 hover:text-black">Sữa rửa mặt</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-black">Về chúng tôi</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-black">Liên hệ</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black">Thông tin giao hàng</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black">Đổi trả</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Theo dõi chúng tôi</h4>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#FFC0CB] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#FFC0CB] transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#FFC0CB] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white rounded-full hover:bg-[#FFC0CB] transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#FFC0CB] mt-8 pt-8 text-center text-sm text-gray-600">
          <p>&copy; 2026 Glow Cosmetics. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
