import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PaymentType } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  paymentType: PaymentType | null;
  addToCart: (product: Product, quantity?: number) => { success: boolean; error?: string };
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCash: number;
  totalPoints: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sugar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sugar_cart', JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const paymentType: PaymentType | null = items.length > 0 ? items[0].product.paymentType : null;

  const addToCart = (product: Product, quantity = 1): { success: boolean; error?: string } => {
    if (items.length > 0) {
      const currentType = items[0].product.paymentType;
      if (currentType !== product.paymentType) {
        return {
          success: false,
          error: `لا يمكن الجمع بين منتجات ${currentType === 'CASH' ? 'الدفع النقدي' : 'النقاط'} ومنتجات ${product.paymentType === 'CASH' ? 'الدفع النقدي' : 'النقاط'} في سلة واحدة. يرجى إتمام طلبك الحالي أولاً أو إفراغ السلة.`,
        };
      }
    }

    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.inventory);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantity, product.inventory) }];
    });

    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const clamped = Math.min(quantity, item.product.inventory);
          return { ...item, quantity: clamped };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCash = items.reduce((sum, item) => sum + item.product.cashPrice * item.quantity, 0);
  const totalPoints = items.reduce((sum, item) => sum + item.product.pointsPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        paymentType,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCash,
        totalPoints,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
