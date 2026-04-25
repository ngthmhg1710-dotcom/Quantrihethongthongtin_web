export function About() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-[#FFE4E9] to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-['Poppins'] text-5xl font-bold mb-6">About Glow</h1>
          <p className="text-xl text-gray-600">
            Empowering women to embrace their natural beauty with premium, cruelty-free skincare
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, Glow was born from a simple belief: skincare should be accessible, effective, and kind to both your skin and the planet.
              </p>
              <p className="text-gray-600 mb-4">
                We started with a mission to create products that celebrate natural beauty while harnessing the power of science-backed ingredients. Every product is carefully formulated to deliver real results without compromising on ethics or sustainability.
              </p>
              <p className="text-gray-600">
                Today, we're proud to serve over 50,000 happy customers worldwide, helping them discover their natural glow.
              </p>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop"
                alt="Our Story"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop"
                alt="Our Values"
                className="rounded-2xl shadow-2xl"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Our Values</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Clean Beauty</h3>
                  <p className="text-gray-600">
                    We use only the finest natural ingredients, free from harmful chemicals and toxins.
                  </p>
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Cruelty-Free</h3>
                  <p className="text-gray-600">
                    All our products are 100% cruelty-free and never tested on animals.
                  </p>
                </div>
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl mb-2">Sustainability</h3>
                  <p className="text-gray-600">
                    We're committed to sustainable practices, from sourcing to packaging.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#FFE4E9] to-[#FFC0CB] rounded-2xl p-12 text-center">
            <h2 className="font-['Poppins'] text-4xl font-bold mb-6">Join Our Community</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Be part of our growing community of beauty enthusiasts. Get exclusive tips, early access to new products, and special offers.
            </p>
            <div className="flex gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Poppins'] text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
              { name: 'Emily Rodriguez', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' },
              { name: 'Jessica Kim', role: 'Lead Chemist', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop' }
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
