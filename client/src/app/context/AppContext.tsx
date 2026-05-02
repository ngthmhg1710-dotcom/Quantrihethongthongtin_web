import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product, Order, products as localProducts } from '../data/products';
import { localizeProduct } from '../utils/localization';

interface User {
  id: string;
  name: string;
  email: string;
  hasUsablePassword?: boolean;
  isAdmin: boolean;
  phone?: string;
  shippingAddresses?: Array<{
    id?: string;
    label: string;
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }>;
  savedPaymentMethods?: Array<{
    id?: string;
    label: string;
    cardName: string;
    brand: string;
    last4: string;
    expiryDate: string;
    isDefault?: boolean;
  }>;
  defaultShippingAddress?: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  wishlistIds?: number[];
  savedCartItems?: Array<{
    productId: number;
    quantity: number;
  }>;
}

interface AppContextType {
  products: Product[];
  productsLoading: boolean;
  refreshProducts: () => Promise<void>;
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  wishlistIds: number[];
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string }) => Promise<User>;
  setPassword: (payload: { currentPassword?: string; newPassword: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    phone?: string;
    defaultShippingAddress?: {
      name: string;
      address: string;
      city: string;
      zipCode: string;
      country: string;
    };
    shippingAddresses?: Array<{
      label: string;
      name: string;
      address: string;
      city: string;
      zipCode: string;
      country: string;
      isDefault?: boolean;
    }>;
    savedPaymentMethods?: Array<{
      label: string;
      cardName: string;
      brand: string;
      last4: string;
      expiryDate: string;
      isDefault?: boolean;
    }>;
  }) => Promise<User>;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addProductReview: (productId: number, payload: { rating: number; comment: string }) => Promise<Product>;
}

const defaultAppContext: AppContextType = {
  products: localProducts.map(localizeProduct),
  productsLoading: false,
  refreshProducts: async () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  wishlistIds: [],
  toggleWishlist: () => {},
  isInWishlist: () => false,
  user: null,
  login: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  loginWithGoogle: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  register: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  setPassword: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  logout: async () => {},
  updateProfile: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  orders: [],
  addOrder: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  updateOrderStatus: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
  addProductReview: async () => {
    throw new Error('Ngữ cảnh ứng dụng chưa sẵn sàng');
  },
};

const AppContext = createContext<AppContextType>(defaultAppContext);
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
const USER_STORAGE_KEY = 'app_user';
const TOKEN_STORAGE_KEY = 'app_token';
const REFRESH_TOKEN_STORAGE_KEY = 'app_refresh_token';
const WISHLIST_STORAGE_KEY = 'app_wishlist_ids';
const GUEST_WISHLIST_STORAGE_KEY = `${WISHLIST_STORAGE_KEY}:guest`;
const GUEST_CART_STORAGE_KEY = 'app_cart_items:guest';

const normalizeWishlistIds = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0))];
};

const normalizeSavedCartItems = (
  value: unknown
): Array<{
  productId: number;
  quantity: number;
}> => {
  if (!Array.isArray(value)) return [];
  const bucket = new Map<number, number>();
  value.forEach((item) => {
    const productId = Number((item as { productId?: unknown })?.productId);
    const quantity = Number((item as { quantity?: unknown })?.quantity);
    if (!Number.isInteger(productId) || productId <= 0) return;
    if (!Number.isInteger(quantity) || quantity <= 0) return;
    bucket.set(productId, (bucket.get(productId) || 0) + quantity);
  });
  return Array.from(bucket.entries()).map(([productId, quantity]) => ({ productId, quantity }));
};

const readGuestWishlistIds = () => {
  try {
    const saved = localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown) : [];
    return normalizeWishlistIds(parsed);
  } catch {
    return [];
  }
};

const readGuestCartItems = () => {
  try {
    const saved = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as unknown) : [];
    return normalizeSavedCartItems(parsed);
  } catch {
    return [];
  }
};

const clearAuthStorage = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const buildCartFromSavedItems = (
    savedItems: Array<{ productId: number; quantity: number }>,
    sourceProducts: Product[]
  ): CartItem[] =>
    normalizeSavedCartItems(savedItems)
      .map((item) => {
        const product = sourceProducts.find((p) => p.id === item.productId);
        if (!product) return null;
        return { product, quantity: item.quantity };
      })
      .filter((item): item is CartItem => item !== null);

  const [cart, setCart] = useState<CartItem[]>(() => buildCartFromSavedItems(readGuestCartItems(), localProducts));
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  const refreshProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Không thể tải danh sách sản phẩm');
      }

      const apiProducts = (await response.json()) as Array<Partial<Product>>;
      const normalized: Product[] = apiProducts.map((item, index) => ({
        id: Number(item.id ?? index + 1),
        name: item.name ?? 'Product',
        price: Number(item.price ?? 0),
        stock: Number(item.stock ?? 0),
        image: item.image ?? '',
        category: item.category ?? 'General',
        description: item.description ?? '',
        ingredients: item.ingredients ?? [],
        skinTypes: item.skinTypes ?? ['all'],
        rating: Number(item.rating ?? 0),
        reviews: item.reviews ?? [],
        featured: Boolean(item.featured),
        step: item.step,
      }));

      setProducts((normalized.length > 0 ? normalized : localProducts).map(localizeProduct));
    } catch {
      setProducts(localProducts.map(localizeProduct));
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        if (!mounted) return;
        await refreshProducts();
      } catch {
        // handled inside refreshProducts
      } finally {
        if (mounted) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    return savedUser ? (JSON.parse(savedUser) as User) : null;
  });

  useEffect(() => {
    if (user) {
      setWishlistIds(normalizeWishlistIds(user.wishlistIds));
      setCart(buildCartFromSavedItems(user.savedCartItems || [], products));
      return;
    }
    setWishlistIds(readGuestWishlistIds());
    setCart(buildCartFromSavedItems(readGuestCartItems(), products));
  }, [user, products]);

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) {
      clearAuthStorage();
      setUser(null);
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      clearAuthStorage();
      setUser(null);
      throw new Error('Phiên đăng nhập đã hết hạn');
    }

    const refreshData = await refreshResponse.json();
    localStorage.setItem(TOKEN_STORAGE_KEY, refreshData.token as string);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshData.refreshToken as string);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(refreshData.user));
    setUser(refreshData.user as User);
    return refreshData.token as string;
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      token = await refreshAccessToken();
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Authorization', `Bearer ${token}`);
      if (!retryHeaders.has('Content-Type') && options.body) retryHeaders.set('Content-Type', 'application/json');
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
    return response;
  };

  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);
  const cartItemsEqual = (
    a: Array<{ productId: number; quantity: number }>,
    b: Array<{ productId: number; quantity: number }>
  ) =>
    a.length === b.length &&
    a.every((item, index) => item.productId === b[index]?.productId && item.quantity === b[index]?.quantity);

  const syncGuestDataAfterAuth = async (authenticatedUser: User, accessToken: string): Promise<User> => {
    const guestWishlistIds = readGuestWishlistIds();
    const serverWishlistIds = normalizeWishlistIds(authenticatedUser.wishlistIds);
    const mergedWishlistIds = normalizeWishlistIds([...serverWishlistIds, ...guestWishlistIds]);
    const guestCartItems = readGuestCartItems();
    const serverCartItems = normalizeSavedCartItems(authenticatedUser.savedCartItems);
    const mergedCartItems = normalizeSavedCartItems([...serverCartItems, ...guestCartItems]);

    if (arraysEqual(serverWishlistIds, mergedWishlistIds) && cartItemsEqual(serverCartItems, mergedCartItems)) {
      localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      return { ...authenticatedUser, wishlistIds: serverWishlistIds, savedCartItems: serverCartItems };
    }

    try {
      const [wishlistResponse, cartResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/user/wishlist`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ wishlistIds: mergedWishlistIds }),
        }),
        fetch(`${API_BASE_URL}/user/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ savedCartItems: mergedCartItems }),
        }),
      ]);

      const wishlistData = await wishlistResponse.json();
      const cartData = await cartResponse.json();
      if (!wishlistResponse.ok) {
        throw new Error(wishlistData.message || 'Không thể đồng bộ wishlist');
      }
      if (!cartResponse.ok) {
        throw new Error(cartData.message || 'Không thể đồng bộ giỏ hàng');
      }
      localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
      localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      return {
        ...authenticatedUser,
        wishlistIds: normalizeWishlistIds(wishlistData.wishlistIds),
        savedCartItems: normalizeSavedCartItems(cartData.savedCartItems),
      };
    } catch {
      return {
        ...authenticatedUser,
        wishlistIds: mergedWishlistIds,
        savedCartItems: mergedCartItems,
      };
    }
  };

  const syncCartToServer = async (nextCart: CartItem[]) => {
    const payload = normalizeSavedCartItems(
      nextCart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))
    );
    const response = await authFetch(`${API_BASE_URL}/user/cart`, {
      method: 'PUT',
      body: JSON.stringify({ savedCartItems: payload }),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : { message: await response.text() };
    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật giỏ hàng');
    }
    const serverCartItems = normalizeSavedCartItems(data.savedCartItems);
    const nextMappedCart = buildCartFromSavedItems(serverCartItems, products);
    setCart(nextMappedCart);
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      const updatedUser = { ...currentUser, savedCartItems: serverCartItems };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  useEffect(() => {
    const currentToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!currentToken && !currentRefreshToken) {
      return;
    }

    const verifyToken = async () => {
      try {
        let token = localStorage.getItem(TOKEN_STORAGE_KEY);
        let response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok && response.status === 401) {
          token = await refreshAccessToken();

          response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }

        if (!response.ok) {
          throw new Error('Phiên đăng nhập đã hết hạn');
        }

        const data = await response.json();
        const authenticatedUser = data.user as User;
        setUser(authenticatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authenticatedUser));
      } catch {
        setUser(null);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    };

    verifyToken();
  }, []);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setOrders([]);
        return;
      }

      try {
        // `orders` represents "my orders" for the signed-in account.
        // Admin dashboard fetches system-wide orders separately.
        const endpoint = '/user/orders';
        const currentUserId = user.id;
        const response = await authFetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error('Không thể tải đơn hàng');
        }
        const data = await response.json();
        if (currentUserId === user.id) {
          setOrders((data.orders || []) as Order[]);
        }
      } catch {
        setOrders([]);
      }
    };

    loadOrders();
  }, [user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const availableStock = Number(product.stock ?? 0);
    if (availableStock <= 0) {
      throw new Error('Sản phẩm này đã hết hàng');
    }

    let error: Error | null = null;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let nextCart: CartItem[] = prev;
      if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (nextQuantity > availableStock) {
          error = new Error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
          return prev;
        }
        nextCart = prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      } else {
        if (quantity > availableStock) {
          error = new Error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
          return prev;
        }
        nextCart = [...prev, { product, quantity }];
      }

      if (user) {
        const rollbackCart = prev;
        void syncCartToServer(nextCart).catch(() => {
          setCart(rollbackCart);
        });
      }
      return nextCart;
    });

    if (error) throw error;
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const nextCart = prev.filter((item) => item.product.id !== productId);
      if (user) {
        const rollbackCart = prev;
        void syncCartToServer(nextCart).catch(() => {
          setCart(rollbackCart);
        });
      }
      return nextCart;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const availableStock = Number(product?.stock ?? 0);
    if (availableStock > 0 && quantity > availableStock) {
      throw new Error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
    }
    setCart((prev) => {
      const nextCart = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      if (user) {
        const rollbackCart = prev;
        void syncCartToServer(nextCart).catch(() => {
          setCart(rollbackCart);
        });
      }
      return nextCart;
    });
  };

  const clearCart = () => {
    setCart((prev) => {
      if (user) {
        const rollbackCart = prev;
        void syncCartToServer([]).catch(() => {
          setCart(rollbackCart);
        });
      }
      return [];
    });
  };

  useEffect(() => {
    if (!user) {
      localStorage.setItem(GUEST_WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
    }
  }, [wishlistIds, user]);

  useEffect(() => {
    if (!user) {
      const guestCartItems = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(normalizeSavedCartItems(guestCartItems)));
    }
  }, [cart, user]);

  const toggleWishlist = (productId: number) => {
    setWishlistIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];

      if (user) {
        const previous = prev;
        const normalizedNext = normalizeWishlistIds(next);
        void (async () => {
          try {
            const response = await authFetch(`${API_BASE_URL}/user/wishlist`, {
              method: 'PUT',
              body: JSON.stringify({ wishlistIds: normalizedNext }),
            });
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
              ? await response.json()
              : { message: await response.text() };
            if (!response.ok) {
              throw new Error(data.message || 'Không thể cập nhật wishlist');
            }
            const serverWishlistIds = normalizeWishlistIds(data.wishlistIds);
            setWishlistIds(serverWishlistIds);
            setUser((currentUser) => {
              if (!currentUser) return currentUser;
              const updatedUser = { ...currentUser, wishlistIds: serverWishlistIds };
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
              return updatedUser;
            });
          } catch {
            setWishlistIds(previous);
          }
        })();
      }

      return next;
    });
  };

  const isInWishlist = (productId: number) => wishlistIds.includes(productId);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập thất bại');
    }

    const loggedInUser = await syncGuestDataAfterAuth(data.user as User, data.token as string);
    setUser(loggedInUser);
    setWishlistIds(normalizeWishlistIds(loggedInUser.wishlistIds));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token as string);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken as string);
    return loggedInUser;
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };
    if (!response.ok) {
      throw new Error(data.message || 'Đăng nhập Google thất bại');
    }

    const loggedInUser = await syncGuestDataAfterAuth(data.user as User, data.token as string);
    setUser(loggedInUser);
    setWishlistIds(normalizeWishlistIds(loggedInUser.wishlistIds));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token as string);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken as string);
    return loggedInUser;
  };

  const register = async (payload: { name: string; email: string; password: string }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Đăng ký thất bại');
    }

    const createdUser = await syncGuestDataAfterAuth(data.user as User, data.token as string);
    setUser(createdUser);
    setWishlistIds(normalizeWishlistIds(createdUser.wishlistIds));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(createdUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token as string);
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, data.refreshToken as string);
    return createdUser;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch {
        // ignore network/logout failures on client cleanup
      }
    }

    setUser(null);
    clearAuthStorage();
  };

  const setPassword = async (payload: { currentPassword?: string; newPassword: string }) => {
    const response = await authFetch(`${API_BASE_URL}/auth/set-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể đặt mật khẩu');
    }
    const updatedUser = data.user as User;
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updateProfile = async (payload: {
    name?: string;
    phone?: string;
    defaultShippingAddress?: {
      name: string;
      address: string;
      city: string;
      zipCode: string;
      country: string;
    };
    shippingAddresses?: Array<{
      label: string;
      name: string;
      address: string;
      city: string;
      zipCode: string;
      country: string;
      isDefault?: boolean;
    }>;
    savedPaymentMethods?: Array<{
      label: string;
      cardName: string;
      brand: string;
      last4: string;
      expiryDate: string;
      isDefault?: boolean;
    }>;
  }) => {
    const response = await authFetch(`${API_BASE_URL}/user/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật hồ sơ');
    }
    const updatedUser = data.user as User;
    setUser(updatedUser);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  };

  const addOrder = async (order: Order) => {
    const sanitizedItems = order.items
      .filter((item) => Number(item.quantity) > 0 && Number(item.product?.price) >= 0)
      .map((item) => ({
        product: {
          id: Number(item.product.id),
          name: item.product.name,
          price: Number(item.product.price),
          category: item.product.category,
          // Avoid sending large base64 data URLs in checkout payload.
          image: item.product.image?.startsWith('data:image/') ? '' : item.product.image,
        },
        quantity: Number(item.quantity),
      }));

    const response = await authFetch(`${API_BASE_URL}/user/orders`, {
      method: 'POST',
      body: JSON.stringify({
        items: sanitizedItems,
        total: order.total,
        paymentMethod: order.paymentMethod || 'card',
        shippingAddress: order.shippingAddress,
      }),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };
    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Dữ liệu đơn hàng quá lớn. Vui lòng dùng ảnh sản phẩm nhỏ hơn.');
      }
      throw new Error(data.detail || data.message || 'Không thể đặt hàng');
    }

    setOrders((prev) => [data.order as Order, ...prev]);
    await refreshProducts();
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const response = await authFetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể cập nhật trạng thái đơn hàng');
    }

    setOrders((prev) => prev.map((order) => (order.id === orderId ? (data.order as Order) : order)));
  };

  const addProductReview = async (productId: number, payload: { rating: number; comment: string }) => {
    const response = await authFetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Không thể gửi đánh giá');
    }
    const updatedProduct = data.product as Product;
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? localizeProduct({ ...p, ...updatedProduct }) : p))
    );
    return updatedProduct;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        products,
        productsLoading,
        refreshProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        user,
        login,
        loginWithGoogle,
        register,
        setPassword,
        logout,
        updateProfile,
        orders,
        addOrder,
        updateOrderStatus,
        addProductReview,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  return context;
}
