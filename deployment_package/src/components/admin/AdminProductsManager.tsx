import React, { useState } from 'react';
import { Plus, Trash2, ShoppingBag, Edit2, Save, X } from 'lucide-react';
import { Product } from '../../types';

interface Props {
  products: Product[];
  onAdd: (product: Omit<Product, 'id'>) => void;
  onUpdate: (id: string, product: Partial<Product>) => void;
  onDelete: (id: string) => void;
}

export const AdminProductsManager: React.FC<Props> = ({ products, onAdd, onUpdate, onDelete }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categoryId: '',
    paymentType: 'CASH' as 'CASH' | 'POINTS',
    cashPrice: 0,
    pointsPrice: 0,
    discount: 0,
    inventory: 0,
    lowStockThreshold: 0,
    status: 'DRAFT' as 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED',
    images: [] as string[],
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ ...newProduct, discount: Number(newProduct.discount) });
    setNewProduct({
      name: '',
      description: '',
      categoryId: '',
      paymentType: 'CASH',
      cashPrice: 0,
      pointsPrice: 0,
      discount: 0,
      inventory: 0,
      lowStockThreshold: 0,
      status: 'DRAFT',
      images: [],
    });
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setEditProduct(product);
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editProduct);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة منتج جديد مع كافة التفاصيل</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="اسم المنتج" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" required />
          <input type="number" placeholder="السعر نقداً" value={newProduct.cashPrice} onChange={(e) => setNewProduct({...newProduct, cashPrice: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" required />
          <input type="number" placeholder="السعر بالنقاط" value={newProduct.pointsPrice} onChange={(e) => setNewProduct({...newProduct, pointsPrice: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="number" placeholder="نسبة الخصم (%)" value={newProduct.discount} onChange={(e) => setNewProduct({...newProduct, discount: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="number" placeholder="المخزون" value={newProduct.inventory} onChange={(e) => setNewProduct({...newProduct, inventory: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="text" placeholder="رابط صورة المنتج" value={newProduct.images[0] || ''} onChange={(e) => setNewProduct({...newProduct, images: [e.target.value]})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <textarea placeholder="وصف المنتج" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white col-span-2" required />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 col-span-2">
            <Plus className="w-5 h-5" /> إضافة المنتج
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white">قائمة المنتجات</h3>
          <input
            type="text"
            placeholder="بحث في المنتجات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              {editingId === product.id ? (
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input type="text" value={editProduct.name} onChange={(e) => setEditProduct({...editProduct, name: e.target.value})} className="px-2 py-1 bg-slate-800 text-white rounded" />
                  <input type="number" value={editProduct.cashPrice} onChange={(e) => setEditProduct({...editProduct, cashPrice: Number(e.target.value)})} className="px-2 py-1 bg-slate-800 text-white rounded" />
                  <button onClick={() => saveEdit(product.id)} className="text-emerald-400"><Save /></button>
                  <button onClick={() => setEditingId(null)} className="text-rose-400"><X /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    {product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                        <ShoppingBag className="w-10 h-10 text-sky-400" />
                    )}
                    <div>
                      <h4 className="font-bold text-white">{product.name}</h4>
                      <p className="text-xs text-slate-400">{product.cashPrice} EGP | {product.inventory} في المخزن</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(product)} className="p-2 text-sky-400 hover:bg-sky-950 rounded-lg">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
