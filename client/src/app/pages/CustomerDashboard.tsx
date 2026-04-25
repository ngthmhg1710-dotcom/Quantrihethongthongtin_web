import { useApp } from '../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router';
import { Package, User, Heart, MessageCircleHeart } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export function CustomerDashboard() {
  const { user, orders, products, wishlistIds, updateProfile } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[number] | null>(null);
  const [activeSection, setActiveSection] = useState<'account' | 'reviews' | 'wishlist' | 'orders'>('account');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const normalizeAddressBook = () => {
    const fromBook =
      user?.shippingAddresses?.map((a, idx) => ({
        label: a.label || (idx === 0 ? 'Home' : `Address ${idx + 1}`),
        name: a.name || '',
        address: a.address || '',
        city: a.city || '',
        zipCode: a.zipCode || '',
        country: a.country || 'USA',
        isDefault: Boolean(a.isDefault),
      })) || [];

    if (fromBook.length > 0) {
      const defaultIndex = fromBook.findIndex((a) => a.isDefault);
      const chosen = defaultIndex >= 0 ? defaultIndex : 0;
      return fromBook.map((a, idx) => ({ ...a, isDefault: idx === chosen }));
    }

    if (user?.defaultShippingAddress?.address) {
      return [
        {
          label: 'Home',
          name: user.defaultShippingAddress.name || user.name || '',
          address: user.defaultShippingAddress.address || '',
          city: user.defaultShippingAddress.city || '',
          zipCode: user.defaultShippingAddress.zipCode || '',
          country: user.defaultShippingAddress.country || 'USA',
          isDefault: true,
        },
      ];
    }

    return [];
  };

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [addressBookDraft, setAddressBookDraft] = useState<
    Array<{
      label: string;
      name: string;
      address: string;
      city: string;
      zipCode: string;
      country: string;
      isDefault: boolean;
    }>
  >(normalizeAddressBook());
  const [editingAddressIndex, setEditingAddressIndex] = useState<number>(() => {
    const book = normalizeAddressBook();
    const idx = book.findIndex((a) => a.isDefault);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    if (!user || user.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'account' || tab === 'reviews' || tab === 'wishlist' || tab === 'orders') {
      setActiveSection(tab);
    }
  }, [searchParams]);

  if (!user || user.isAdmin) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatOrderDateTime = (order: (typeof orders)[number]) => {
    const placedAt =
      (order as (typeof order) & { placedAt?: string; createdAt?: string }).placedAt ||
      (order as (typeof order) & { createdAt?: string }).createdAt;

    if (placedAt) {
      const parsed = new Date(placedAt);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }

    // Fallback for older orders: extract timestamp from ORD-<milliseconds>.
    const orderIdMatch = order.id.match(/^ORD-(\d{10,})$/);
    if (orderIdMatch) {
      const timestamp = Number(orderIdMatch[1]);
      if (Number.isFinite(timestamp)) {
        const parsedFromId = new Date(timestamp);
        if (!Number.isNaN(parsedFromId.getTime())) {
          return parsedFromId.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    }

    return `${order.date} --:--`;
  };

  const wishlistedProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)),
    [products, wishlistIds]
  );
  const reviewedProducts = useMemo(
    () =>
      products.filter((product) =>
        product.reviews.some((review) => review.user.trim().toLowerCase() === user.name.trim().toLowerCase())
      ),
    [products, user.name]
  );

  const openEditProfileModal = () => {
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
    });
    const book = normalizeAddressBook();
    setAddressBookDraft(book);
    const idx = book.findIndex((a) => a.isDefault);
    setEditingAddressIndex(idx >= 0 ? idx : 0);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    try {
      if (profileForm.name.trim().length < 2) {
        toast.error('Name must be at least 2 characters');
        return;
      }
      const normalizedBook = addressBookDraft.map((item, idx) => ({
        label: item.label.trim() || (idx === 0 ? 'Home' : `Address ${idx + 1}`),
        name: item.name.trim(),
        address: item.address.trim(),
        city: item.city.trim(),
        zipCode: item.zipCode.trim(),
        country: item.country.trim() || 'USA',
        isDefault: Boolean(item.isDefault),
      }));

      const invalid = normalizedBook.find((a) => !a.name || !a.address || !a.city || !a.zipCode || !a.country);
      if (normalizedBook.length > 0 && invalid) {
        toast.error('Please fill all fields of the address you are saving');
        return;
      }
      if (normalizedBook.length > 0) {
        const defaultIndex = normalizedBook.findIndex((a) => a.isDefault);
        const chosen = defaultIndex >= 0 ? defaultIndex : 0;
        normalizedBook.forEach((a, idx) => (a.isDefault = idx === chosen));
      }

      await updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        shippingAddresses: normalizedBook,
      });
      toast.success('Profile updated');
      setIsEditingProfile(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    }
  };

  const sectionButtons = [
    { key: 'account' as const, label: 'Thông tin tài khoản', icon: User },
    { key: 'reviews' as const, label: 'My Reviews', icon: MessageCircleHeart },
    { key: 'wishlist' as const, label: 'My Wishlist', icon: Heart },
    { key: 'orders' as const, label: 'Lịch sử mua hàng', icon: Package },
  ];

  return (
    <div className="py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-gray-100">
            {sectionButtons.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.key;
              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={`flex items-center gap-2.5 px-4 py-4 text-left text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-[#D76F8A] border-[#FFC0CB] bg-[#FFF7F9]'
                      : 'text-gray-700 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="line-clamp-1">{section.label}</span>
                </button>
              );
            })}
          </div>
          <div className="p-6 min-h-[560px]">
            {activeSection === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-['Poppins'] font-semibold text-xl">Lịch sử mua hàng</h2>
                  <span className="text-sm text-gray-500">{orders.length} đơn hàng</span>
                </div>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px]">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-left text-sm text-gray-600">
                          <th className="px-4 py-3 font-medium">Mã đơn hàng</th>
                          <th className="px-4 py-3 font-medium">Ngày đặt hàng</th>
                          <th className="px-4 py-3 font-medium">Địa chỉ</th>
                          <th className="px-4 py-3 font-medium">Tổng tiền</th>
                          <th className="px-4 py-3 font-medium">Trạng thái</th>
                          <th className="px-4 py-3 font-medium">Mã vận chuyển</th>
                          <th className="px-4 py-3 font-medium">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => {
                          const shippingCode =
                            ((order as typeof order & { shippingCode?: string; trackingCode?: string }).shippingCode ||
                              (order as typeof order & { trackingCode?: string }).trackingCode ||
                              '-') as string;
                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <td className="px-4 py-3 font-semibold text-sm">{order.id}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{formatOrderDateTime(order)}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-[280px]">
                                <p className="line-clamp-2">
                                  {order.shippingAddress.address}, {order.shippingAddress.city}
                                </p>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold">${order.total.toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">{shippingCode}</td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedOrder(order);
                                  }}
                                  className="text-sm text-[#FFC0CB] hover:underline"
                                >
                                  Xem chi tiết
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {orders.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Bạn chưa có đơn hàng nào.</p>
                      <button
                        onClick={() => navigate('/products')}
                        className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                      >
                        Mua sắm ngay
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'account' && (
              <div className="max-w-2xl space-y-5">
                <h2 className="font-['Poppins'] font-semibold text-xl">Thông tin tài khoản</h2>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4">
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
                    onClick={openEditProfileModal}
                    className="text-sm text-[#FFC0CB] hover:underline"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'wishlist' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-['Poppins'] font-semibold text-xl flex items-center gap-2">
                    <Heart className="w-5 h-5 text-[#FFC0CB]" />
                    <span>My Wishlist</span>
                  </h2>
                  <span className="text-sm text-gray-500">{wishlistedProducts.length}</span>
                </div>
                {wishlistedProducts.length === 0 ? (
                  <p className="text-sm text-gray-600">No wishlist items yet.</p>
                ) : (
                  <div className="space-y-3">
                    {wishlistedProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          <p className="text-sm text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                        </div>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-['Poppins'] font-semibold text-xl flex items-center gap-2">
                    <MessageCircleHeart className="w-5 h-5 text-[#FFC0CB]" />
                    <span>My Reviews</span>
                  </h2>
                  <span className="text-sm text-gray-500">{reviewedProducts.length}</span>
                </div>
                {reviewedProducts.length === 0 ? (
                  <p className="text-sm text-gray-600">You have not written any reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {reviewedProducts.map((product) => {
                      const myReview = product.reviews.find(
                        (review) => review.user.trim().toLowerCase() === user.name.trim().toLowerCase()
                      );
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => navigate(`/products/${product.id}?tab=reviews&focus=mine`)}
                          className="w-full text-left border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="font-medium">{product.name}</p>
                            {myReview && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {myReview.rating}/5 - {myReview.comment}
                              </p>
                            )}
                          </div>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-['Poppins'] font-semibold text-xl">Order Details</h3>
                <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 border rounded-full text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
                <p className="text-sm text-gray-600 mt-3">Date: {formatOrderDateTime(selectedOrder)}</p>
                <p className="text-sm text-gray-600 mt-1">Total: ${selectedOrder.total.toFixed(2)}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                <p className="font-medium">
                  {selectedOrder.shippingAddress.name}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <p className="font-semibold">Items ({selectedOrder.items.length})</p>
              </div>
              <div className="divide-y divide-gray-200">
                {selectedOrder.items.map((item) => (
                  <div key={`${selectedOrder.id}-${item.product.id}`} className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="min-w-0">
                        <p className="font-medium line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
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
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium">Address Book</p>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressBookDraft((prev) => {
                        const next = [
                          ...prev,
                          {
                            label: `Address ${prev.length + 1}`,
                            name: user.name || '',
                            address: '',
                            city: '',
                            zipCode: '',
                            country: 'USA',
                            isDefault: prev.length === 0,
                          },
                        ];
                        return next;
                      });
                      setEditingAddressIndex(addressBookDraft.length);
                    }}
                    className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                  >
                    Add address
                  </button>
                </div>

                <div className="grid md:grid-cols-5 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    {addressBookDraft.length === 0 && (
                      <p className="text-sm text-gray-600">No saved addresses yet.</p>
                    )}
                    {addressBookDraft.map((addr, index) => (
                      <button
                        key={`${addr.label}-${index}`}
                        type="button"
                        onClick={() => setEditingAddressIndex(index)}
                        className={`w-full text-left border rounded-xl p-3 hover:bg-gray-50 transition-colors ${
                          editingAddressIndex === index ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium line-clamp-1">
                            {addr.label} {addr.isDefault ? '(Default)' : ''}
                          </p>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {addr.name} - {addr.address || '—'}, {addr.city || '—'}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="md:col-span-3">
                    {addressBookDraft[editingAddressIndex] ? (
                      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Label</label>
                            <input
                              value={addressBookDraft[editingAddressIndex].label}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) => (i === editingAddressIndex ? { ...a, label: e.target.value } : a))
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={addressBookDraft[editingAddressIndex].isDefault}
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) => ({ ...a, isDefault: i === editingAddressIndex ? e.target.checked : false }))
                                  )
                                }
                              />
                              Set as default
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Receiver Name</label>
                          <input
                            value={addressBookDraft[editingAddressIndex].name}
                            onChange={(e) =>
                              setAddressBookDraft((prev) =>
                                prev.map((a, i) => (i === editingAddressIndex ? { ...a, name: e.target.value } : a))
                              )
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Address</label>
                          <input
                            value={addressBookDraft[editingAddressIndex].address}
                            onChange={(e) =>
                              setAddressBookDraft((prev) =>
                                prev.map((a, i) => (i === editingAddressIndex ? { ...a, address: e.target.value } : a))
                              )
                            }
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">City</label>
                            <input
                              value={addressBookDraft[editingAddressIndex].city}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) => (i === editingAddressIndex ? { ...a, city: e.target.value } : a))
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">ZIP Code</label>
                            <input
                              value={addressBookDraft[editingAddressIndex].zipCode}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) => (i === editingAddressIndex ? { ...a, zipCode: e.target.value } : a))
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Country</label>
                            <input
                              value={addressBookDraft[editingAddressIndex].country}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) => (i === editingAddressIndex ? { ...a, country: e.target.value } : a))
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setAddressBookDraft((prev) => {
                                const next = prev.filter((_, i) => i !== editingAddressIndex);
                                if (next.length > 0 && !next.some((a) => a.isDefault)) {
                                  next[0].isDefault = true;
                                }
                                return next;
                              });
                              setEditingAddressIndex((prev) => (prev > 0 ? prev - 1 : 0));
                            }}
                            className="px-4 py-2 border rounded-full text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Select an address to edit.</p>
                    )}
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
