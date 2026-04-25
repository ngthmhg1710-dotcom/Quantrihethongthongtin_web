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
              Premium cosmetics for the modern woman. Embrace your natural beauty.
            </p>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="text-gray-600 hover:text-black">All Products</Link></li>
              <li><Link to="/products?category=Serum" className="text-gray-600 hover:text-black">Serums</Link></li>
              <li><Link to="/products?category=Moisturizer" className="text-gray-600 hover:text-black">Moisturizers</Link></li>
              <li><Link to="/products?category=Cleanser" className="text-gray-600 hover:text-black">Cleansers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-600 hover:text-black">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-black">Contact</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black">Shipping Info</Link></li>
              <li><Link to="#" className="text-gray-600 hover:text-black">Returns</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-['Poppins'] font-semibold mb-4">Follow Us</h4>
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
          <p>&copy; 2026 Glow Cosmetics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
