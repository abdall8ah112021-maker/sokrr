import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Package,
  Coins,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  RefreshCw,
  Tag,
  TrendingUp,
} from 'lucide-react';
import { Product } from '../../types';

interface AdminOrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPriceCash: number;
  unitPricePoints: number;
}

interface AdminOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  paymentType: 'CASH' | 'POINTS';
  totalCash: number;
  totalPoints: number;
  pointsEarned?: number;
  deliveryFee: number;
  deliveryAddress: {
    recipient: string;
    phone: string;
    governorate: string;
    city: string;
    street: string;
  };
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  items: AdminOrderItem[];
  createdAt: string;
}

interface AdminStorePageProps {
  products: Product[];
  orders: AdminOrder[];
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void> | void;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<void> | void;
  onDeleteProduct: (id: string) => Promise<void> | void;
  onUpdateOrderStatus: (orderId: string, status: string, note?: string) => Promise<void> | void;
  onRefresh?: () => void;
}

const CATEGORIES = [
  { id: 'cat_01', label: 'إلكترونيات ذكية' },
  { id: 'cat_02', label: 'أدوات منزلية' },
  { id: 'cat_03', label: 'إكسسوارات وهدايا' },
];

const STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  PENDING: { label: 'قيد المراجعة', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
  CONFIRMED: { label: 'مؤكد', badge: 'bg-sky-950/80 text-sky-300 border-sky-500/30' },
  PREPARING: { label: 'جاري التجهيز', badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/30' },
  OUT_FOR_DELIVERY: { label: 'مع المندوب', badge: 'bg-purple-950/80 text-purple-300 border-purple-500/30' },
  DELIVERED: { label: 'تم التسليم', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
  CANCELLED: { label: 'ملغي', badge: 'bg-rose-950/80 text-rose-300 border-rose-500/30' },
};

const PRODUCT_STATUS_LABELS: Record<string, { label: string; badge: string }> = {
  ACTIVE: { label: 'نشط ومعروض', badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' },
  DRAFT: { label: 'مسودة', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  INACTIVE: { label: 'غير نشط', badge: 'bg-amber-950/80 text-amber-300 border-amber-500/30' },
  OUT_OF_STOCK: { label: 'نفد المخزون', badge: 'bg-rose-950/80 text-rose-300 border-rose-500/30' },
  ARCHIVED: { label: 'مؤرشف', badge: 'bg-slate-900 text-slate-500 border-slate-800' },
};

export const AdminStorePage: React.FC<AdminStorePageProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'products' | 'orders'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState<'ALL' | 'CASH' | 'POINTS'>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: 'cat_01',
    paymentType: 'CASH' as 'CASH' | 'POINTS',
    cashPrice: 0,
    pointsPrice: 0,
    rewardPoints: 0,
    inventory: 10,
    lowStockThreshold: 3,
    status: 'ACTIVE' as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED',
    imageUrl: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product> & { imageUrl?: string }>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const safeProducts = Array.isArray(products) ? products : [];
  const safeOrders = Array.isArray(orders) ? orders : [];

  const stats = useMemo(() => {
    const activeProducts = safeProducts.filter((p) => p.status === 'ACTIVE').length;
    const validOrders = safeOrders.filter((o) => o.status !== 'CANCELLED');
    const totalCashSales = validOrders
      .filter((o) => o.paymentType === 'CASH')
      .reduce((sum, o) => sum + (Number(o.totalCash) || 0), 0);
    const totalPointsEarnedFromStore = validOrders.reduce(
      (sum, o) => sum + (Number(o.pointsEarned) || 0),
      0
    );
    const totalPointsRedeemed = validOrders
      .filter((o) => o.paymentType === 'POINTS')
      .reduce((sum, o) => sum + (Number(o.totalPoints) || 0), 0);

    return {
      totalProducts: safeProducts.length,
      activeProducts,
      totalOrders: safeOrders.length,
      pendingOrders: safeOrders.filter((o) => o.status === 'PENDING').length,
      totalCashSales,
      totalPointsEarnedFromStore,
      totalPointsRedeemed,
    };
  }, [safeProducts, safeOrders]);

  const filteredProducts = safeProducts.filter((product) => {
    if (productTypeFilter !== 'ALL' && product.paymentType !== productTypeFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      product.name?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q)
    );
  });

  const filteredOrders = safeOrders.filter((order) => {
    if (orderStatusFilter !== 'ALL' && order.status !== orderStatusFilter) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      order.orderNumber?.toLowerCase().includes(q) ||
      order.customerName?.toLowerCase().includes(q) ||
      order.customerPhone?.toLowerCase().includes(q) ||
      order.deliveryAddress?.recipient?.toLowerCase().includes(q)
    );
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cashPrice = newProduct.paymentType === 'CASH' ? Number(newProduct.cashPrice) || 0 : 0;
    const pointsPrice = newProduct.paymentType === 'POINTS' ? Number(newProduct.pointsPrice) || 0 : 0;
    const rewardPoints =
      newProduct.paymentType === 'CASH'
        ? Number(newProduct.rewardPoints) || Math.max(1, Math.round((cashPrice / 100) * 10))
        : 0;

    await onAddProduct({
      name: newProduct.name.trim(),
      description: newProduct.description.trim(),
      categoryId: newProduct.categoryId,
      paymentType: newProduct.paymentType,
      cashPrice,
      pointsPrice,
      rewardPoints,
      inventory: Number(newProduct.inventory) || 0,
      lowStockThreshold: Number(newProduct.lowStockThreshold) || 3,
      status: newProduct.status,
      images: newProduct.imageUrl.trim()
        ? [newProduct.imageUrl.trim()]
        : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'],
    });

    setNewProduct({
      name: '',
      description: '',
      categoryId: 'cat_01',
      paymentType: 'CASH',
      cashPrice: 0,
      pointsPrice: 0,
      rewardPoints: 0,
      inventory: 10,
      lowStockThreshold: 3,
      status: 'ACTIVE',
      imageUrl: '',
    });
    setShowAddForm(false);
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({
      ...product,
      imageUrl: product.images?.[0] || '',
    });
  };

  const saveEdit = async (id: string) => {
    const payload: Partial<Product> = {
      name: editProduct.name,
      description: editProduct.description,
      categoryId: editProduct.categoryId,
      paymentType: editProduct.paymentType,
      cashPrice: Number(editProduct.cashPrice) || 0,
      pointsPrice: Number(editProduct.pointsPrice) || 0,
      rewardPoints:
        editProduct.paymentType === 'CASH' ? Number(editProduct.rewardPoints) || 0 : 0,
      inventory: Number(editProduct.inventory) || 0,
      status: editProduct.status,
      images: editProduct.imageUrl ? [editProduct.imageUrl] : editProduct.images,
    };
    await onUpdateProduct(id, payload);
    setEditingId(null);
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await onUpdateOrderStatus(orderId, status);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Store Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-l from-[#0e1526] via-[#0b101d] to-[#080c16] border border-sky-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-300 text-xs font-bold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-sky-400" />
            <span>صفحة إدارة المتجر الرسمي</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            إدارة منتجات المتجر، النقاط المكتسبة، وطلبات العملاء
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            يُعد متجر الموقع المصدر الوحيد لاكتساب النقاط للعملاء عند شراء المنتجات النقدية، بالإضافة لاستبدال المكافآت بالنقاط.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSubTab('products');
              setShowAddForm((prev) => !prev);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'إغلاق نموذج الإضافة' : 'إضافة منتج جديد للمتجر'}</span>
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
              title="تحديث بيانات المتجر"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Store KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>المنتجات بالمتجر</span>
            <Package className="w-4 h-4 text-sky-400" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.totalProducts}</p>
          <span className="text-[11px] text-emerald-400">{stats.activeProducts} منتج نشط معروض</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>طلبات المتجر</span>
            <ShoppingBag className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.totalOrders}</p>
          <span className="text-[11px] text-amber-400">{stats.pendingOrders} طلب قيد المراجعة</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>المبيعات النقدية</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.totalCashSales.toLocaleString('en-US')}
          </p>
          <span className="text-[11px] text-slate-400">جنيه مصري (COD)</span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>النقاط الممنوحة من المتجر</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-mono text-2xl sm:text-3xl font-black text-amber-400">
            +{stats.totalPointsEarnedFromStore}
          </p>
          <span className="text-[11px] text-slate-400">مستبدل: {stats.totalPointsRedeemed} نقطة</span>
        </div>
      </div>

      {/* Store Sub-Navigation & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setSubTab('products')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'products' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>المنتجات والمخزون ({safeProducts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('orders')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
              subTab === 'orders' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>طلبات المتجر والمبيعات ({safeOrders.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={subTab === 'products' ? 'بحث باسم المنتج...' : 'بحث برقم الطلب أو العميل...'}
            className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ================= SUB-TAB 1: PRODUCTS ================= */}
      {subTab === 'products' && (
        <div className="space-y-6">
          {showAddForm && (
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-sky-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base sm:text-lg font-black text-white">إضافة منتج جديد لمتجر الموقع</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="مثال: سماعة لاسلكية احترافية"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">التصنيف</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نظام البيع</label>
                  <select
                    value={newProduct.paymentType}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, paymentType: e.target.value as 'CASH' | 'POINTS' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="CASH">شراء نقدي (يمنح العميل نقاطاً)</option>
                    <option value="POINTS">مكافأة استبدال بالنقاط</option>
                  </select>
                </div>

                {newProduct.paymentType === 'CASH' ? (
                  <>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">السعر نقداً (ج.م) *</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={newProduct.cashPrice}
                        onChange={(e) => {
                          const cash = Number(e.target.value);
                          setNewProduct({
                            ...newProduct,
                            cashPrice: cash,
                            rewardPoints: Math.max(1, Math.round((cash / 100) * 10)),
                          });
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-300 font-semibold mb-1">
                        النقاط المكتسبة للعميل عند الشراء
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={newProduct.rewardPoints}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, rewardPoints: Number(e.target.value) })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-amber-300 font-semibold mb-1">السعر بالنقاط *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={newProduct.pointsPrice}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, pointsPrice: Number(e.target.value) })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الكمية بالمخزون</label>
                  <input
                    type="number"
                    min={0}
                    value={newProduct.inventory}
                    onChange={(e) => setNewProduct({ ...newProduct, inventory: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الحالة بالمتجر</label>
                  <select
                    value={newProduct.status}
                    onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="ACTIVE">نشط ومعروض فوراً</option>
                    <option value="DRAFT">مسودة (مخفي)</option>
                    <option value="INACTIVE">غير نشط</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">رابط صورة المنتج</label>
                  <input
                    type="url"
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-slate-300 font-semibold mb-1">وصف المنتج *</label>
                  <textarea
                    rows={2}
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="اكتب مواصفات ومزايا المنتج..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div className="md:col-span-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>حفظ ونشر المنتج بالمتجر</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'كل المنتجات' },
              { id: 'CASH', label: 'الشراء النقدي (يكسب نقاط)' },
              { id: 'POINTS', label: 'الاستبدال بالنقاط' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setProductTypeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  productTypeFilter === f.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Products List */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                لا توجد منتجات مطابقة لبحثك حالياً.
              </div>
            ) : (
              filteredProducts.map((product) => {
                const statusInfo = PRODUCT_STATUS_LABELS[product.status] || PRODUCT_STATUS_LABELS.DRAFT;
                return (
                  <div
                    key={product.id}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {editingId === product.id ? (
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <input
                          type="text"
                          value={editProduct.name || ''}
                          onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                          placeholder="اسم المنتج"
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                        />
                        {editProduct.paymentType === 'POINTS' ? (
                          <input
                            type="number"
                            value={editProduct.pointsPrice || 0}
                            onChange={(e) =>
                              setEditProduct({ ...editProduct, pointsPrice: Number(e.target.value) })
                            }
                            placeholder="السعر بالنقاط"
                            className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-amber-300 font-mono"
                          />
                        ) : (
                          <>
                            <input
                              type="number"
                              value={editProduct.cashPrice || 0}
                              onChange={(e) =>
                                setEditProduct({ ...editProduct, cashPrice: Number(e.target.value) })
                              }
                              placeholder="السعر نقداً"
                              className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-emerald-300 font-mono"
                            />
                            <input
                              type="number"
                              value={editProduct.rewardPoints || 0}
                              onChange={(e) =>
                                setEditProduct({ ...editProduct, rewardPoints: Number(e.target.value) })
                              }
                              placeholder="نقاط المكافأة"
                              className="px-3 py-2 rounded-lg bg-slate-950 border border-amber-500/40 text-amber-300 font-mono"
                            />
                          </>
                        )}
                        <input
                          type="number"
                          value={editProduct.inventory ?? 0}
                          onChange={(e) =>
                            setEditProduct({ ...editProduct, inventory: Number(e.target.value) })
                          }
                          placeholder="المخزون"
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono"
                        />
                        <select
                          value={editProduct.status || 'ACTIVE'}
                          onChange={(e) =>
                            setEditProduct({ ...editProduct, status: e.target.value as any })
                          }
                          className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white"
                        >
                          <option value="ACTIVE">نشط ومعروض</option>
                          <option value="DRAFT">مسودة</option>
                          <option value="INACTIVE">غير نشط</option>
                          <option value="OUT_OF_STOCK">نفد المخزون</option>
                        </select>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => saveEdit(product.id)}
                            className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>حفظ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 flex items-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>إلغاء</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 min-w-0">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-6 h-6 text-sky-400" />
                            </div>
                          )}
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{product.name}</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusInfo.badge}`}>
                                {statusInfo.label}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                  product.paymentType === 'POINTS'
                                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                                }`}
                              >
                                {product.paymentType === 'POINTS' ? 'استبدال بالنقاط' : 'شراء نقدي (COD)'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-1">{product.description}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                              {product.paymentType === 'POINTS' ? (
                                <span className="text-amber-400 font-bold">{product.pointsPrice} نقطة</span>
                              ) : (
                                <>
                                  <span className="text-emerald-400 font-bold">{product.cashPrice} ج.م</span>
                                  <span className="text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
                                    +{product.rewardPoints || 0} نقطة مكتسبة عند الشراء
                                  </span>
                                </>
                              )}
                              <span className="text-slate-400">المخزون: {product.inventory}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                          <button
                            type="button"
                            onClick={() => startEdit(product)}
                            className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-sky-950 text-sky-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product.id)}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-rose-950 text-rose-400 border border-slate-800"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: STORE ORDERS ================= */}
      {subTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'ALL', label: 'جميع الطلبات' },
              { id: 'PENDING', label: 'قيد المراجعة' },
              { id: 'CONFIRMED', label: 'مؤكد' },
              { id: 'PREPARING', label: 'جاري التجهيز' },
              { id: 'OUT_FOR_DELIVERY', label: 'مع المندوب' },
              { id: 'DELIVERED', label: 'تم التسليم' },
              { id: 'CANCELLED', label: 'ملغي' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setOrderStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  orderStatusFilter === f.id
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredOrders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[#0b0f1b] border border-slate-800 text-center text-xs text-slate-500">
                لا توجد طلبات متجر مطابقة حالياً.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
                return (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-sm font-bold text-sky-300">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                          {order.paymentType === 'CASH' && (order.pointsEarned || 0) > 0 && (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-950/70 text-amber-300 border border-amber-500/30 font-mono">
                              +{order.pointsEarned} نقطة مكتسبة للعميل
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          العميل: <strong className="text-white">{order.customerName || order.deliveryAddress?.recipient}</strong> •{' '}
                          <span className="font-mono text-sky-400">{order.customerPhone || order.deliveryAddress?.phone}</span> •{' '}
                          <span>{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          disabled={updatingOrderId === order.id}
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold"
                        >
                          <option value="PENDING">قيد المراجعة</option>
                          <option value="CONFIRMED">تأكيد الطلب</option>
                          <option value="PREPARING">جاري التجهيز</option>
                          <option value="OUT_FOR_DELIVERY">خارج للتوصيل</option>
                          <option value="DELIVERED">تم التسليم</option>
                          <option value="CANCELLED">إلغاء الطلب</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1.5">
                        <span className="text-slate-400 font-semibold block">المنتجات:</span>
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-900/60 px-3 py-1.5 rounded-lg">
                            <span className="text-slate-200">
                              {item.productName} × {item.quantity}
                            </span>
                            <span className="font-mono text-sky-300">
                              {order.paymentType === 'POINTS'
                                ? `${item.unitPricePoints * item.quantity} نقطة`
                                : `${item.unitPriceCash * item.quantity} ج.م`}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1.5 text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                        <div>
                          <span className="text-slate-400">العنوان: </span>
                          <span>
                            {order.deliveryAddress?.governorate}، {order.deliveryAddress?.city}، {order.deliveryAddress?.street}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 font-mono">
                          <span className="font-sans text-slate-400">الإجمالي:</span>
                          <span className="font-bold text-sm text-emerald-400">
                            {order.paymentType === 'POINTS'
                              ? `${order.totalPoints} نقطة + ${order.deliveryFee} ج.م شحن`
                              : `${order.totalCash} ج.م`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
