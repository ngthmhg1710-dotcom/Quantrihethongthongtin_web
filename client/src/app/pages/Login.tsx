import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const isRegisterMode = searchParams.get('mode') === 'register';
  const { login, register } = useApp();
  const [isRegister, setIsRegister] = useState(isRegisterMode);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRegister && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSubmitting(true);

      const authUser = isRegister
        ? await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          })
        : await login(formData.email, formData.password);

      toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
      if (authUser.isAdmin) {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="bg-gradient-to-br from-[#FFE4E9] to-[#FFC0CB] rounded-2xl p-12 h-full flex flex-col justify-center">
              <h2 className="font-['Poppins'] text-4xl font-bold mb-4">
                {isRegister ? 'Join Glow' : 'Welcome Back'}
              </h2>
              <p className="text-lg mb-8">
                {isRegister
                  ? 'Create an account to unlock exclusive benefits and track your orders.'
                  : 'Sign in to access your account and continue your beauty journey.'}
              </p>
              <img
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop"
                alt="Beauty products"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h1 className="font-['Poppins'] text-3xl font-bold mb-6">
                {isRegister ? 'Create Account' : 'Sign In'}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="Jane Doe"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
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
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                    placeholder="••••••••"
                  />
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
                >
                  {submitting ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

              {!isRegister && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-[#FFC0CB] hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
