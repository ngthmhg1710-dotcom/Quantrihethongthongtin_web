import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Package, User, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';

export function CustomerDashboard() {
  const { user, orders, logout } = useApp();
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  if (!user || user.isAdmin) {
    navigate('/login');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-['Poppins'] text-4xl font-bold mb-2">My Account</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-[#FFC0CB]" />
            </div>
            <p className="text-2xl font-bold mb-1">{orders.length}</p>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-[#FFC0CB]" />
            </div>
            <p className="text-2xl font-bold mb-1">12</p>
            <p className="text-sm text-gray-600">Wishlist Items</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-[#FFC0CB]" />
            </div>
            <p className="text-2xl font-bold mb-1">1</p>
            <p className="text-sm text-gray-600">Saved Address</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center mb-4">
              <User className="w-6 h-6 text-[#FFC0CB]" />
            </div>
            <p className="text-2xl font-bold mb-1">5</p>
            <p className="text-sm text-gray-600">Reviews Written</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Order History</h2>

              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-gray-600">Total: <span className="font-bold text-black">${order.total.toFixed(2)}</span></p>
                      <button
                        onClick={() => setExpandedOrderId(prev => (prev === order.id ? null : order.id))}
                        className="text-sm text-[#FFC0CB] hover:underline"
                      >
                        {expandedOrderId === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>

                    {expandedOrderId === order.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <div>
                          <p className="text-sm font-semibold mb-2">Items</p>
                          <div className="space-y-2">
                            {order.items.map((item) => (
                              <div key={`${order.id}-${item.product.id}`} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-10 h-10 object-cover rounded-md"
                                  />
                                  <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-gray-500">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold mb-1">Shipping Address</p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.name} - {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                            {order.shippingAddress.zipCode}, {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No orders yet</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-4">Profile Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold">{user.name}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>

                <button className="w-full text-left text-sm text-[#FFC0CB] hover:underline">
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-4">Quick Actions</h2>

              <div className="space-y-2">
                <button
                  onClick={() => navigate('/products')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Browse Products
                </button>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  View Cart
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Wishlist
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
