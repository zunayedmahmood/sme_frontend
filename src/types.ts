export interface Variation {
    id: number;
    product_id: number;
    name: string;
    selling_price: number | null;
    has_dynamic_pricing: boolean;
    price_slabs: { min_qty: number; max_qty: number | null; price: number }[] | null;
    image_src: string[] | null;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    selling_price: number | null;
    sold_count: number;
    total_count: number;
    available_stock: number;
    image_src: string[];
    categories?: { id: number; name: string }[];
    has_dynamic_pricing: boolean;
    price_slabs: { min_qty: number; max_qty: number | null; price: number }[] | null;
    has_variations: boolean;
    variations: Variation[];
}
