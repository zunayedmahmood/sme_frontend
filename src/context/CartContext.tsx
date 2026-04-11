'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { updateForCart } from '@/lib/api/api_public';

interface CartItemObject {
    [cartKey: string]: number;
}

interface ProductInfo {
    id: number;
    cart_key: string;
    variation_id?: number | null;
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
    addToCart: (productId: number, variationId: number | null, availableStock: number, qty?: number) => boolean;
    removeFromCart: (cartKey: string) => void;
    updateQuantity: (cartKey: string, newQty: number, availableStock: number) => void;
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
                    // Check if it's using old number keys or new cartKey string format
                    const migratedCart: CartItemObject = {};
                    Object.entries(parsed).forEach(([key, qty]) => {
                        if (String(key).indexOf('-') === -1) {
                            migratedCart[`${key}-null`] = qty as number;
                        } else {
                            migratedCart[key] = qty as number;
                        }
                    });
                    setCart(migratedCart);
                } else if (Array.isArray(parsed)) {
                    // Migrate array-based to object-based if needed
                    const newObj: CartItemObject = {};
                    parsed.forEach((item: any) => {
                        if (item.productId) newObj[`${item.productId}-null`] = item.quantity;
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
        return Object.entries(cart).reduce((acc, [cartKey, qty]) => {
            const detail = cartDetails.find(d => d.cart_key === cartKey);
            return acc + (detail?.selling_price ? Number(detail.selling_price) * qty : 0);
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
                items: itemEntries.map(([cartKey, qty]) => {
                    const [pId, vId] = cartKey.split('-');
                    return {
                        product_id: parseInt(pId),
                        variation_id: vId !== 'null' ? parseInt(vId) : null,
                        qty: qty as number
                    };
                })
            };
            const validation = await updateForCart(payload);

            // Sync cart with validated quantities/removals
            const validatedCart: CartItemObject = {};
            const details: ProductInfo[] = [];

            validation.items.forEach((vi: any) => {
                if (vi.qty > 0) {
                    const cartKey = vi.variation_id ? `${vi.product_id}-${vi.variation_id}` : `${vi.product_id}-null`;
                    validatedCart[cartKey] = vi.qty;
                    details.push({
                        id: vi.product_id,
                        cart_key: cartKey,
                        variation_id: vi.variation_id,
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
    const addToCart = (productId: number, variationId: number | null, availableStock: number, qty = 1): boolean => {
        const cartKey = variationId ? `${productId}-${variationId}` : `${productId}-null`;
        const currentQty = cart[cartKey] || 0;
        const maxAllowed = availableStock;

        if (currentQty + qty > maxAllowed) return false;

        setCart(prev => ({
            ...prev,
            [cartKey]: currentQty + qty
        }));
        return true;
    };

    // Directly removes without confirmation — Cart.tsx handles the confirm modal
    const removeFromCart = (cartKey: string) => {
        setCart((prev: CartItemObject) => {
            const newCart = { ...prev };
            delete newCart[cartKey];
            return newCart;
        });
        setCartDetails((prev: ProductInfo[]) => prev.filter((p: ProductInfo) => p.cart_key !== cartKey));
    };

    const updateQuantity = (cartKey: string, newQty: number, availableStock: number) => {
        if (newQty <= 0) {
            // Directly delete — caller is responsible for confirmation if needed
            setCart((prev: CartItemObject) => {
                const newCart = { ...prev };
                delete newCart[cartKey];
                return newCart;
            });
            setCartDetails((prev: ProductInfo[]) => prev.filter((p: ProductInfo) => p.cart_key !== cartKey));
            return;
        }
        const maxAllowed = availableStock;
        if (newQty > maxAllowed) return;

        setCart((prev: CartItemObject) => {
            const newCart = {
                ...prev,
                [cartKey]: newQty
            };
            return newCart;
        });

        // Trigger refresh to get updated dynamic prices
        setTimeout(() => refreshCart(), 0);
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