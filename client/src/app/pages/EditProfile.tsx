import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import {
  CITY_DISTRICTS,
  CITY_OPTIONS,
  canonicalVietnamCity,
  generateWardOptionsByDistrict,
  resolveDistrictForVietnamOrder,
} from '../utils/vietnamAddress';

type AddressDraft = {
  label: string;
  name: string;
  address: string;
  ward: string;
  city: string;
  district: string;
  country: string;
  isDefault: boolean;
};

export function EditProfile() {
  const { user, updateProfile } = useApp();
  const navigate = useNavigate();

  const normalizeAddressBook = (): AddressDraft[] => {
    const fromBook =
      user?.shippingAddresses?.map((a, idx) => ({
        label: a.label || (idx === 0 ? 'Nhà riêng' : `Địa chỉ ${idx + 1}`),
        name: a.name || '',
        address: a.address || '',
        ward: String(a.ward ?? '').trim(),
        city: a.city || '',
        district: a.district || a.zipCode || '',
        country: a.country || 'Việt Nam',
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
          label: 'Nhà riêng',
          name: user.defaultShippingAddress.name || user.name || '',
          address: user.defaultShippingAddress.address || '',
          ward: String(user.defaultShippingAddress.ward ?? '').trim(),
          city: user.defaultShippingAddress.city || '',
          district: user.defaultShippingAddress.district || user.defaultShippingAddress.zipCode || '',
          country: user.defaultShippingAddress.country || 'Việt Nam',
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
  const [addressBookDraft, setAddressBookDraft] = useState<AddressDraft[]>(normalizeAddressBook());
  const [editingAddressIndex, setEditingAddressIndex] = useState<number>(() => {
    const book = normalizeAddressBook();
    const idx = book.findIndex((a) => a.isDefault);
    return idx >= 0 ? idx : 0;
  });

  const profileAddressVnUi = useMemo(() => {
    const row = addressBookDraft[editingAddressIndex];
    if (!row) return null;
    const isVN = row.country.trim() === 'Việt Nam';
    if (!isVN) return { isVN: false as const };
    const effectiveCity = canonicalVietnamCity(row.city);
    const districts = effectiveCity ? CITY_DISTRICTS[effectiveCity] || [] : [];
    const districtCanon = resolveDistrictForVietnamOrder('Việt Nam', effectiveCity, row.district);
    const wardBase = generateWardOptionsByDistrict(effectiveCity, districtCanon);
    const cityOpts =
      effectiveCity && !CITY_OPTIONS.includes(effectiveCity) ? [effectiveCity, ...CITY_OPTIONS] : [...CITY_OPTIONS];
    const blockPostal = Boolean(effectiveCity && districts.length && /^\d{3,10}$/.test(row.district.trim()));
    const distOpts =
      row.district.trim() && !districts.includes(row.district) && !blockPostal
        ? [row.district, ...districts]
        : districts;
    const wardOpts =
      row.ward.trim() && !wardBase.includes(row.ward) ? [row.ward, ...wardBase] : wardBase;
    return {
      isVN: true as const,
      effectiveCity,
      cityOpts,
      districtCanon,
      distOpts,
      wardOpts,
    };
  }, [addressBookDraft, editingAddressIndex]);

  useEffect(() => {
    if (!user || user.isAdmin) {
      navigate('/login');
      return;
    }
    setProfileForm({
      name: user.name || '',
      phone: user.phone || '',
    });
    setAddressBookDraft(normalizeAddressBook());
  }, [user, navigate]);

  if (!user || user.isAdmin) return null;

  const handleSaveProfile = async () => {
    try {
      if (profileForm.name.trim().length < 2) {
        toast.error('Tên phải có ít nhất 2 ký tự');
        return;
      }

      const normalizedBook = addressBookDraft.map((item, idx) => ({
        label: item.label.trim() || (idx === 0 ? 'Nhà riêng' : `Địa chỉ ${idx + 1}`),
        name: item.name.trim(),
        address: item.address.trim(),
        ward: item.ward.trim(),
        city: item.city.trim(),
        district: item.district.trim(),
        country: item.country.trim() || 'Việt Nam',
        isDefault: Boolean(item.isDefault),
      }));

      const invalid = normalizedBook.find((a) => !a.name || !a.address || !a.city || !a.district || !a.country);
      if (normalizedBook.length > 0 && invalid) {
        toast.error('Vui lòng điền đầy đủ thông tin địa chỉ đang lưu');
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
      toast.success('Đã cập nhật hồ sơ');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ');
    }
  };

  return (
    <div className="py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="font-['Poppins'] font-semibold text-2xl">Chỉnh sửa hồ sơ</h1>
              <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin cá nhân và sổ địa chỉ</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 border rounded-full text-sm hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên</label>
                <input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
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
                <p className="font-medium">Sổ địa chỉ</p>
                <button
                  type="button"
                  onClick={() => {
                    setAddressBookDraft((prev) => {
                      const next = [
                        ...prev,
                        {
                          label: `Địa chỉ ${prev.length + 1}`,
                          name: user.name || '',
                          address: '',
                          ward: '',
                          city: '',
                          district: '',
                          country: 'Việt Nam',
                          isDefault: prev.length === 0,
                        },
                      ];
                      return next;
                    });
                    setEditingAddressIndex(addressBookDraft.length);
                  }}
                  className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                >
                  Thêm địa chỉ
                </button>
              </div>

              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                  {addressBookDraft.length === 0 && (
                    <p className="text-sm text-gray-600">Chưa có địa chỉ nào được lưu.</p>
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
                          {addr.label} {addr.isDefault ? '(Mặc định)' : ''}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {addr.name} - {addr.address || '—'}, {addr.district || '—'}, {addr.city || '—'}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="md:col-span-3">
                  {addressBookDraft[editingAddressIndex] ? (
                    <div className="space-y-3 rounded-xl border border-gray-200 p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1">Nhãn</label>
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
                            Đặt làm mặc định
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Tên người nhận</label>
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
                        <label className="block text-sm font-medium mb-1">Địa chỉ (số nhà, đường…)</label>
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
                      {profileAddressVnUi?.isVN ? (
                        <>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Quốc gia</label>
                              <select
                                value={addressBookDraft[editingAddressIndex].country}
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex
                                        ? {
                                            ...a,
                                            country: e.target.value,
                                            city: e.target.value === 'Việt Nam' ? a.city : '',
                                            district: e.target.value === 'Việt Nam' ? a.district : '',
                                            ward: e.target.value === 'Việt Nam' ? a.ward : '',
                                          }
                                        : a
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg bg-white"
                              >
                                <option>Việt Nam</option>
                                <option>Hoa Kỳ</option>
                                <option>Canada</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Thành phố / Tỉnh</label>
                              <select
                                required
                                value={profileAddressVnUi.effectiveCity}
                                onChange={(e) => {
                                  const nextCity = e.target.value;
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex
                                        ? { ...a, city: nextCity, district: '', ward: '' }
                                        : a
                                    )
                                  );
                                }}
                                className="w-full px-3 py-2 border rounded-lg bg-white"
                              >
                                <option value="">Chọn thành phố / tỉnh</option>
                                {profileAddressVnUi.cityOpts.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Quận / Huyện</label>
                              <select
                                required
                                value={
                                  profileAddressVnUi.distOpts.includes(
                                    resolveDistrictForVietnamOrder(
                                      'Việt Nam',
                                      profileAddressVnUi.effectiveCity,
                                      addressBookDraft[editingAddressIndex].district
                                    )
                                  )
                                    ? resolveDistrictForVietnamOrder(
                                        'Việt Nam',
                                        profileAddressVnUi.effectiveCity,
                                        addressBookDraft[editingAddressIndex].district
                                      )
                                    : addressBookDraft[editingAddressIndex].district
                                }
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex
                                        ? { ...a, district: e.target.value, ward: '' }
                                        : a
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg bg-white"
                              >
                                <option value="">Chọn quận / huyện</option>
                                {profileAddressVnUi.distOpts.map((d) => (
                                  <option key={d} value={d}>
                                    {d}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phường / xã</label>
                            <select
                              value={addressBookDraft[editingAddressIndex].ward}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) =>
                                    i === editingAddressIndex ? { ...a, ward: e.target.value } : a
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg bg-white"
                            >
                              <option value="">
                                {profileAddressVnUi.wardOpts.length
                                  ? 'Chọn phường / xã'
                                  : 'Chọn TP và quận trước'}
                              </option>
                              {profileAddressVnUi.wardOpts.map((w) => (
                                <option key={w} value={w}>
                                  {w}
                                </option>
                              ))}
                            </select>
                            {profileAddressVnUi.wardOpts.length === 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Khu vực chưa có danh mục phường — ghi trong ô địa chỉ nếu cần.
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-sm font-medium mb-1">Phường / xã</label>
                            <input
                              value={addressBookDraft[editingAddressIndex].ward}
                              onChange={(e) =>
                                setAddressBookDraft((prev) =>
                                  prev.map((a, i) =>
                                    i === editingAddressIndex ? { ...a, ward: e.target.value } : a
                                  )
                                )
                              }
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                          <div className="grid md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Thành phố / Tỉnh</label>
                              <input
                                value={addressBookDraft[editingAddressIndex].city}
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex ? { ...a, city: e.target.value } : a
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Quận / Huyện</label>
                              <input
                                value={addressBookDraft[editingAddressIndex].district}
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex ? { ...a, district: e.target.value } : a
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1 whitespace-nowrap">Quốc gia</label>
                              <input
                                value={addressBookDraft[editingAddressIndex].country}
                                onChange={(e) =>
                                  setAddressBookDraft((prev) =>
                                    prev.map((a, i) =>
                                      i === editingAddressIndex ? { ...a, country: e.target.value } : a
                                    )
                                  )
                                }
                                className="w-full px-3 py-2 border rounded-lg"
                              />
                            </div>
                          </div>
                        </>
                      )}

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
                          className="px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Chọn một địa chỉ để chỉnh sửa.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 border rounded-full"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
              >
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
