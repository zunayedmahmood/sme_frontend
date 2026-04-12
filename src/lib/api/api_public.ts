import api from '../axios';

/**
 * Public API routes for the frontend
 */

export const getShopStats = async () => {
    const response = await api.get('/shop/stats');
    return response.data;
};

// Categories
export const getCategoryInventory = async () => {
    const response = await api.get('/category/inventory');
    return response.data;
};

export const getCategoryImage = async (id: number | string) => {
    try {
        const response = await api.get(`/category/${id}/image`);
        return response.data;
    } catch (error) {
        return { success: false, message: 'Image not found' };
    }
};

// Contact
export const saveMessage = async (data: any) => {
    const response = await api.post('/contact', data);
    return response.data;
};

// Products
export const getProductFeed = async (params?: any) => {
    const response = await api.get('/product/feed', { params });
    return response.data;
};

export const getProductById = async (id: number | string) => {
    const response = await api.get(`/product/${id}`);
    return response.data;
};

export const updateForCart = async (data: { items: { product_id: number; variation_id?: number | null; qty: number }[] }) => {
    const response = await api.post('/cart/update', data);
    return response.data;
};

// Orders
export const sellProduct = async (products: { product_id: number; variation_id?: number | null; quantity: number }[], orderData: any) => {
    const response = await api.post('/order/sell', { products, orderData });
    return response.data;
};

export const getOrderById = async (orderId: string) => {
    const response = await api.get(`/order/${orderId}`);
    return response.data;
};

export const manualOrderPayment = async (orderId: string) => {
    const response = await api.post('/order/manual-payment', { order_id: orderId });
    return response.data;
};

// Reserved for potential use if needed later
// export const addTransactionId = async (orderId: string, transactionId: string) => { ... }

// Delivery
export const getGlobalDeliveryCharge = async () => {
    const response = await api.get('/admin/settings/delivery');
    return response.data;
};

// Auth
export const login = async (credentials: any) => {
    const response = await api.post('/login', credentials);
    return response.data;
};
