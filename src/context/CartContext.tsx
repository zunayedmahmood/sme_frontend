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
    const cartRef = React.useRef<CartItemObject>(cart);

    // Keep ref in sync
    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

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
        const itemEntries = Object.entries(cartRef.current);
        if (itemEntries.length === 0) {
            setCartDetails([]);
            return;
        }
        setLoading(true);
        try {
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

            const details: ProductInfo[] = [];
            
            // Reconcile: Only adjust quantities if the backend says we have LESS than we thought
            // or if the price changed.
            // Reconcile: Completely rebuild cart based on returned items
            setCart(prev => {
                const updated: CartItemObject = {};
                validation.items.forEach((vi: any) => {
                    const cartKey = vi.variation_id ? `${vi.product_id}-${vi.variation_id}` : `${vi.product_id}-null`;
                    
                    // Only keep in cart if quantity > 0
                    if (vi.qty > 0) {
                        // Use original quantity if available, capped by available stock
                        // If it's a new item (unlikely here) or somehow missing from prev, use backend qty
                        const originalQty = prev[cartKey] || vi.qty;
                        updated[cartKey] = Math.min(originalQty, vi.available_stock);

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
                return updated;
            });
            
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
        
        let success = true;
        setCart(prev => {
            const currentQty = prev[cartKey] || 0;
            if (currentQty + qty > availableStock) {
                success = false;
                return prev;
            }
            return {
                ...prev,
                [cartKey]: currentQty + qty
            };
        });

        if (success) {
            // Trigger background refresh for latest prices/slabs
            setTimeout(() => refreshCart(), 0);
        }
        
        return success;
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
        setCart((prev: CartItemObject) => {
            if (newQty <= 0) {
                const newCart = { ...prev };
                delete newCart[cartKey];
                return newCart;
            }
            
            if (newQty > availableStock) return prev;

            return {
                ...prev,
                [cartKey]: newQty
            };
        });

        if (newQty <= 0) {
            setCartDetails((prev: ProductInfo[]) => prev.filter((p: ProductInfo) => p.cart_key !== cartKey));
        }

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