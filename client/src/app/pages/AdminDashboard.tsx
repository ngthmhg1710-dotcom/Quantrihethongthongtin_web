import React, { useEffect, useMemo, useState } from 'react';
import { Product, Order } from '../data/products';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

interface Category {
  _id: string;
  name: string;
  description?: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  averageOrderValue: number;
}

const API_BASE_URL = 'http://localhost:5000/api';
const DEFAULT_CATEGORY_OPTIONS = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Eye Cream',
  'Mask',
  'Night Cream',
  'Lip Care',
  'Exfoliator',
  'Essence',
  'Ampoule',
  'Body Care',
  'Makeup Remover',
];

export function AdminDashboard() {
  const { user, logout, refreshProducts } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    averageOrderValue: 0,
  });
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    category: '',
    description: '',
    ingredients: '',
    skinTypes: '',
  });
  const [productFormErrors, setProductFormErrors] = useState<{
    name?: string;
    category?: string;
    image?: string;
    price?: string;
    stock?: string;
    description?: string;
    ingredients?: string;
    skinTypes?: string;
  }>({});
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | Order['status']>('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderSortBy, setOrderSortBy] = useState<'date' | 'total'>('date');
  const [orderSortDirection, setOrderSortDirection] = useState<'asc' | 'desc'>('desc');
  const [orderPage, setOrderPage] = useState(1);
  const [orderPageSize, setOrderPageSize] = useState(8);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!user || !user.isAdmin) {
    navigate('/login');
    return null;
  }

  const refreshToken = async () => {
    const storedRefresh = localStorage.getItem('app_refresh_token');
    if (!storedRefresh) throw new Error('Session expired');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!response.ok) throw new Error('Session expired');
    const data = await response.json();
    localStorage.setItem('app_token', data.token as string);
    localStorage.setItem('app_refresh_token', data.refreshToken as string);
    localStorage.setItem('app_user', JSON.stringify(data.user));
    return data.token as string;
  };

  const adminFetch = async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('app_token');
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');

    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      token = await refreshToken();
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set('Authorization', `Bearer ${token}`);
      if (!retryHeaders.has('Content-Type') && options.body) retryHeaders.set('Content-Type', 'application/json');
      response = await fetch(url, { ...options, headers: retryHeaders });
    }
    return response;
  };

  const readResponseData = async (response: Response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }
    const text = await response.text();
    return { message: text };
  };

  const loadAdminData = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        adminFetch(`${API_BASE_URL}/admin/categories`),
        adminFetch(`${API_BASE_URL}/admin/orders`),
        adminFetch(`${API_BASE_URL}/admin/dashboard`),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersData = await ordersRes.json();
      const dashboardData = await dashboardRes.json();

      setProducts((productsData || []) as Product[]);
      setCategories((categoriesData.categories || []) as Category[]);
      setOrders((ordersData.orders || []) as Order[]);
      setStats(dashboardData.stats || stats);
      setMonthlyStats(dashboardData.monthlyStats || []);
      await refreshProducts();
    } catch {
      toast.error('Failed to load admin data');
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const resetProductForm = () => {
    setProductForm({ name: '', price: '', stock: '', image: '', category: '', description: '', ingredients: '', skinTypes: '' });
    setEditingProductId(null);
    setProductFormErrors({});
  };

  const parseCommaList = (value: string) =>
    value
      .split(/[,\n]/g)
      .map((item) => item.trim())
      .filter(Boolean);

  const validateProductForm = () => {
    const errors: {
      name?: string;
      category?: string;
      image?: string;
      price?: string;
      stock?: string;
      description?: string;
      ingredients?: string;
      skinTypes?: string;
    } = {};
    const name = productForm.name.trim();
    const category = productForm.category.trim();
    const description = productForm.description.trim();
    const image = productForm.image.trim();
    const price = Number(productForm.price);
    const stock = Number(productForm.stock);
    const ingredients = parseCommaList(productForm.ingredients);
    const skinTypes = parseCommaList(productForm.skinTypes);

    if (!name) errors.name = 'Product name is required';
    if (!category) errors.category = 'Please select a category';
    if (!description || description.length < 20) errors.description = 'Description must be at least 20 characters';
    if (!image) {
      errors.image = 'Please upload an image from your device';
    } else if (!editingProductId && !image.startsWith('data:image/')) {
      errors.image = 'New product image must be uploaded from your device';
    } else if (editingProductId && !image.startsWith('data:image/') && !/^https?:\/\//i.test(image)) {
      errors.image = 'Image format is invalid';
    }
    if (!Number.isFinite(price) || price < 0) errors.price = 'Price must be a non-negative number';
    if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Stock must be an integer >= 0';
    if (ingredients.length === 0) errors.ingredients = 'Please enter at least 1 ingredient (comma separated)';
    if (skinTypes.length === 0) errors.skinTypes = 'Please enter at least 1 skin type (comma separated)';
    return errors;
  };

  const submitProduct = async () => {
    try {
      const formErrors = validateProductForm();
      const firstError = Object.values(formErrors).find(Boolean);
      if (firstError) {
        setProductFormErrors(formErrors);
        toast.error(firstError);
        return;
      }
      setProductFormErrors({});
      const payload = {
        ...productForm,
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
        ingredients: parseCommaList(productForm.ingredients),
        skinTypes: parseCommaList(productForm.skinTypes),
      };
      const endpoint = editingProductId ? `${API_BASE_URL}/admin/products/${editingProductId}` : `${API_BASE_URL}/admin/products`;
      const response = await adminFetch(endpoint, {
        method: editingProductId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      const data = await readResponseData(response);
      if (!response.ok) {
        if (response.status === 413) {
          throw new Error('Image is too large. Please choose a smaller file (under ~5MB).');
        }
        throw new Error((data as { message?: string } | null)?.message || 'Failed to save product');
      }
      toast.success(editingProductId ? 'Product updated' : 'Product created');
      resetProductForm();
      setIsProductModalOpen(false);
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/products/${productId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete product');
      toast.success('Product deleted');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const submitCategory = async () => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create category');
      toast.success('Category created');
      setCategoryForm({ name: '', description: '' });
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category');
    }
  };

  const addDefaultCategories = async () => {
    try {
      const existing = new Set(categories.map((c) => c.name.toLowerCase()));
      const missing = DEFAULT_CATEGORY_OPTIONS.filter((name) => !existing.has(name.toLowerCase()));
      if (missing.length === 0) {
        toast.success('Default categories are already added');
        return;
      }

      await Promise.all(
        missing.map((name) =>
          adminFetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            body: JSON.stringify({ name, description: `${name} products` }),
          })
        )
      );
      toast.success(`Added ${missing.length} default categories`);
      await loadAdminData();
    } catch {
      toast.error('Failed to add default categories');
    }
  };

  const handleImageFileChange = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
      setProductForm((prev) => ({ ...prev, image: dataUrl }));
      setProductFormErrors((prev) => ({ ...prev, image: undefined }));
      toast.success('Image loaded from your device');
    } catch {
      toast.error('Failed to load image file');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete category');
      toast.success('Category deleted');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const onUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      setOrders((prev) => prev.map((order) => (order.id === orderId ? (data.order as Order) : order)));
      toast.success('Order status updated');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORY_OPTIONS, ...categories.map((category) => category.name)])
  ).sort((a, b) => a.localeCompare(b));
  const isUploadedImage = productForm.image.startsWith('data:image/');
  const latestMonthStats = monthlyStats[monthlyStats.length - 1];
  const previousMonthStats = monthlyStats[monthlyStats.length - 2];
  const revenueDeltaPercent =
    previousMonthStats && previousMonthStats.revenue > 0
      ? ((latestMonthStats?.revenue ?? 0) - previousMonthStats.revenue) / previousMonthStats.revenue
      : null;
  const deliveredOrdersCount = orders.filter((order) => order.status === 'delivered').length;
  const processingOrdersCount = orders.filter((order) => order.status === 'processing').length;
  const pendingOrdersCount = orders.filter((order) => order.status === 'pending').length;
  const filteredOrders = useMemo(() => {
    const keyword = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const statusMatched = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      const searchableText = [
        order.id,
        order.user?.name,
        order.user?.email,
        order.shippingAddress?.name,
        order.shippingAddress?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const searchMatched = !keyword || searchableText.includes(keyword);
      return statusMatched && searchMatched;
    });
  }, [orders, orderSearch, orderStatusFilter]);
  const parseOrderDate = (order: Order) => {
    const candidate = order.placedAt || order.date;
    const time = new Date(candidate).getTime();
    return Number.isNaN(time) ? 0 : time;
  };
  const formatOrderDate = (order: Order) => {
    const candidate = order.placedAt || order.date;
    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) return order.date;
    return parsed.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const sortedOrders = useMemo(() => {
    const sorted = [...filteredOrders];
    sorted.sort((a, b) => {
      const left = orderSortBy === 'total' ? a.total : parseOrderDate(a);
      const right = orderSortBy === 'total' ? b.total : parseOrderDate(b);
      return orderSortDirection === 'asc' ? left - right : right - left;
    });
    return sorted;
  }, [filteredOrders, orderSortBy, orderSortDirection]);
  const totalOrderPages = Math.max(1, Math.ceil(sortedOrders.length / orderPageSize));
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * orderPageSize;
    return sortedOrders.slice(start, start + orderPageSize);
  }, [sortedOrders, orderPage, orderPageSize]);
  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderStatusFilter, orderSortBy, orderSortDirection, orderPageSize]);
  useEffect(() => {
    if (orderPage > totalOrderPages) setOrderPage(totalOrderPages);
  }, [orderPage, totalOrderPages]);
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  const getOrderStatusBadgeClass = (status: Order['status']) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'processing') return 'bg-blue-100 text-blue-700';
    if (status === 'shipped') return 'bg-purple-100 text-purple-700';
    return 'bg-green-100 text-green-700';
  };
  const toggleOrderSort = (field: 'date' | 'total') => {
    if (orderSortBy === field) {
      setOrderSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setOrderSortBy(field);
    setOrderSortDirection(field === 'date' ? 'desc' : 'asc');
  };
  const handleCopyOrderId = async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success('Order ID copied');
    } catch {
      toast.error('Unable to copy order ID');
    }
  };
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Cannot open print window');
      return;
    }
    const rows = order.items
      .map((item) => {
        const lineTotal = item.product.price * item.quantity;
        return `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(item.product.price)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(lineTotal)}</td></tr>`;
      })
      .join('');
    printWindow.document.write(`
      <html>
        <head><title>Invoice ${order.id}</title></head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Order ${order.id}</h2>
          <p><strong>Date:</strong> ${order.date}</p>
          <p><strong>Customer:</strong> ${order.user?.name || order.shippingAddress.name}</p>
          <p><strong>Shipping:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            <thead>
              <tr><th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Item</th><th style="padding:8px;border-bottom:2px solid #ddd;">Qty</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Price</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="text-align:right; margin-top:20px;">Grand Total: ${formatCurrency(order.total)}</h3>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-['Poppins'] text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your cosmetic store</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'products' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Categories
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-black text-white p-5">
                <p className="text-xs text-gray-300">Current month revenue</p>
                <p className="text-2xl font-semibold mt-1">{latestMonthStats ? formatCurrency(latestMonthStats.revenue) : '--'}</p>
                <p className="text-xs text-gray-300 mt-1">{latestMonthStats?.month || 'No monthly data yet'}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs text-gray-500">Orders this month</p>
                <p className="text-2xl font-semibold mt-1">{latestMonthStats?.orders ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">From monthly statistics</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs text-gray-500">Pending now</p>
                <p className="text-2xl font-semibold mt-1">{pendingOrdersCount}</p>
                <p className="text-xs text-gray-500 mt-1">Need admin attention</p>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  {revenueDeltaPercent !== null && (
                    <span className={`text-sm flex items-center gap-1 ${revenueDeltaPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="w-4 h-4" />
                      {(revenueDeltaPercent * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-sm text-gray-500">{processingOrdersCount} processing</span>
                </div>
                <p className="text-2xl font-bold mb-1">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-sm text-gray-500">{deliveredOrdersCount} delivered</span>
                </div>
                <p className="text-2xl font-bold mb-1">{formatCurrency(stats.averageOrderValue)}</p>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Poppins'] font-semibold text-xl">Revenue Overview</h2>
                  <p className="text-xs text-gray-500">{latestMonthStats ? `Latest: ${latestMonthStats.month}` : 'No monthly data yet'}</p>
                </div>
                {monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="revenue" fill="#FFC0CB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                    No revenue data yet
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Orders Trend</h2>
                {monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#000000" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                    No order trend data yet
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Top Selling Products</h2>
              <div className="space-y-4">
                {products.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                    <span className="text-2xl font-bold text-gray-300 w-8">#{index + 1}</span>
                    <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${product.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">245 sold</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-['Poppins'] font-semibold text-lg">Product Management</h2>
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-500">
                    {products.length} products • Click a row to edit
                  </p>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setIsProductModalOpen(true);
                    }}
                    className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold whitespace-nowrap">Stock</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold whitespace-nowrap w-[112px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`${index !== products.length - 1 ? 'border-b border-gray-200' : ''} ${
                        editingProductId === product.id ? 'bg-[#FFE4E9]' : ''
                      } cursor-pointer`}
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductFormErrors({});
                        setProductForm({
                          name: product.name,
                          category: product.category,
                          image: product.image,
                          price: String(product.price),
                          stock: String(product.stock ?? 0),
                          description: product.description,
                          ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : '',
                          skinTypes: Array.isArray(product.skinTypes) ? product.skinTypes.join(', ') : '',
                        });
                        setIsProductModalOpen(true);
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <span className="font-semibold">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{product.category}</td>
                      <td className="px-5 py-4 font-semibold">${product.price.toFixed(2)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center min-w-[88px] px-2.5 py-0.5 rounded-full text-xs font-medium leading-5 ${
                            Number(product.stock ?? 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {Number(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingProductId(product.id);
                              setProductFormErrors({});
                              setProductForm({
                                name: product.name,
                                category: product.category,
                                image: product.image,
                                price: String(product.price),
                                stock: String(product.stock ?? 0),
                                description: product.description,
                                ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : '',
                                skinTypes: Array.isArray(product.skinTypes) ? product.skinTypes.join(', ') : '',
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProduct(product.id);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {isProductModalOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/45 flex items-center justify-center p-4"
            onClick={() => {
              setIsProductModalOpen(false);
              resetProductForm();
            }}
          >
            <div
              className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-5 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Poppins'] font-semibold text-xl">
                  {editingProductId ? `Edit Product #${editingProductId}` : 'Add New Product'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-3 bg-white border border-gray-200 rounded-xl p-4">
                  <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
                  <input
                    value={productForm.name}
                    onChange={(e) => {
                      setProductForm({ ...productForm, name: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Product name"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.name && <p className="mt-1 text-xs text-red-600">{productFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      setProductForm({ ...productForm, category: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
                  </select>
                  {productFormErrors.category && <p className="mt-1 text-xs text-red-600">{productFormErrors.category}</p>}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700">Product image</p>
                    {productForm.image && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                        {isUploadedImage ? 'From device' : 'From URL'}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Upload from device</p>
                    <label className="inline-flex items-center justify-center px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      Choose image file
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-[11px] text-gray-500">PNG, JPG, WEBP (recommended under 2MB)</p>
                    {!isUploadedImage && productForm.image && (
                      <p className="mt-2 text-[11px] text-amber-700">
                        This product is using an old URL image. Upload a new file to replace it.
                      </p>
                    )}
                  </div>
                  {uploadingImage && <p className="mt-2 text-sm text-gray-500">Uploading image...</p>}
                  {productFormErrors.image && <p className="mt-2 text-xs text-red-600">{productFormErrors.image}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => {
                        setProductForm({ ...productForm, price: e.target.value });
                        setProductFormErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      placeholder="Price"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {productFormErrors.price && <p className="mt-1 text-xs text-red-600">{productFormErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={productForm.stock}
                      onChange={(e) => {
                        setProductForm({ ...productForm, stock: e.target.value });
                        setProductFormErrors((prev) => ({ ...prev, stock: undefined }));
                      }}
                      placeholder="Stock"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {productFormErrors.stock && <p className="mt-1 text-xs text-red-600">{productFormErrors.stock}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => {
                      setProductForm({ ...productForm, description: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    placeholder="Description"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.description && <p className="mt-1 text-xs text-red-600">{productFormErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ingredients</label>
                  <textarea
                    value={productForm.ingredients}
                    onChange={(e) => {
                      setProductForm({ ...productForm, ingredients: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, ingredients: undefined }));
                    }}
                    placeholder="Hyaluronic Acid, Niacinamide, Vitamin C"
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.ingredients && <p className="mt-1 text-xs text-red-600">{productFormErrors.ingredients}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Skin Types</label>
                  <input
                    value={productForm.skinTypes}
                    onChange={(e) => {
                      setProductForm({ ...productForm, skinTypes: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, skinTypes: undefined }));
                    }}
                    placeholder="dry, normal, sensitive"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.skinTypes && <p className="mt-1 text-xs text-red-600">{productFormErrors.skinTypes}</p>}
                </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={submitProduct} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 min-w-[132px]">
                      <Plus className="w-4 h-4" />
                      {editingProductId ? 'Update Product' : 'Add Product'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductModalOpen(false);
                        resetProductForm();
                      }}
                      className="px-4 py-2 border rounded-full min-w-[92px]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 h-fit lg:sticky lg:top-4">
                  <p className="text-xs text-gray-500 mb-2">Preview (user view)</p>
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="aspect-[4/3] bg-gray-100">
                      {productForm.image ? (
                        <img src={productForm.image} alt="Product preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{productForm.category || 'Category'}</p>
                      <h3 className="font-semibold mt-1">{productForm.name || 'Product name'}</h3>
                      <p className="text-base font-bold mt-2">${Number(productForm.price || 0).toFixed(2)}</p>
                      <p className={`text-sm mt-1 ${Number(productForm.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(productForm.stock || 0) > 0
                          ? `${Math.floor(Number(productForm.stock || 0))} in stock`
                          : 'Out of stock'}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                        {productForm.description || 'Product description preview will appear here.'}
                      </p>
                      {parseCommaList(productForm.skinTypes).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {parseCommaList(productForm.skinTypes)
                            .slice(0, 3)
                            .map((type) => (
                              <span key={type} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE4E9]">
                                {type}
                              </span>
                            ))}
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={Number(productForm.stock || 0) <= 0}
                        className={`mt-3 w-full py-2 rounded-full text-sm ${
                          Number(productForm.stock || 0) > 0
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {Number(productForm.stock || 0) > 0 ? 'Add to Cart' : 'Out of stock'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <h2 className="font-['Poppins'] font-semibold text-xl">Order Management</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by order ID, customer, city..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[260px]"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | Order['status'])}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value as 'date' | 'total')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="date">Sort by date</option>
                    <option value="total">Sort by total</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setOrderSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                  >
                    {orderSortDirection === 'asc' ? 'Asc' : 'Desc'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-semibold mt-1">{orders.length}</p>
                </div>
                <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/60">
                  <p className="text-xs text-amber-700">Pending</p>
                  <p className="text-xl font-semibold mt-1">{pendingOrdersCount}</p>
                </div>
                <div className="rounded-xl border border-blue-200 p-4 bg-blue-50/60">
                  <p className="text-xs text-blue-700">Processing</p>
                  <p className="text-xl font-semibold mt-1">{processingOrdersCount}</p>
                </div>
                <div className="rounded-xl border border-green-200 p-4 bg-green-50/60">
                  <p className="text-xs text-green-700">Delivered</p>
                  <p className="text-xl font-semibold mt-1">{deliveredOrdersCount}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[560px]">
                  <table className="w-full min-w-[980px]">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          <button
                            type="button"
                            onClick={() => toggleOrderSort('date')}
                            className="inline-flex items-center gap-1 hover:text-black"
                          >
                            Date
                            {orderSortBy === 'date' && <span>{orderSortDirection === 'asc' ? '↑' : '↓'}</span>}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          <button
                            type="button"
                            onClick={() => toggleOrderSort('total')}
                            className="inline-flex items-center gap-1 hover:text-black"
                          >
                            Total
                            {orderSortBy === 'total' && <span>{orderSortDirection === 'asc' ? '↑' : '↓'}</span>}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Shipping Code</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.map((order) => (
                        <tr key={order.id} className="border-t border-gray-200 hover:bg-gray-50/70">
                          <td className="px-4 py-3 font-medium">{order.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{order.user?.name || order.shippingAddress.name}</p>
                            <p className="text-xs text-gray-500">{order.user?.email || order.shippingAddress.city}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{formatOrderDate(order)}</td>
                          <td className="px-4 py-3 text-sm">{order.items.length}</td>
                          <td className="px-4 py-3 font-semibold">{formatCurrency(order.total)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={async (e) => {
                                try {
                                  await onUpdateOrderStatus(order.id, e.target.value as typeof order.status);
                                } catch (error) {
                                  const message = error instanceof Error ? error.message : 'Failed to update status';
                                  toast.error(message);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs border bg-white ${getOrderStatusBadgeClass(order.status)}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.shippingCode || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-100"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(order.id)}
                                className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-100"
                              >
                                Copy ID
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintOrder(order)}
                                className="px-3 py-1.5 text-xs bg-black text-white rounded-full hover:bg-gray-800"
                              >
                                Print
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {paginatedOrders.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No orders match your filter</p>
                  </div>
                )}
              </div>

              {sortedOrders.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Showing {(orderPage - 1) * orderPageSize + 1}-{Math.min(orderPage * orderPageSize, sortedOrders.length)} of {sortedOrders.length} orders
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={orderPageSize}
                      onChange={(e) => setOrderPageSize(Number(e.target.value))}
                      className="px-2 py-1.5 border rounded-lg text-sm bg-white"
                    >
                      <option value={8}>8 / page</option>
                      <option value={12}>12 / page</option>
                      <option value={20}>20 / page</option>
                    </select>
                    <button
                      type="button"
                      disabled={orderPage === 1}
                      onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700">
                      {orderPage} / {totalOrderPages}
                    </span>
                    <button
                      type="button"
                      disabled={orderPage === totalOrderPages}
                      onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                      className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedOrder && (
          <div
            className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <div
              className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-5 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-['Poppins'] font-semibold text-xl">Order Details</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(selectedOrder.id)}
                    className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                  >
                    Copy ID
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="px-3 py-1.5 text-sm bg-black text-white rounded-full hover:bg-gray-800"
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="font-semibold">{selectedOrder.user?.name || selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user?.email || 'No email provided'}</p>
                  <p className="text-sm text-gray-600 mt-2">Date: {formatOrderDate(selectedOrder)}</p>
                  <p className="text-sm text-gray-600 mt-1">Shipping code: {selectedOrder.shippingCode || '-'}</p>
                  <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                  <p className="font-semibold">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress.zipCode}, {selectedOrder.shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold">Items ({selectedOrder.items.length})</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="p-4 flex gap-3 items-center">
                      <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.category}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatCurrency(item.product.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Order total</p>
                <p className="text-xl font-bold">{formatCurrency(selectedOrder.total)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-4">Category Management</h2>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Category name" className="px-3 py-2 border rounded-lg" />
                <input value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} placeholder="Description" className="px-3 py-2 border rounded-lg md:col-span-2" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={submitCategory} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">Add Category</button>
                <button onClick={addDefaultCategories} className="px-4 py-2 border rounded-full hover:bg-gray-100 transition-colors">Add Default Categories</button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description || 'No description'}</p>
                  </div>
                  <button onClick={() => removeCategory(category._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-gray-600">No categories found</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
