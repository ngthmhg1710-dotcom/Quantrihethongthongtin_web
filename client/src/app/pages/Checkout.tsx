import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { CreditCard, MapPin, Check } from 'lucide-react';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder, user, updateProfile } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');

  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Việt Nam'
  });
  const [didPrefillShipping, setDidPrefillShipping] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [setAsDefaultAddress, setSetAsDefaultAddress] = useState(true);
  const [makeSelectedDefaultInPicker, setMakeSelectedDefaultInPicker] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof typeof shippingInfo, string>>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof typeof paymentInfo, string>>>({});

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.99;
  const total = subtotal + shipping;

  useEffect(() => {
    if (!user || didPrefillShipping) return;
    const addressBook = user.shippingAddresses || [];
    const defaultAddressIndex = addressBook.findIndex((address) => address.isDefault);
    const chosenAddress = addressBook[defaultAddressIndex >= 0 ? defaultAddressIndex : 0];
    setSelectedAddressIndex(chosenAddress ? (defaultAddressIndex >= 0 ? defaultAddressIndex : 0) : -1);
    setShippingInfo((prev) => ({
      name: chosenAddress?.name || user.defaultShippingAddress?.name || user.name || prev.name,
      email: user.email || prev.email,
      address: chosenAddress?.address || user.defaultShippingAddress?.address || prev.address,
      city: chosenAddress?.city || user.defaultShippingAddress?.city || prev.city,
      zipCode: chosenAddress?.zipCode || user.defaultShippingAddress?.zipCode || prev.zipCode,
      country: chosenAddress?.country || user.defaultShippingAddress?.country || prev.country,
    }));
    setDidPrefillShipping(true);
  }, [user, didPrefillShipping]);

  const applyAddressFromBook = (index: number) => {
    if (!user?.shippingAddresses || !user.shippingAddresses[index]) return;
    const address = user.shippingAddresses[index];
    setSelectedAddressIndex(index);
    setIsAddingNewAddress(false);
    setShippingErrors({});
    setShippingInfo((prev) => ({
      ...prev,
      name: address.name,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode,
      country: address.country,
      email: user.email || prev.email,
    }));
  };

  const setDefaultAddressInBook = async (index: number) => {
    if (!user?.shippingAddresses || !user.shippingAddresses[index]) return;
    try {
      const nextBook = user.shippingAddresses.map((addr, idx) => ({
        label: addr.label || (idx === 0 ? 'Nhà riêng' : `Địa chỉ ${idx + 1}`),
        name: addr.name,
        address: addr.address,
        city: addr.city,
        zipCode: addr.zipCode,
        country: addr.country,
        isDefault: idx === index,
      }));
      await updateProfile({ shippingAddresses: nextBook });
      toast.success('Đã cập nhật địa chỉ mặc định');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đặt địa chỉ mặc định');
    }
  };

  const handlePickSavedAddress = async (index: number) => {
    applyAddressFromBook(index);
    if (makeSelectedDefaultInPicker) {
      await setDefaultAddressInBook(index);
    }
    setIsAddressPickerOpen(false);
  };

  const sortedSavedAddresses = (user?.shippingAddresses || [])
    .map((address, index) => ({ address, index }))
    .sort((a, b) => {
      const aDefault = a.address.isDefault ? 1 : 0;
      const bDefault = b.address.isDefault ? 1 : 0;
      if (aDefault !== bDefault) return bDefault - aDefault;
      return (a.address.label || '').localeCompare(b.address.label || '');
    });
  const selectedSavedAddress =
    user?.shippingAddresses && selectedAddressIndex >= 0 ? user.shippingAddresses[selectedAddressIndex] : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="font-['Poppins'] text-2xl font-bold mb-3">Vui lòng đăng nhập để thanh toán</h1>
          <p className="text-gray-600 mb-6">
            Bạn cần tài khoản để đặt hàng và theo dõi lịch sử mua hàng.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login?redirect=%2Fcheckout"
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/login?mode=register&redirect=%2Fcheckout"
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (cart.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [cart.length, step, navigate]);

  if (cart.length === 0 && step !== 'success') {
    return null;
  }

  const validateShippingInfo = () => {
    const errors: Partial<Record<keyof typeof shippingInfo, string>> = {};
    const name = shippingInfo.name.trim();
    const email = shippingInfo.email.trim();
    const address = shippingInfo.address.trim();
    const city = shippingInfo.city.trim();
    const zipCode = shippingInfo.zipCode.trim();
    const country = shippingInfo.country.trim();

    if (name.length < 2) errors.name = 'Vui lòng nhập họ tên đầy đủ';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Email không hợp lệ';
    if (address.length < 6) errors.address = 'Địa chỉ quá ngắn';
    if (city.length < 2) errors.city = 'Vui lòng nhập thành phố';
    if (!/^[A-Za-z0-9 -]{4,10}$/.test(zipCode)) errors.zipCode = 'Mã bưu điện không hợp lệ';
    if (!country) errors.country = 'Vui lòng chọn quốc gia';

    return errors;
  };

  const validatePaymentInfo = () => {
    const errors: Partial<Record<keyof typeof paymentInfo, string>> = {};
    const cardNumber = paymentInfo.cardNumber.replace(/\s+/g, '');
    const cvv = paymentInfo.cvv.trim();
    const cardName = paymentInfo.cardName.trim();
    const expiryDate = paymentInfo.expiryDate.trim();

    if (!/^\d{13,19}$/.test(cardNumber)) errors.cardNumber = 'Số thẻ phải gồm 13-19 chữ số';
    if (!/^\d{3,4}$/.test(cvv)) errors.cvv = 'CVV phải gồm 3 hoặc 4 chữ số';
    if (cardName.length < 2) errors.cardName = 'Vui lòng nhập tên chủ thẻ';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Hạn sử dụng phải theo định dạng MM/YY';
    } else {
      const [month, year] = expiryDate.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Thẻ đã hết hạn';
      }
    }

    return errors;
  };

  const hasInvalidCart = cart.some((item) => item.quantity <= 0 || item.product.price < 0);

  const handleShippingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart) {
      toast.error('Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng cập nhật lại giỏ hàng.');
      navigate('/cart');
      return;
    }
    const errors = validateShippingInfo();
    setShippingErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin giao hàng');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart || cart.length === 0) {
      toast.error('Giỏ hàng trống hoặc không hợp lệ. Vui lòng kiểm tra lại giỏ hàng.');
      navigate('/cart');
      return;
    }
    const errors = validatePaymentInfo();
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin thanh toán');
      return;
    }

    if (saveAddressToAccount && user) {
      try {
        const currentBook = (user.shippingAddresses || []).map((address, index) => ({
          label: address.label || (index === 0 ? 'Nhà riêng' : `Địa chỉ ${index + 1}`),
          name: address.name,
          address: address.address,
          city: address.city,
          zipCode: address.zipCode,
          country: address.country,
          isDefault: Boolean(address.isDefault),
        }));
        const normalizedCurrent = {
          name: shippingInfo.name.trim(),
          address: shippingInfo.address.trim(),
          city: shippingInfo.city.trim(),
          zipCode: shippingInfo.zipCode.trim(),
          country: shippingInfo.country.trim(),
        };
        const existingIndex = currentBook.findIndex(
          (item) =>
            item.name === normalizedCurrent.name &&
            item.address === normalizedCurrent.address &&
            item.city === normalizedCurrent.city &&
            item.zipCode === normalizedCurrent.zipCode &&
            item.country === normalizedCurrent.country
        );
        const nextBook = [...currentBook];
        if (existingIndex === -1) {
          nextBook.push({
            label: nextBook.length === 0 ? 'Nhà riêng' : `Địa chỉ ${nextBook.length + 1}`,
            ...normalizedCurrent,
            isDefault: nextBook.length === 0 || setAsDefaultAddress,
          });
        } else if (setAsDefaultAddress) {
          nextBook[existingIndex] = { ...nextBook[existingIndex], isDefault: true };
        }
        if (setAsDefaultAddress) {
          nextBook.forEach((item, index) => {
            item.isDefault = index === (existingIndex === -1 ? nextBook.length - 1 : existingIndex);
          });
        }
        await updateProfile({
          name: user.name,
          phone: user.phone || '',
          shippingAddresses: nextBook,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể lưu địa chỉ vào tài khoản');
      }
    }

    const orderId = `ORD-${Date.now()}`;
    const order = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total,
      status: 'processing' as const,
      shippingAddress: shippingInfo
    };

    try {
      await addOrder(order);
      clearCart();
      setStep('success');
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể đặt hàng';
      toast.error(message);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-[#FFE4E9] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-[#FFC0CB]" />
          </div>
          <h1 className="font-['Poppins'] text-3xl font-bold mb-4">Đơn hàng đã được xác nhận!</h1>
          <p className="text-gray-600 mb-8">
            Cảm ơn bạn đã mua hàng. Chúng tôi đã gửi email xác nhận tới {shippingInfo.email}
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-600 mb-2">Tổng đơn hàng</p>
            <p className="text-3xl font-bold mb-4">${total.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Dự kiến giao hàng: 5-7 ngày làm việc</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard?tab=orders')}
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-['Poppins'] text-4xl font-bold mb-8">Thanh toán</h1>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-black text-white' : 'bg-[#FFE4E9] text-black'}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step === 'payment' ? 'bg-black' : 'bg-gray-300'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-black text-white' : 'bg-gray-300 text-white'}`}>
              2
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6" />
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Thông tin giao hàng</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {user.shippingAddresses && user.shippingAddresses.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Địa chỉ giao hàng</p>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                            {selectedSavedAddress
                              ? `${selectedSavedAddress.label}${selectedSavedAddress.isDefault ? ' (Mặc định)' : ''} • ${selectedSavedAddress.name} • ${selectedSavedAddress.address}, ${selectedSavedAddress.city}`
                              : 'Chưa chọn địa chỉ'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddressPickerOpen(true)}
                          className="shrink-0 px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
                        >
                          Chọn địa chỉ
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Họ và tên</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.name}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, name: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="Jane Doe"
                      />
                      {shippingErrors.name && <p className="mt-1 text-xs text-red-600">{shippingErrors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={shippingInfo.email}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, email: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="jane@example.com"
                      />
                      {shippingErrors.email && <p className="mt-1 text-xs text-red-600">{shippingErrors.email}</p>}
                    </div>
                  </div>

                  <div>
                      <label className="block text-sm font-medium mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.address}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, address: e.target.value });
                        setShippingErrors((prev) => ({ ...prev, address: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="123 Beauty Street"
                    />
                    {shippingErrors.address && <p className="mt-1 text-xs text-red-600">{shippingErrors.address}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Thành phố</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.city}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, city: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, city: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="New York"
                      />
                      {shippingErrors.city && <p className="mt-1 text-xs text-red-600">{shippingErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Mã bưu điện</label>
                      <input
                        type="text"
                        required
                        value={shippingInfo.zipCode}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, zipCode: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, zipCode: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="10001"
                      />
                      {shippingErrors.zipCode && <p className="mt-1 text-xs text-red-600">{shippingErrors.zipCode}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quốc gia</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, country: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, country: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      >
                        <option>Việt Nam</option>
                        <option>Hoa Kỳ</option>
                        <option>Canada</option>
                      </select>
                      {shippingErrors.country && <p className="mt-1 text-xs text-red-600">{shippingErrors.country}</p>}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={saveAddressToAccount}
                          onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                        />
                        Lưu địa chỉ này vào sổ địa chỉ
                      </label>
                      {isAddingNewAddress && saveAddressToAccount && (
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={setAsDefaultAddress}
                            onChange={(e) => setSetAsDefaultAddress(e.target.checked)}
                          />
                          Đặt làm địa chỉ mặc định
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Khi đặt hàng, địa chỉ sẽ được lưu vào tài khoản (tùy chọn).
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Tiếp tục tới thanh toán
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Thông tin thanh toán</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cardNumber}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 19);
                        const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
                        setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
                        setPaymentErrors((prev) => ({ ...prev, cardNumber: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                    {paymentErrors.cardNumber && <p className="mt-1 text-xs text-red-600">{paymentErrors.cardNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={paymentInfo.cardName}
                      onChange={(e) => {
                        setPaymentInfo({ ...paymentInfo, cardName: e.target.value });
                        setPaymentErrors((prev) => ({ ...prev, cardName: undefined }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      placeholder="Jane Doe"
                    />
                    {paymentErrors.cardName && <p className="mt-1 text-xs text-red-600">{paymentErrors.cardName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        required
                        value={paymentInfo.expiryDate}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          const formatted = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
                          setPaymentInfo({ ...paymentInfo, expiryDate: formatted });
                          setPaymentErrors((prev) => ({ ...prev, expiryDate: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {paymentErrors.expiryDate && <p className="mt-1 text-xs text-red-600">{paymentErrors.expiryDate}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <input
                        type="text"
                        required
                        value={paymentInfo.cvv}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPaymentInfo({ ...paymentInfo, cvv: raw });
                          setPaymentErrors((prev) => ({ ...prev, cvv: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                        placeholder="123"
                        maxLength={4}
                      />
                      {paymentErrors.cvv && <p className="mt-1 text-xs text-red-600">{paymentErrors.cvv}</p>}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="flex-1 bg-gray-200 text-black py-3 rounded-full hover:bg-gray-300 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Đặt hàng
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-['Poppins'] font-semibold text-xl mb-4">Tóm tắt đơn hàng</h3>

              <div className="space-y-3 mb-6">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.product.name}</p>
                      <p className="text-xs text-gray-600">SL: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'MIỄN PHÍ' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isAddressPickerOpen && user?.shippingAddresses && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setIsAddressPickerOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-5 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-['Poppins'] font-semibold text-xl">Chọn địa chỉ giao hàng</h3>
                <p className="text-sm text-gray-500">{user.shippingAddresses.length} địa chỉ đã lưu</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressPickerOpen(false)}
                className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
              >
                Đóng
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  const defaultIndex = user.shippingAddresses?.findIndex((address) => address.isDefault) ?? -1;
                  if (defaultIndex >= 0) applyAddressFromBook(defaultIndex);
                  else applyAddressFromBook(0);
                  setIsAddressPickerOpen(false);
                }}
                className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
              >
                Dùng địa chỉ mặc định
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewAddress(true);
                  setSelectedAddressIndex(-1);
                  setShippingErrors({});
                  setShippingInfo({
                    name: user.name || '',
                    email: user.email || '',
                    address: '',
                    city: '',
                    zipCode: '',
                    country: 'Việt Nam',
                  });
                  setSetAsDefaultAddress(true);
                  setMakeSelectedDefaultInPicker(false);
                  setIsAddressPickerOpen(false);
                }}
                className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
              >
                Thêm địa chỉ mới
              </button>
            </div>

            <label className="flex items-center gap-2 text-sm mb-3">
              <input
                type="checkbox"
                checked={makeSelectedDefaultInPicker}
                onChange={(e) => setMakeSelectedDefaultInPicker(e.target.checked)}
              />
              Đặt địa chỉ đang chọn làm mặc định
            </label>

            <div className="grid gap-2">
              {sortedSavedAddresses.map(({ address, index }) => (
                <label
                  key={`${address.label}-${address.address}-${index}`}
                  className={`flex gap-3 items-start px-3 py-2 rounded-lg border text-sm cursor-pointer ${
                    selectedAddressIndex === index ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddressModal"
                    checked={selectedAddressIndex === index}
                    onChange={() => void handlePickSavedAddress(index)}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {address.label} {address.isDefault ? '(Mặc định)' : ''}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {address.name} - {address.address}, {address.city}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

