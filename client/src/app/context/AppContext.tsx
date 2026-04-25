import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem, Product, Order, products as localProducts } from '../data/products';

interface User {
  id: string;
  name: string;
  email: string;
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
  defaultShippingAddress?: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
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
  register: (payload: { name: string; email: string; password: string }) => Promise<User>;
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
  }) => Promise<User>;
  orders: Order[];
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  addProductReview: (productId: number, payload: { rating: number; comment: string }) => Promise<Product>;
}

const defaultAppContext: AppContextType = {
  products: localProducts,
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
    throw new Error('App context is not ready');
  },
  register: async () => {
    throw new Error('App context is not ready');
  },
  logout: async () => {},
  updateProfile: async () => {
    throw new Error('App context is not ready');
  },
  orders: [],
  addOrder: async () => {
    throw new Error('App context is not ready');
  },
  updateOrderStatus: async () => {
    throw new Error('App context is not ready');
  },
  addProductReview: async () => {
    throw new Error('App context is not ready');
  },
};

const AppContext = createContext<AppContextType>(defaultAppContext);
const API_BASE_URL = 'http://localhost:5000/api';
const USER_STORAGE_KEY = 'app_user';
const TOKEN_STORAGE_KEY = 'app_token';
const REFRESH_TOKEN_STORAGE_KEY = 'app_refresh_token';
const WISHLIST_STORAGE_KEY = 'app_wishlist_ids';

export function AppProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = saved ? (JSON.parse(saved) as unknown) : [];
      return Array.isArray(parsed) ? parsed.map((v) => Number(v)).filter((v) => Number.isInteger(v) && v > 0) : [];
    } catch {
      return [];
    }
  });

  const refreshProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
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

      setProducts(normalized.length > 0 ? normalized : localProducts);
    } catch {
      setProducts(localProducts);
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

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!refreshToken) {
      throw new Error('Session expired');
    }

    const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!refreshResponse.ok) {
      throw new Error('Session expired');
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
          throw new Error('Session expired');
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
        const endpoint = user.isAdmin ? '/admin/orders' : '/user/orders';
        const response = await authFetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
          throw new Error('Failed to load orders');
        }
        const data = await response.json();
        setOrders((data.orders || []) as Order[]);
      } catch {
        setOrders([]);
      }
    };

    loadOrders();
  }, [user]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const availableStock = Number(product.stock ?? 0);
    if (availableStock <= 0) {
      throw new Error('This product is out of stock');
    }

    let error: Error | null = null;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (nextQuantity > availableStock) {
          error = new Error(`Only ${availableStock} items left in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }

      if (quantity > availableStock) {
        error = new Error(`Only ${availableStock} items left in stock`);
        return prev;
      }
      return [...prev, { product, quantity }];
    });

    if (error) throw error;
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    const availableStock = Number(product?.stock ?? 0);
    if (availableStock > 0 && quantity > availableStock) {
      throw new Error(`Only ${availableStock} items left in stock`);
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  const toggleWishlist = (productId: number) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
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
      throw new Error(data.message || 'Login failed');
    }

    const loggedInUser = data.user as User;
    setUser(loggedInUser);
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
      throw new Error(data.message || 'Registration failed');
    }

    const createdUser = data.user as User;
    setUser(createdUser);
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
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
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
  }) => {
    const response = await authFetch(`${API_BASE_URL}/user/profile`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
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
        shippingAddress: order.shippingAddress,
      }),
    });
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };
    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Order payload is too large. Please use smaller product images.');
      }
      throw new Error(data.detail || data.message || 'Failed to place order');
    }

    setOrders((prev) => [data.order as Order, ...prev]);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const response = await authFetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order status');
    }

    setOrders((prev) => prev.map((order) => (order.id === orderId ? (data.order as Order) : order)));
  };

  const addProductReview = async (productId: number, payload: { rating: number; comment: string }) => {
    const response = await authFetch(`${API_BASE_URL}/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit review');
    }
    const updatedProduct = data.product as Product;
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)));
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
        register,
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
