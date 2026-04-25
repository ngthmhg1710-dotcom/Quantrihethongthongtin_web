import { useEffect, useState } from 'react';
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
  });
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

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
    setProductForm({ name: '', price: '', stock: '', image: '', category: '', description: '' });
    setEditingProductId(null);
  };

  const submitProduct = async () => {
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price || 0),
        stock: Number(productForm.stock || 0),
      };
      const endpoint = editingProductId ? `${API_BASE_URL}/admin/products/${editingProductId}` : `${API_BASE_URL}/admin/products`;
      const response = await adminFetch(endpoint, {
        method: editingProductId ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save product');
      toast.success(editingProductId ? 'Product updated' : 'Product created');
      resetProductForm();
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
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    12.5%
                  </span>
                </div>
                <p className="text-2xl font-bold mb-1">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-[#FFE4E9] rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-[#FFC0CB]" />
                  </div>
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    8.2%
                  </span>
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
                  <span className="text-green-600 text-sm">+15%</span>
                </div>
                <p className="text-2xl font-bold mb-1">${stats.averageOrderValue.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Avg. Order Value</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Revenue Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#FFC0CB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-['Poppins'] font-semibold text-xl mb-6">Orders Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#000000" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
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
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-['Poppins'] font-semibold text-xl mb-4">Product Management</h2>
              <div className="grid md:grid-cols-3 gap-3">
                <input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Name" className="px-3 py-2 border rounded-lg" />
                <input value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} placeholder="Category" className="px-3 py-2 border rounded-lg" />
                <input value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} placeholder="Image URL" className="px-3 py-2 border rounded-lg" />
                <input value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="Price" className="px-3 py-2 border rounded-lg" />
                <input value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} placeholder="Stock" className="px-3 py-2 border rounded-lg" />
                <input value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} placeholder="Description" className="px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={submitProduct} className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  {editingProductId ? 'Update Product' : 'Add Product'}
                </button>
                {editingProductId && (
                  <button onClick={resetProductForm} className="px-4 py-2 border rounded-full">Cancel</button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={product.id} className={index !== products.length - 1 ? 'border-b border-gray-200' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                          <span className="font-semibold">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{product.category}</td>
                      <td className="px-6 py-4 font-semibold">${product.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">{product.stock ?? 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingProductId(product.id);
                              setProductForm({
                                name: product.name,
                                category: product.category,
                                image: product.image,
                                price: String(product.price),
                                stock: String(product.stock ?? 0),
                                description: product.description,
                              });
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => removeProduct(product.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
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

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="font-['Poppins'] font-semibold text-xl">Order Management</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-lg">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
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
                        className="px-3 py-1 rounded-full text-sm border border-gray-300 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Customer</p>
                        <p className="font-semibold">{order.user?.name || order.shippingAddress.name}</p>
                        {order.user?.email && (
                          <p className="text-sm text-gray-500">{order.user.email}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Shipping Address</p>
                        <p className="font-semibold text-sm">
                          {order.shippingAddress.address}, {order.shippingAddress.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <p className="font-bold">Total: ${order.total.toFixed(2)}</p>
                      <button className="text-sm text-[#FFC0CB] hover:underline">View Details</button>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No orders to display</p>
                  </div>
                )}
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
              <button onClick={submitCategory} className="mt-3 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">Add Category</button>
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
