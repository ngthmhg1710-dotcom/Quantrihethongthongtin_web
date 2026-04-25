import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Package, User, MapPin, Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CustomerDashboard() {
  const { user, orders, logout, updateProfile } = useApp();
  const navigate = useNavigate();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    addressName: user?.defaultShippingAddress?.name || user?.name || '',
    address: user?.defaultShippingAddress?.address || '',
    city: user?.defaultShippingAddress?.city || '',
    zipCode: user?.defaultShippingAddress?.zipCode || '',
    country: user?.defaultShippingAddress?.country || 'USA',
  });

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

  const savedAddressCount = user?.shippingAddresses?.length || (user?.defaultShippingAddress?.address ? 1 : 0);

  const handleSaveProfile = async () => {
    try {
      if (profileForm.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        return;
      }
      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        defaultShippingAddress: {
          name: profileForm.addressName.trim(),
          address: profileForm.address.trim(),
          city: profileForm.city.trim(),
          zipCode: profileForm.zipCode.trim(),
          country: profileForm.country.trim(),
        },
      });
      toast.success('Profile updated');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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
            <p className="text-2xl font-bold mb-1">{savedAddressCount}</p>
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

                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold">{user.phone || 'Not set'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Default Shipping</p>
                  <p className="text-sm font-medium text-gray-800">
                    {user.defaultShippingAddress?.address
                      ? `${user.defaultShippingAddress.name}, ${user.defaultShippingAddress.address}, ${user.defaultShippingAddress.city}`
                      : 'Not set'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setProfileForm({
                      name: user.name || '',
                      phone: user.phone || '',
                      addressName: user.defaultShippingAddress?.name || user.name || '',
                      address: user.defaultShippingAddress?.address || '',
                      city: user.defaultShippingAddress?.city || '',
                      zipCode: user.defaultShippingAddress?.zipCode || '',
                      country: user.defaultShippingAddress?.country || 'USA',
                    });
                    setIsEditingProfile(true);
                  }}
                  className="w-full text-left text-sm text-[#FFC0CB] hover:underline"
                >
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
      {isEditingProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setIsEditingProfile(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Poppins'] font-semibold text-xl">Edit Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3 py-1.5 border rounded-full text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+84..."
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="font-medium mb-3">Default Shipping Address</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Receiver Name</label>
                    <input
                      value={profileForm.addressName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, addressName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      value={profileForm.address}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        value={profileForm.city}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">ZIP Code</label>
                      <input
                        value={profileForm.zipCode}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, zipCode: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Country</label>
                      <input
                        value={profileForm.country}
                        onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
