import React, { useEffect, useMemo, useState } from 'react';
import { Product, Order } from '../data/products';
import { useApp } from '../context/AppContext';
import { localizeCategory, localizeProduct } from '../utils/localization';
import { formatVnd } from '../utils/currency';
import { skinTypeLabelVi } from '../utils/skinTypes';
import { useNavigate } from 'react-router';
import { Package, DollarSign, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Search, X, Mail } from 'lucide-react';
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
interface TopProduct {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  sold: number;
}
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  sentAt: string;
}

const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
const DEFAULT_CATEGORY_OPTIONS = [
  'Sữa rửa mặt',
  'Nước cân bằng',
  'Serum',
  'Kem dưỡng ẩm',
  'Kem chống nắng',
  'Kem mắt',
  'Mặt nạ',
  'Kem dưỡng đêm',
  'Chăm sóc môi',
  'Tẩy tế bào chết',
  'Tinh chất',
  'Ống tinh chất',
  'Chăm sóc cơ thể',
  'Tẩy trang',
];
const SKIN_TYPE_OPTIONS = ['all', 'dry', 'oily', 'combination', 'normal', 'sensitive', 'mature'];

export function AdminDashboard() {
  const { user, logout, refreshProducts } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'orders' | 'contacts'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<Array<{ month: string; revenue: number; orders: number }>>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    averageOrderValue: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
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
  const [productSearch, setProductSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
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
    if (!storedRefresh) throw new Error('Phiên đăng nhập đã hết hạn');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    });
    if (!response.ok) throw new Error('Phiên đăng nhập đã hết hạn');
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
      const [productsRes, categoriesRes, ordersRes, dashboardRes, contactMessagesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`),
        adminFetch(`${API_BASE_URL}/admin/categories`),
        adminFetch(`${API_BASE_URL}/admin/orders`),
        adminFetch(`${API_BASE_URL}/admin/dashboard`),
        adminFetch(`${API_BASE_URL}/admin/contact-messages`),
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const ordersData = await ordersRes.json();
      const dashboardData = await dashboardRes.json();
      const contactMessagesData = await contactMessagesRes.json();

      setProducts(((productsData || []) as Product[]).map(localizeProduct));
      setCategories(
        ((categoriesData.categories || []) as Category[]).map((category) => ({
          ...category,
          name: localizeCategory(category.name),
        }))
      );
      setOrders((ordersData.orders || []) as Order[]);
      setStats(dashboardData.stats || stats);
      setMonthlyStats(dashboardData.monthlyStats || []);
      setTopProducts((dashboardData.topProducts || []) as TopProduct[]);
      setContactMessages((contactMessagesData.messages || []) as ContactMessage[]);
      await refreshProducts();
    } catch {
      toast.error('Không thể tải dữ liệu quản trị');
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

    if (!name) errors.name = 'Tên sản phẩm là bắt buộc';
    if (!category) errors.category = 'Vui lòng chọn danh mục';
    if (!description || description.length < 20) errors.description = 'Mô tả phải có ít nhất 20 ký tự';
    if (!image) {
      errors.image = 'Vui lòng tải ảnh từ thiết bị của bạn';
    } else if (!editingProductId && !image.startsWith('data:image/')) {
      errors.image = 'Ảnh sản phẩm mới phải được tải từ thiết bị';
    } else if (
      editingProductId &&
      !image.startsWith('data:image/') &&
      !/^https?:\/\//i.test(image) &&
      !image.startsWith('/')
    ) {
      errors.image = 'Định dạng ảnh không hợp lệ';
    }
    if (!Number.isFinite(price) || price < 0) errors.price = 'Giá phải là số không âm';
    if (!Number.isInteger(stock) || stock < 0) errors.stock = 'Tồn kho phải là số nguyên >= 0';
    if (ingredients.length === 0) errors.ingredients = 'Vui lòng nhập ít nhất 1 thành phần';
    if (skinTypes.length === 0) errors.skinTypes = 'Vui lòng chọn ít nhất 1 loại da';
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
          throw new Error('Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn (dưới ~5MB).');
        }
        throw new Error((data as { message?: string } | null)?.message || 'Không thể lưu sản phẩm');
      }
      toast.success(editingProductId ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm');
      resetProductForm();
      setIsProductModalOpen(false);
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu sản phẩm');
    }
  };

  const removeProduct = async (productId: number) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/products/${productId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể xóa sản phẩm');
      toast.success('Đã xóa sản phẩm');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa sản phẩm');
    }
  };

  const submitCategory = async () => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        body: JSON.stringify(categoryForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể tạo danh mục');
      toast.success('Đã tạo danh mục');
      setCategoryForm({ name: '', description: '' });
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo danh mục');
    }
  };

  const addDefaultCategories = async () => {
    try {
      const existing = new Set(categories.map((c) => c.name.toLowerCase()));
      const missing = DEFAULT_CATEGORY_OPTIONS.filter((name) => !existing.has(name.toLowerCase()));
      if (missing.length === 0) {
        toast.success('Danh mục mặc định đã được thêm trước đó');
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
      toast.success(`Đã thêm ${missing.length} danh mục mặc định`);
      await loadAdminData();
    } catch {
      toast.error('Không thể thêm danh mục mặc định');
    }
  };

  const handleImageFileChange = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh'));
        reader.readAsDataURL(file);
      });
      setProductForm((prev) => ({ ...prev, image: dataUrl }));
      setProductFormErrors((prev) => ({ ...prev, image: undefined }));
      toast.success('Đã tải ảnh từ thiết bị');
    } catch {
      toast.error('Không thể tải tệp ảnh');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/categories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể xóa danh mục');
      toast.success('Đã xóa danh mục');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa danh mục');
    }
  };

  const onUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Không thể cập nhật trạng thái');
      setOrders((prev) => prev.map((order) => (order.id === orderId ? (data.order as Order) : order)));
      toast.success('Đã cập nhật trạng thái đơn hàng');
      await loadAdminData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái');
    }
  };

  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORY_OPTIONS, ...categories.map((category) => category.name)])
  ).sort((a, b) => a.localeCompare(b));
  const productImageSrc = productForm.image.trim();
  const isDataUrlImage = productImageSrc.startsWith('data:image/');
  const isExternalHttpImage = /^https?:\/\//i.test(productImageSrc);
  const imageSourceLabel = isDataUrlImage ? 'Từ thiết bị' : isExternalHttpImage ? 'Từ URL' : 'Ảnh trong site';
  const showExternalUrlImageHint = Boolean(productImageSrc) && isExternalHttpImage;
  const latestMonthStats = monthlyStats[monthlyStats.length - 1];
  const previousMonthStats = monthlyStats[monthlyStats.length - 2];
  const revenueDeltaPercent =
    previousMonthStats && previousMonthStats.revenue > 0
      ? ((latestMonthStats?.revenue ?? 0) - previousMonthStats.revenue) / previousMonthStats.revenue
      : null;
  const deliveredOrdersCount = orders.filter((order) => order.status === 'delivered').length;
  const processingOrdersCount = orders.filter((order) => order.status === 'processing').length;
  const pendingOrdersCount = orders.filter((order) => order.status === 'pending').length;
  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter((product) =>
      [product.name, product.category, product.description].join(' ').toLowerCase().includes(keyword)
    );
  }, [products, productSearch]);
  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.trim().toLowerCase();
    if (!keyword) return categories;
    return categories.filter((category) =>
      [category.name, category.description || ''].join(' ').toLowerCase().includes(keyword)
    );
  }, [categories, categorySearch]);
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
  const getOrderStatusBadgeClass = (status: Order['status']) => {
    if (status === 'pending') return 'bg-amber-100 text-amber-700';
    if (status === 'processing') return 'bg-blue-100 text-blue-700';
    if (status === 'shipped') return 'bg-purple-100 text-purple-700';
    return 'bg-green-100 text-green-700';
  };
  const getOrderStatusLabel = (status: Order['status']) => {
    if (status === 'pending') return 'Chờ xử lý';
    if (status === 'processing') return 'Đang xử lý';
    if (status === 'shipped') return 'Đã gửi hàng';
    if (status === 'delivered') return 'Đã giao';
    return status;
  };
  const getPaymentMethodLabel = (method?: string) => {
    if (method === 'card') return 'Thẻ ngân hàng';
    if (method === 'cod') return 'Thanh toán khi nhận hàng';
    if (method === 'bank_transfer') return 'Chuyển khoản';
    return 'Không xác định';
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
      toast.success('Đã sao chép mã đơn hàng');
    } catch {
      toast.error('Không thể sao chép mã đơn hàng');
    }
  };
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      toast.error('Không thể mở cửa sổ in');
      return;
    }
    const rows = order.items
      .map((item) => {
        const lineTotal = item.product.price * item.quantity;
        return `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.product.name}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatVnd(item.product.price)}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatVnd(lineTotal)}</td></tr>`;
      })
      .join('');
    printWindow.document.write(`
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Hóa đơn ${order.id}</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h2>Đơn hàng ${order.id}</h2>
          <p><strong>Ngày đặt:</strong> ${order.date}</p>
          <p><strong>Khách hàng:</strong> ${order.user?.name || order.shippingAddress.name}</p>
          <p><strong>Giao đến:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
          <table style="width:100%; border-collapse:collapse; margin-top:16px;">
            <thead>
              <tr><th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Sản phẩm</th><th style="padding:8px;border-bottom:2px solid #ddd;">SL</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Đơn giá</th><th style="text-align:right;padding:8px;border-bottom:2px solid #ddd;">Thành tiền</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <h3 style="text-align:right; margin-top:20px;">Tổng cộng: ${formatVnd(order.total)}</h3>
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
            <h1 className="font-['Poppins'] text-4xl font-bold mb-2">Bảng điều khiển quản trị</h1>
            <p className="text-gray-600">Quản lý cửa hàng mỹ phẩm của bạn</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'overview' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'products' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'orders' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Đơn hàng
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'categories' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Danh mục
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${
              activeTab === 'contacts' ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Liên hệ ({contactMessages.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-2xl bg-black text-white p-5">
                <p className="text-xs text-gray-300">Doanh thu tháng hiện tại</p>
                <p className="text-2xl font-semibold mt-1">{latestMonthStats ? formatVnd(latestMonthStats.revenue) : '--'}</p>
                <p className="text-xs text-gray-300 mt-1">{latestMonthStats?.month || 'Chưa có dữ liệu theo tháng'}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs text-gray-500">Đơn hàng tháng này</p>
                <p className="text-2xl font-semibold mt-1">{latestMonthStats?.orders ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Từ thống kê theo tháng</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs text-gray-500">Đang chờ xử lý</p>
                <p className="text-2xl font-semibold mt-1">{pendingOrdersCount}</p>
                <p className="text-xs text-gray-500 mt-1">Cần quản trị viên xử lý</p>
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
                <p className="text-2xl font-bold mb-1">{formatVnd(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-sm text-gray-500">{processingOrdersCount} đang xử lý</span>
                </div>
                <p className="text-2xl font-bold mb-1">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stats.totalProducts}</p>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-sm text-gray-500">{deliveredOrdersCount} đã giao</span>
                </div>
                <p className="text-2xl font-bold mb-1">{formatVnd(stats.averageOrderValue)}</p>
                <p className="text-sm text-gray-600">Giá trị đơn TB</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-['Poppins'] font-semibold text-xl">Tổng quan doanh thu</h2>
                  <p className="text-xs text-gray-500">{latestMonthStats ? `Mới nhất: ${latestMonthStats.month}` : 'Chưa có dữ liệu theo tháng'}</p>
                </div>
                {monthlyStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatVnd(Number(value))} />
                      <Bar dataKey="revenue" fill="#FFC0CB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                    Chưa có dữ liệu doanh thu
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Xu hướng đơn hàng</h2>
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
                    Chưa có dữ liệu xu hướng đơn hàng
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Sản phẩm bán chạy</h2>
              <div className="space-y-4">
                {topProducts.length > 0 ? (
                  topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                      <span className="text-2xl font-bold text-gray-300 w-8">#{index + 1}</span>
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-semibold">{localizeProduct(product as unknown as Product).name}</p>
                        <p className="text-sm text-gray-600">{localizeCategory(product.category)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatVnd(Number(product.price || 0))}</p>
                        <p className="text-sm text-gray-600">{product.sold} đã bán</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500">Chưa có dữ liệu bán hàng</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-['Poppins'] font-semibold text-lg">Quản lý sản phẩm</h2>
                <div className="flex items-center gap-3">
                  <input
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Tìm sản phẩm theo tên, danh mục, mô tả..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[280px] bg-white"
                  />
                  <p className="text-sm text-gray-500">
                    {filteredProducts.length}/{products.length} sản phẩm • Bấm vào dòng để chỉnh sửa
                  </p>
                  <button
                    onClick={() => {
                      resetProductForm();
                      setIsProductModalOpen(true);
                    }}
                    className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm sản phẩm
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Sản phẩm</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Danh mục</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold">Giá</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold whitespace-nowrap">Tồn kho</th>
                    <th className="px-5 py-3 text-left text-sm font-semibold whitespace-nowrap w-[112px]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <tr
                      key={product.id}
                      className={`${index !== filteredProducts.length - 1 ? 'border-b border-gray-200' : ''} ${
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
                      <td className="px-5 py-4 font-semibold">{formatVnd(product.price)}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center justify-center min-w-[88px] px-2.5 py-0.5 rounded-full text-xs font-medium leading-5 ${
                            Number(product.stock ?? 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {Number(product.stock ?? 0) > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
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
            {filteredProducts.length === 0 && (
              <div className="px-6 py-10 text-sm text-gray-600 text-center border-t border-gray-200">
                Không tìm thấy sản phẩm phù hợp từ khóa.
              </div>
            )}
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
                  {editingProductId ? `Chỉnh sửa sản phẩm #${editingProductId}` : 'Thêm sản phẩm mới'}
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setIsProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                >
                  Đóng
                </button>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-3 bg-white border border-gray-200 rounded-xl p-4">
                  <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tên sản phẩm</label>
                  <input
                    value={productForm.name}
                    onChange={(e) => {
                      setProductForm({ ...productForm, name: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Tên sản phẩm"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.name && <p className="mt-1 text-xs text-red-600">{productFormErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Danh mục</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => {
                      setProductForm({ ...productForm, category: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, category: undefined }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Chọn danh mục</option>
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
                    <p className="text-xs font-semibold text-gray-700">Ảnh sản phẩm</p>
                    {productForm.image && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600">
                        {imageSourceLabel}
                      </span>
                    )}
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <p className="text-xs font-medium text-gray-600 mb-2">Tải ảnh từ thiết bị</p>
                    <label className="inline-flex items-center justify-center px-3 py-2 text-sm border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      Chọn tệp ảnh
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileChange(e.target.files?.[0] || null)}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-2 text-[11px] text-gray-500">PNG, JPG, WEBP (khuyên dùng dưới 2MB)</p>
                    {showExternalUrlImageHint && (
                      <p className="mt-2 text-[11px] text-amber-700">
                        Ảnh đang trỏ tới liên kết ngoài (HTTP/HTTPS). Có thể đổi hoặc chậm tải; bạn có thể tải ảnh từ
                        thiết bị để lưu cố định trên server.
                      </p>
                    )}
                  </div>
                  {uploadingImage && <p className="mt-2 text-sm text-gray-500">Đang tải ảnh...</p>}
                  {productFormErrors.image && <p className="mt-2 text-xs text-red-600">{productFormErrors.image}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Giá</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => {
                        setProductForm({ ...productForm, price: e.target.value });
                        setProductFormErrors((prev) => ({ ...prev, price: undefined }));
                      }}
                      placeholder="Giá"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {productFormErrors.price && <p className="mt-1 text-xs text-red-600">{productFormErrors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tồn kho</label>
                    <input
                      type="number"
                      min={0}
                      step="1"
                      value={productForm.stock}
                      onChange={(e) => {
                        setProductForm({ ...productForm, stock: e.target.value });
                        setProductFormErrors((prev) => ({ ...prev, stock: undefined }));
                      }}
                      placeholder="Số lượng tồn"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    {productFormErrors.stock && <p className="mt-1 text-xs text-red-600">{productFormErrors.stock}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mô tả</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => {
                      setProductForm({ ...productForm, description: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    placeholder="Mô tả sản phẩm"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {productFormErrors.description && <p className="mt-1 text-xs text-red-600">{productFormErrors.description}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Thành phần</label>
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
                  <label className="block text-xs font-medium text-gray-600 mb-1">Loại da</label>
                  <select
                    value={parseCommaList(productForm.skinTypes)[0] || ''}
                    onChange={(e) => {
                      setProductForm({ ...productForm, skinTypes: e.target.value });
                      setProductFormErrors((prev) => ({ ...prev, skinTypes: undefined }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">Chọn loại da</option>
                    {SKIN_TYPE_OPTIONS.map((skinType) => (
                      <option key={skinType} value={skinType}>
                        {skinTypeLabelVi(skinType)}
                      </option>
                    ))}
                  </select>
                  {productFormErrors.skinTypes && <p className="mt-1 text-xs text-red-600">{productFormErrors.skinTypes}</p>}
                </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button onClick={submitProduct} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 min-w-[132px]">
                      <Plus className="w-4 h-4" />
                      {editingProductId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProductModalOpen(false);
                        resetProductForm();
                      }}
                      className="px-4 py-2 border rounded-full min-w-[92px]"
                    >
                      Hủy
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 h-fit lg:sticky lg:top-4">
                  <p className="text-xs text-gray-500 mb-2">Xem trước (giao diện khách hàng)</p>
                  <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
                    <div className="aspect-[4/3] bg-gray-100">
                      {productForm.image ? (
                        <img src={productForm.image} alt="Xem trước sản phẩm" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Chưa có ảnh</div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs uppercase tracking-wide text-gray-500">{productForm.category || 'Danh mục'}</p>
                      <h3 className="font-semibold mt-1">{productForm.name || 'Tên sản phẩm'}</h3>
                      <p className="text-base font-bold mt-2">{formatVnd(Number(productForm.price || 0))}</p>
                      <p className={`text-sm mt-1 ${Number(productForm.stock || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(productForm.stock || 0) > 0
                          ? `Còn ${Math.floor(Number(productForm.stock || 0))} sản phẩm`
                          : 'Hết hàng'}
                      </p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-3">
                        {productForm.description || 'Phần mô tả sản phẩm sẽ hiển thị tại đây.'}
                      </p>
                      {parseCommaList(productForm.skinTypes).length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {parseCommaList(productForm.skinTypes)
                            .slice(0, 3)
                            .map((type) => (
                              <span key={type} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE4E9]">
                                {skinTypeLabelVi(type)}
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
                        {Number(productForm.stock || 0) > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
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
                <h2 className="font-['Poppins'] font-semibold text-xl">Quản lý đơn hàng</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Tìm theo mã đơn, khách hàng, thành phố..."
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-[260px]"
                  />
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | Order['status'])}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="shipped">Đã gửi hàng</option>
                    <option value="delivered">Đã giao</option>
                  </select>
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value as 'date' | 'total')}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    <option value="date">Sắp xếp theo ngày</option>
                    <option value="total">Sắp xếp theo tổng tiền</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setOrderSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50"
                  >
                    {orderSortDirection === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500">Tổng</p>
                  <p className="text-xl font-semibold mt-1">{orders.length}</p>
                </div>
                <div className="rounded-xl border border-amber-200 p-4 bg-amber-50/60">
                  <p className="text-xs text-amber-700">Chờ xử lý</p>
                  <p className="text-xl font-semibold mt-1">{pendingOrdersCount}</p>
                </div>
                <div className="rounded-xl border border-blue-200 p-4 bg-blue-50/60">
                  <p className="text-xs text-blue-700">Đang xử lý</p>
                  <p className="text-xl font-semibold mt-1">{processingOrdersCount}</p>
                </div>
                <div className="rounded-xl border border-green-200 p-4 bg-green-50/60">
                  <p className="text-xs text-green-700">Đã giao</p>
                  <p className="text-xl font-semibold mt-1">{deliveredOrdersCount}</p>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto max-h-[560px]">
                  <table className="w-full min-w-[1120px]">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Mã đơn hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Khách hàng</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          <button
                            type="button"
                            onClick={() => toggleOrderSort('date')}
                            className="inline-flex items-center gap-1 hover:text-black"
                          >
                            Ngày đặt
                            {orderSortBy === 'date' && <span>{orderSortDirection === 'asc' ? '↑' : '↓'}</span>}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Sản phẩm</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          <button
                            type="button"
                            onClick={() => toggleOrderSort('total')}
                            className="inline-flex items-center gap-1 hover:text-black"
                          >
                            Tổng tiền
                            {orderSortBy === 'total' && <span>{orderSortDirection === 'asc' ? '↑' : '↓'}</span>}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Thanh toán</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Mã vận chuyển</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Thao tác</th>
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
                          <td className="px-4 py-3 font-semibold">{formatVnd(order.total)}</td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={async (e) => {
                                try {
                                  await onUpdateOrderStatus(order.id, e.target.value as typeof order.status);
                                } catch (error) {
                                  const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái';
                                  toast.error(message);
                                }
                              }}
                              className={`px-2.5 py-1 rounded-full text-xs border bg-white whitespace-nowrap min-w-[108px] ${getOrderStatusBadgeClass(order.status)}`}
                            >
                              <option value="pending">Chờ xử lý</option>
                              <option value="processing">Đang xử lý</option>
                              <option value="shipped">Đã gửi hàng</option>
                              <option value="delivered">Đã giao</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{getPaymentMethodLabel(order.paymentMethod)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{order.shippingCode || '-'}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-100"
                              >
                                Chi tiết
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyOrderId(order.id)}
                                className="px-3 py-1.5 text-xs border rounded-full hover:bg-gray-100"
                              >
                                Sao chép mã
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintOrder(order)}
                                className="px-3 py-1.5 text-xs bg-black text-white rounded-full hover:bg-gray-800"
                              >
                                In
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
                    <p className="text-gray-600">Không có đơn hàng phù hợp bộ lọc</p>
                  </div>
                )}
              </div>

              {sortedOrders.length > 0 && (
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Hiển thị {(orderPage - 1) * orderPageSize + 1}-{Math.min(orderPage * orderPageSize, sortedOrders.length)} trên tổng {sortedOrders.length} đơn hàng
                  </p>
                  <div className="flex items-center gap-2">
                    <select
                      value={orderPageSize}
                      onChange={(e) => setOrderPageSize(Number(e.target.value))}
                      className="px-2 py-1.5 border rounded-lg text-sm bg-white"
                    >
                      <option value={8}>8 / trang</option>
                      <option value={12}>12 / trang</option>
                      <option value={20}>20 / trang</option>
                    </select>
                    <button
                      type="button"
                      disabled={orderPage === 1}
                      onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50"
                    >
                      Trước
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
                      Sau
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
                  <h3 className="font-['Poppins'] font-semibold text-xl">Chi tiết đơn hàng</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{selectedOrder.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(selectedOrder.id)}
                    className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                  >
                    Sao chép mã
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintOrder(selectedOrder)}
                    className="px-3 py-1.5 text-sm bg-black text-white rounded-full hover:bg-gray-800"
                  >
                    In
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-3 py-1.5 text-sm border rounded-full hover:bg-gray-100"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Khách hàng</p>
                  <p className="font-semibold">{selectedOrder.user?.name || selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.user?.email || 'Chưa có email'}</p>
                  <p className="text-sm text-gray-600 mt-2">Ngày đặt: {formatOrderDate(selectedOrder)}</p>
                  <p className="text-sm text-gray-600 mt-1">Mã vận chuyển: {selectedOrder.shippingCode || '-'}</p>
                  <p className="text-sm text-gray-600 mt-1">Thanh toán: {getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                  <span className={`inline-flex mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadgeClass(selectedOrder.status)}`}>
                    {getOrderStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                  <p className="font-semibold">{selectedOrder.shippingAddress.name}</p>
                  <p className="text-sm text-gray-700">
                    {selectedOrder.shippingAddress.address},{' '}
                    {selectedOrder.shippingAddress.district || selectedOrder.shippingAddress.zipCode || ''},{' '}
                    {selectedOrder.shippingAddress.city}
                  </p>
                  <p className="text-sm text-gray-700">{selectedOrder.shippingAddress.country}</p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <p className="font-semibold">Sản phẩm ({selectedOrder.items.length})</p>
                </div>
                <div className="divide-y divide-gray-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="p-4 flex gap-3 items-center">
                      <img src={products.find(p => p.id === item.product.id)?.image || item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.product.category}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatVnd(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{formatVnd(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                <p className="text-xl font-bold">{formatVnd(selectedOrder.total)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-4">Quản lý danh mục</h2>
              <div className="mb-3 flex items-center justify-between w-full">
                <div className="flex items-center gap-3 max-w-4xl w-full">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Tìm danh mục..."
                      className="flex-1 w-full border rounded px-3 py-2 pl-9 pr-10"
                    />
                    {categorySearch.trim() && (
                      <button
                        type="button"
                        onClick={() => setCategorySearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 transition-colors"
                        aria-label="Xóa từ khóa tìm kiếm danh mục"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                  <input
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Tên danh mục"
                    className="w-1/5 border rounded px-3 py-2"
                  />
                  <input
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    placeholder="Mô tả"
                    className="w-1/3 border rounded px-3 py-2"
                  />
                </div>
                <p className="ml-4 whitespace-nowrap text-sm text-gray-600">
                  {filteredCategories.length}/{categories.length} danh mục
                </p>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={submitCategory} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">Thêm danh mục</button>
                <button onClick={addDefaultCategories} className="px-4 py-2 border rounded-full hover:bg-gray-100 transition-colors">Thêm danh mục mặc định</button>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {filteredCategories.map((category) => (
                <div key={category._id} className="flex items-center justify-between border border-gray-200 rounded-xl p-4">
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.description || 'Chưa có mô tả'}</p>
                  </div>
                  <button onClick={() => removeCategory(category._id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {filteredCategories.length === 0 && <p className="text-gray-600">Không tìm thấy danh mục phù hợp.</p>}
            </div>
          </div>
        )}
        {activeTab === 'contacts' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FFE4E9] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#d66b8f]" />
                </div>
                <div>
                  <h2 className="font-['Poppins'] font-semibold text-xl">Hộp thư liên hệ</h2>
                  <p className="text-sm text-gray-600">Tin nhắn khách gửi từ trang Liên hệ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={loadAdminData}
                className="px-4 py-2 border rounded-full hover:bg-gray-100 transition-colors text-sm"
              >
                Tải lại
              </button>
            </div>
            <div className="p-6 space-y-4">
              {contactMessages.length === 0 && (
                <div className="text-sm text-gray-600">Chưa có tin nhắn liên hệ nào.</div>
              )}
              {contactMessages.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <p className="font-semibold">{item.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.sentAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    Từ: <span className="font-medium">{item.name}</span> ({item.email})
                  </p>
                  <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{item.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
