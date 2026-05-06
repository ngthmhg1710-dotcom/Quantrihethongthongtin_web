import { Link } from 'react-router';
import { ArrowRight, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVnd, SHIPPING_FREE_SUBTOTAL_MIN_LEGACY } from '../utils/currency';

export function Homepage() {
  const { products } = useApp();
  const featuredProducts = products.filter(p => p.featured);
  const routineProductIds = [2, 4, 1, 3, 6];
  const routineSteps = routineProductIds
    .map(id => products.find(p => p.id === id))
    .filter(p => p !== undefined);

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#FFE4E9] to-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-['Poppins'] text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Khám phá
                <span className="block text-[#D76F8A] font-extrabold">Vẻ đẹp tự nhiên</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Bộ chăm sóc da cao cấp dành cho phụ nữ hiện đại. Nuôi dưỡng làn da với những sản phẩm an toàn và hiệu quả.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/products"
                  className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  Mua ngay
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="bg-[#FFC0CB] text-black px-8 py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
                >
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/hero2.jpeg"
                alt="Hero"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <p className="text-sm text-gray-600">Được tin dùng bởi</p>
                <p className="text-2xl font-bold">50,000+</p>
                <p className="text-sm text-gray-600">Khách hàng hài lòng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Poppins'] text-4xl font-bold mb-4">Sản phẩm nổi bật</h2>
            <p className="text-gray-600">Các sản phẩm bán chạy nhất của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map(product => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-[#FFC0CB] text-[#FFC0CB]' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">({product.rating})</span>
                  </div>
                  <h3 className="font-['Poppins'] font-semibold mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{formatVnd(product.price)}</span>
                    <span className="text-sm text-[#FFC0CB] group-hover:underline">Xem chi tiết</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-black hover:text-[#FFC0CB] transition-colors"
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-[#FFE4E9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-['Poppins'] text-4xl font-bold mb-4">Chu trình skincare lý tưởng</h2>
            <p className="text-gray-600">5 bước đơn giản với 5 sản phẩm đại diện</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {routineSteps.map((product, index) => (
              <div key={product.id} className="bg-white rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-[#FFC0CB] rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {index + 1}
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
                />
                <h4 className="font-['Poppins'] font-semibold mb-2">{product.name}</h4>
                <p className="text-xs text-gray-600">{product.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-pink-100 bg-[#FFF6F8] px-6 py-8 md:px-10 md:py-10">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-pink-500 mb-3">
              ĐỐI TÁC &amp; TIẾP THỊ LIÊN KẾT
            </p>
            <h2 className="font-['Poppins'] text-2xl md:text-3xl font-semibold mb-4">
              Glow đồng hành cùng Beauty Bloggers &amp; KOLs
            </h2>
            <p className="text-sm md:text-base text-gray-700 mb-3">
              Glow hiện đang hợp tác với các beauty blogger, KOLs và những trang review làm đẹp uy tín để chia sẻ
              trải nghiệm chân thực về sản phẩm chăm sóc da. Những nội dung hợp tác luôn được gắn nhãn rõ ràng, minh
              bạch với người xem.
            </p>
            <p className="text-sm md:text-base text-gray-700">
              Một phần doanh thu từ tiếp thị liên kết được Glow tái đầu tư vào việc nghiên cứu công thức mới và nâng
              cấp trải nghiệm mua sắm, để mỗi đơn hàng của bạn đều đóng góp vào việc xây dựng cộng đồng da đẹp, khỏe
              và hiểu sản phẩm.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FFC0CB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-['Poppins'] font-semibold mb-2">Sản phẩm an toàn</h3>
              <p className="text-sm text-gray-600">Kiểm nghiệm không gây kích ứng</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FFC0CB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-['Poppins'] font-semibold mb-2">Miễn phí vận chuyển</h3>
              <p className="text-sm text-gray-600">Cho đơn từ {formatVnd(SHIPPING_FREE_SUBTOTAL_MIN_LEGACY)}</p>
            </div>

            <div className="text-center p-8">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#FFC0CB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-['Poppins'] font-semibold mb-2">Đổi trả 30 ngày</h3>
              <p className="text-sm text-gray-600">Cam kết hoàn tiền</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
