'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { updateForCart } from '@/lib/api/api_public';

interface CartItemObject {
    [productId: number]: number;
}

interface ProductInfo {
    id: number;
    name: string;
    selling_price: number;
    image_src: string[];
    available_stock: number;
}

interface CartContextType {
    cart: CartItemObject;
    cartDetails: ProductInfo[];
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
    addToCart: (productId: number, availableStock: number, qty?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, newQty: number, availableStock: number) => void;
    clearCart: () => void;
    cartCount: number;
    subtotal: number;
    loading: boolean;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItemObject>({});
    const [cartDetails, setCartDetails] = useState<ProductInfo[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('cart');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Handle both types: old array-based from previous version or the new object-based
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    setCart(parsed);
                } else if (Array.isArray(parsed)) {
                    // Migrate array-based to object-based if needed
                    const newObj: CartItemObject = {};
                    parsed.forEach((item: any) => {
                        if (item.productId) newObj[item.productId] = item.quantity;
                    });
                    setCart(newObj);
                }
            } catch (e) {
                console.error("Cart corruption:", e);
                setCart({});
            }
        }
    }, []);

    // Sync to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    // Derived values
    const cartCount = useMemo(() => {
        return Object.values(cart).reduce((acc, qty) => acc + qty, 0);
    }, [cart]);

    const subtotal = useMemo(() => {
        return Object.entries(cart).reduce((acc, [id, qty]) => {
            const detail = cartDetails.find(d => d.id === parseInt(id));
            return acc + (detail ? detail.selling_price * qty : 0);
        }, 0);
    }, [cart, cartDetails]);

    // API: Refresh cart info
    const refreshCart = async () => {
        const itemEntries = Object.entries(cart);
        if (itemEntries.length === 0) {
            setCartDetails([]);
            return;
        }
        setLoading(true);
        try {
            // 1. Validate with updateForCart
            const payload = {
                items: itemEntries.map(([id, qty]) => ({
                    product_id: parseInt(id),
                    qty: qty
                }))
            };
            const validation = await updateForCart(payload);

            // Sync cart with validated quantities/removals
            const validatedCart: CartItemObject = {};
            const details: ProductInfo[] = [];

            validation.items.forEach((vi: any) => {
                if (vi.qty > 0) {
                    validatedCart[vi.product_id] = vi.qty;
                    details.push({
                        id: vi.product_id,
                        name: vi.product_name,
                        selling_price: vi.price,
                        image_src: vi.image_src,
                        available_stock: vi.available_stock
                    });
                }
            });

            setCart(validatedCart);
            setCartDetails(details);
        } catch (err) {
            console.error("Failed to refresh cart:", err);
        } finally {
            setLoading(false);
        }
    };

    // Actions
    const addToCart = (productId: number, availableStock: number, qty = 1) => {
        const currentQty = cart[productId] || 0;
        const maxAllowed = Math.min(5, availableStock);

        if (currentQty + qty > maxAllowed) return;

        setCart(prev => ({
            ...prev,
            [productId]: currentQty + qty
        }));
    };

    // Directly removes without confirmation — Cart.tsx handles the confirm modal
    const removeFromCart = (productId: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            delete newCart[productId];
            return newCart;
        });
        setCartDetails(prev => prev.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId: number, newQty: number, availableStock: number) => {
        if (newQty <= 0) {
            // Directly delete — caller is responsible for confirmation if needed
            setCart(prev => {
                const newCart = { ...prev };
                delete newCart[productId];
                return newCart;
            });
            setCartDetails(prev => prev.filter(p => p.id !== productId));
            return;
        }
        const maxAllowed = Math.min(5, availableStock);
        if (newQty > maxAllowed) return;

        setCart(prev => ({
            ...prev,
            [productId]: newQty
        }));
    };

    const clearCart = () => {
        setCart({});
        setCartDetails([]);
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartDetails,
            isCartOpen,
            setIsCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            subtotal,
            loading,
            refreshCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
}