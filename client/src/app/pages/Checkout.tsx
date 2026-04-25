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
    country: 'USA'
  });
  const [didPrefillShipping, setDidPrefillShipping] = useState(false);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(-1);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [setAsDefaultAddress, setSetAsDefaultAddress] = useState(true);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <h1 className="font-['Poppins'] text-2xl font-bold mb-3">Please sign in to checkout</h1>
          <p className="text-gray-600 mb-6">
            You need an account to place orders and track your order history.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login?redirect=%2Fcheckout"
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/login?mode=register&redirect=%2Fcheckout"
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Sign Up
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

    if (name.length < 2) errors.name = 'Please enter full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email format';
    if (address.length < 6) errors.address = 'Address is too short';
    if (city.length < 2) errors.city = 'City is required';
    if (!/^[A-Za-z0-9 -]{4,10}$/.test(zipCode)) errors.zipCode = 'Invalid ZIP/Postal code';
    if (!country) errors.country = 'Country is required';

    return errors;
  };

  const validatePaymentInfo = () => {
    const errors: Partial<Record<keyof typeof paymentInfo, string>> = {};
    const cardNumber = paymentInfo.cardNumber.replace(/\s+/g, '');
    const cvv = paymentInfo.cvv.trim();
    const cardName = paymentInfo.cardName.trim();
    const expiryDate = paymentInfo.expiryDate.trim();

    if (!/^\d{13,19}$/.test(cardNumber)) errors.cardNumber = 'Card number must be 13-19 digits';
    if (!/^\d{3,4}$/.test(cvv)) errors.cvv = 'CVV must be 3 or 4 digits';
    if (cardName.length < 2) errors.cardName = 'Cardholder name is required';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      errors.expiryDate = 'Expiry must be MM/YY';
    } else {
      const [month, year] = expiryDate.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiryDate = 'Card is expired';
      }
    }

    return errors;
  };

  const hasInvalidCart = cart.some((item) => item.quantity <= 0 || item.product.price < 0);

  const handleShippingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart) {
      toast.error('Cart contains invalid items. Please update cart first.');
      navigate('/cart');
      return;
    }
    const errors = validateShippingInfo();
    setShippingErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix shipping information');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (hasInvalidCart || cart.length === 0) {
      toast.error('Cart is empty or invalid. Please review your cart.');
      navigate('/cart');
      return;
    }
    const errors = validatePaymentInfo();
    setPaymentErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix payment information');
      return;
    }

    if (saveAddressToAccount && user) {
      try {
        const currentBook = (user.shippingAddresses || []).map((address, index) => ({
          label: address.label || (index === 0 ? 'Home' : `Address ${index + 1}`),
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
            label: nextBook.length === 0 ? 'Home' : `Address ${nextBook.length + 1}`,
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
        toast.error(error instanceof Error ? error.message : 'Could not save address to account');
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
      toast.success('Order placed successfully!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to place order';
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
          <h1 className="font-['Poppins'] text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. We've sent a confirmation email to {shippingInfo.email}
          </p>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-600 mb-2">Order Total</p>
            <p className="text-3xl font-bold mb-4">${total.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Expected delivery: 5-7 business days</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="flex-1 bg-[#FFC0CB] text-black py-3 rounded-full hover:bg-[#ffb3c1] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-['Poppins'] text-4xl font-bold mb-8">Checkout</h1>

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
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Shipping Information</h2>
                </div>

                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  {user.shippingAddresses && user.shippingAddresses.length > 0 && (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                      <p className="text-sm font-medium">Saved addresses</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const defaultIndex = user.shippingAddresses?.findIndex((address) => address.isDefault) ?? -1;
                            if (defaultIndex >= 0) applyAddressFromBook(defaultIndex);
                            else applyAddressFromBook(0);
                          }}
                          className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
                        >
                          Dùng thông tin tài khoản
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingNewAddress(true);
                            setSelectedAddressIndex(-1);
                            setShippingInfo((prev) => ({ ...prev, name: user.name || '', email: user.email || '' }));
                          }}
                          className="px-3 py-1.5 text-xs border rounded-full bg-white hover:bg-gray-100"
                        >
                          Thêm địa chỉ mới
                        </button>
                      </div>
                      <div className="grid gap-2">
                        {user.shippingAddresses.map((address, index) => (
                          <button
                            key={`${address.label}-${address.address}-${index}`}
                            type="button"
                            onClick={() => applyAddressFromBook(index)}
                            className={`text-left px-3 py-2 rounded-lg border text-sm ${
                              selectedAddressIndex === index ? 'border-black bg-white' : 'border-gray-200 bg-white hover:bg-gray-100'
                            }`}
                          >
                            <p className="font-medium">
                              {address.label} {address.isDefault ? '(Default)' : ''}
                            </p>
                            <p className="text-xs text-gray-600">
                              {address.name} - {address.address}, {address.city}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
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
                    <label className="block text-sm font-medium mb-2">Address</label>
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
                      <label className="block text-sm font-medium mb-2">City</label>
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
                      <label className="block text-sm font-medium mb-2">ZIP Code</label>
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
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) => {
                          setShippingInfo({ ...shippingInfo, country: e.target.value });
                          setShippingErrors((prev) => ({ ...prev, country: undefined }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFC0CB]"
                      >
                        <option>USA</option>
                        <option>Canada</option>
                        <option>UK</option>
                      </select>
                      {shippingErrors.country && <p className="mt-1 text-xs text-red-600">{shippingErrors.country}</p>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6" />
                  <h2 className="font-['Poppins'] font-semibold text-2xl">Payment Information</h2>
                </div>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={saveAddressToAccount}
                        onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                      />
                      Save this shipping address to my account
                    </label>
                    {saveAddressToAccount && (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={setAsDefaultAddress}
                          onChange={(e) => setSetAsDefaultAddress(e.target.checked)}
                        />
                        Set as default address
                      </label>
                    )}
                  </div>
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
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-black text-white py-3 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Place Order
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-['Poppins'] font-semibold text-xl mb-4">Order Summary</h3>

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
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
