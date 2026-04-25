export function About() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#FFE4E9] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Poppins'] text-5xl font-bold mb-6">Về Glow</h1>
          <p className="text-xl text-gray-600">
            Giúp phụ nữ tự tin với vẻ đẹp tự nhiên qua các sản phẩm chăm sóc da cao cấp, không thử nghiệm trên động vật
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Câu chuyện của chúng tôi</h2>
              <p className="text-gray-600 mb-4">
                Thành lập năm 2020, Glow ra đời từ một niềm tin đơn giản: chăm sóc da phải dễ tiếp cận, hiệu quả và thân thiện với làn da lẫn môi trường.
              </p>
              <p className="text-gray-600 mb-4">
                Chúng tôi bắt đầu với sứ mệnh tạo ra những sản phẩm tôn vinh vẻ đẹp tự nhiên, kết hợp các thành phần được khoa học chứng minh. Mỗi sản phẩm đều được nghiên cứu kỹ lưỡng để mang lại hiệu quả thật mà vẫn đảm bảo đạo đức và tính bền vững.
              </p>
              <p className="text-gray-600">
                Hôm nay, chúng tôi tự hào phục vụ hơn 50.000 khách hàng hài lòng trên toàn thế giới, giúp họ tìm thấy vẻ rạng rỡ tự nhiên.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop"
                alt="Câu chuyện thương hiệu"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop"
                alt="Giá trị cốt lõi"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Giá trị cốt lõi</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Làm đẹp lành tính</h3>
                  <p className="text-gray-600">
                    Chúng tôi chỉ sử dụng các thành phần tự nhiên chất lượng cao, không chứa hóa chất độc hại.
                  </p>
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Không thử nghiệm trên động vật</h3>
                  <p className="text-gray-600">
                    Tất cả sản phẩm của chúng tôi đều 100% không thử nghiệm trên động vật.
                  </p>
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Phát triển bền vững</h3>
                  <p className="text-gray-600">
                    Chúng tôi cam kết thực hành bền vững từ khâu nguyên liệu đến đóng gói.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFE4E9] to-[#FFC0CB] rounded-2xl p-12 text-center">
            <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Tham gia cộng đồng của chúng tôi</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Trở thành một phần của cộng đồng yêu làm đẹp đang phát triển. Nhận mẹo độc quyền, trải nghiệm sản phẩm mới sớm và ưu đãi đặc biệt.
            </p>
            <div className="flex gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Poppins'] text-4xl font-bold text-center mb-12">Đội ngũ của chúng tôi</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Nhà sáng lập & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
              { name: 'Emily Rodriguez', role: 'Trưởng bộ phận sản phẩm', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
              { name: 'Jessica Kim', role: 'Chuyên gia hóa mỹ phẩm', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' }
            ].map(member => (
              <div key={member.name} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <img src={member.image} alt={member.name} className="w-full aspect-square object-cover" />
                <div className="p-6 text-center">
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-1">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
