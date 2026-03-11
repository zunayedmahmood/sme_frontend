import api from '../axios';

/**
 * Private API routes for the frontend (Requires Authentication)
 */

// Auth
export const logout = async () => {
    const response = await api.post('/logout');
    return response.data;
};

// Admin Categories
export const createCategory = async (name: string) => {
    const response = await api.post('/category', { name });
    return response.data;
};

export const getCategoryById = async (id: number | string) => {
    const response = await api.get(`/category/${id}`);
    return response.data;
};

export const getAllCategories = async () => {
    const response = await api.get('/category');
    return response.data;
};

export const updateCategoryName = async (id: number | string, name: string) => {
    const response = await api.patch(`/category/${id}`, { name });
    return response.data;
};

export const deleteCategory = async (id: number | string) => {
    const response = await api.delete(`/category/${id}`);
    return response.data;
};

// Admin Category Images
export const saveCategoryImage = async (formData: FormData) => {
    const response = await api.post('/category/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const updateCategoryImage = async (formData: FormData) => {
    // Backend route is PATCH /category/image/update
    const response = await api.patch('/category/image/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteCategoryImage = async (id: number | string) => {
    const response = await api.delete(`/category/${id}/image`);
    return response.data;
};

// Admin Contact
export const getMessages = async (params?: any) => {
    const response = await api.get('/admin/contact', { params });
    return response.data;
};

export const deleteMessage = async (id: number | string) => {
    const response = await api.delete(`/admin/contact/${id}`);
    return response.data;
};

// Admin Products
export const getAllProductsAdmin = async () => {
    const response = await api.get('/admin/product');
    return response.data;
};

export const getAllProductsPaginatedAdmin = async (params?: any) => {
    const response = await api.get('/admin/product/paginated', { params });
    return response.data;
};

export const createProduct = async (formData: FormData) => {
    // Note: Use FormData for file uploads
    const response = await api.post('/product', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProductAdmin = async (id: number | string) => {
    const response = await api.delete(`/product/${id}`);
    return response.data;
};

export const updateProductName = async (id: number | string, name: string) => {
    const response = await api.patch(`/product/${id}/name`, { name });
    return response.data;
};

export const updateSellingPrice = async (id: number | string, selling_price: number) => {
    const response = await api.patch(`/product/${id}/price`, { selling_price });
    return response.data;
};

export const updateProductDescription = async (id: number | string, description: string | null) => {
    const response = await api.patch(`/product/${id}/description`, { description });
    return response.data;
};

export const addProductCategories = async (pid: number | string, categoryIds: number[]) => {
    const response = await api.post(`/product/${pid}/categories`, { category_ids: categoryIds });
    return response.data;
};

export const removeProductCategories = async (pid: number | string, categoryIds: number[]) => {
    const response = await api.delete(`/product/${pid}/categories`, { data: { category_ids: categoryIds } });
    return response.data;
};

export const addProductImages = async (id: number | string, formData: FormData) => {
    const response = await api.post(`/product/${id}/images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteProductImages = async (id: number | string, paths: string[]) => {
    const response = await api.delete(`/product/${id}/images`, { data: { paths } });
    return response.data;
};

export const getTotalCount = async (id: number | string) => {
    const response = await api.get(`/product/${id}/total-count`);
    return response.data;
};

export const updateTotalCountManual = async (id: number | string) => {
    const response = await api.post(`/product/${id}/update-total-count`);
    return response.data;
};

// Admin Inventory (Batches)
export const addInventoryBatch = async (data: { product_id: number; cost_price: number; quantity: number }) => {
    const response = await api.post('/inventory/add', data);
    return response.data;
};

export const removeInventoryBatch = async (data: { product_id: number; product_batch_id: number; quantity: number }) => {
    const response = await api.post('/inventory/remove', data);
    return response.data;
};

export const deleteInventoryBatch = async (data: { product_id: number; product_batch_id: number }) => {
    const response = await api.delete('/inventory/batch', { data });
    return response.data;
};

// Admin Orders
export const getAdminOrderList = async (params?: any) => {
    const response = await api.get('/admin/order-list', { params });
    return response.data;
};

export const confirmOrderPayment = async (orderId: string) => {
    const response = await api.post(`/order/${orderId}/confirm-payment`);
    return response.data;
};

// getTransactionByOrderPk removed – /order/transaction/{id} does not exist in the backend.
export const createOrder = async (data: any) => {
    const response = await api.post('/order/create', data);
    return response.data;
};

export const updateOrder = async (orderId: string, data: any) => {
    const response = await api.patch(`/order/${orderId}/update`, data);
    return response.data;
};

export const deleteOrder = async (orderId: string) => {
    const response = await api.delete(`/order/${orderId}`);
    return response.data;
};
