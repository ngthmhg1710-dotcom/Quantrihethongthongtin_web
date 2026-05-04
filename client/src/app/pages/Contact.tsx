import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { formatVnd, SHIPPING_FREE_SUBTOTAL_MIN_LEGACY } from '../utils/currency';

export function Contact() {
  const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
  const navigate = useNavigate();
  const { user } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vui lòng đăng nhập để gửi liên hệ');
      navigate('/login?redirect=' + encodeURIComponent('/contact'));
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Gửi tin nhắn thất bại");
      }
      toast.success(data.message || 'Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gửi tin nhắn thất bại";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#FFE4E9] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Poppins'] text-5xl font-bold mb-6">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600">
            Bạn có thắc mắc? Hãy gửi tin nhắn cho chúng tôi, đội ngũ sẽ phản hồi sớm nhất.
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[#FFC0CB]" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Email</h3>
              <p className="text-gray-600">hello@glow.com</p>
              <p className="text-gray-600">support@glow.com</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#FFC0CB]" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Điện thoại</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-sm text-gray-500">Thứ 2 - Thứ 6, 9:00 - 18:00</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#FFC0CB]" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Địa chỉ</h3>
              <p className="text-gray-600">123 Beauty Avenue</p>
              <p className="text-gray-600">New York, NY 10001</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <img
                src="/images/hero.png"
                alt="Liên hệ"
                className="rounded-2xl shadow-2xl w-full h-full object-cover"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-['Poppins'] text-3xl font-bold mb-6">Gửi tin nhắn cho chúng tôi</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Địa chỉ email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="jane@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Chủ đề</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="Chúng tôi có thể hỗ trợ gì cho bạn?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="Hãy chia sẻ chi tiết nhu cầu của bạn..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-[#FFE4E9] to-[#FFC0CB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Câu hỏi thường gặp</h2>
          <div className="space-y-4 text-left">
            {[
              {
                q: 'Các hình thức giao hàng là gì?',
                a: `Chúng tôi miễn phí vận chuyển cho đơn hàng từ ${formatVnd(SHIPPING_FREE_SUBTOTAL_MIN_LEGACY)}. Giao hàng tiêu chuẩn mất 5-7 ngày làm việc, và có giao nhanh trong 2-3 ngày.`
              },
              {
                q: 'Chính sách đổi trả như thế nào?',
                a: 'Chúng tôi áp dụng cam kết hoàn tiền trong 30 ngày cho tất cả sản phẩm. Nếu chưa hài lòng, bạn có thể hoàn trả sản phẩm chưa mở để được hoàn tiền đầy đủ.'
              },
              {
                q: 'Sản phẩm có thử nghiệm trên động vật không?',
                a: 'Không. Tất cả sản phẩm Glow đều 100% không thử nghiệm trên động vật. Chúng tôi cũng đang hướng tới chứng nhận thuần chay cho toàn bộ dòng sản phẩm.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6">
                <h3 className="font-['Poppins'] font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
