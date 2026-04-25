import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Message sent successfully! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#FFE4E9] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Poppins'] text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600">
            Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
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
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Email Us</h3>
              <p className="text-gray-600">hello@glow.com</p>
              <p className="text-gray-600">support@glow.com</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-[#FFC0CB]" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Call Us</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
              <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm EST</p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#FFC0CB]" />
              </div>
              <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Beauty Avenue</p>
              <p className="text-gray-600">New York, NY 10001</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <img
                src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop"
                alt="Contact Us"
                className="rounded-2xl shadow-2xl w-full h-full object-cover"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="font-['Poppins'] text-3xl font-bold mb-6">Send us a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
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
                  <label className="block text-sm font-medium mb-2">Email Address</label>
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
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-[#FFE4E9] to-[#FFC0CB]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4 text-left">
            {[
              {
                q: 'What are your shipping options?',
                a: 'We offer free shipping on orders over $50. Standard shipping takes 5-7 business days, and express shipping is available for 2-3 day delivery.'
              },
              {
                q: 'What is your return policy?',
                a: 'We offer a 30-day money-back guarantee on all products. If you\'re not satisfied, you can return any unopened products for a full refund.'
              },
              {
                q: 'Are your products cruelty-free?',
                a: 'Yes! All Glow products are 100% cruelty-free and never tested on animals. We\'re also working towards vegan certification for our entire line.'
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
