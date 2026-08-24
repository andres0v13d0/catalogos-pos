export interface VariantOption {
  variantId: string;
  optionId: string;
  value: string;
}

export interface Combination {
  id: string;
  price: number;
  price2?: number;
  price3?: number;
  stock?: number;
  variantOptions: VariantOption[];
}

export interface Variant {
  variantId: string;
  variantName: string;
  selectedOptionIds: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  price2?: number;
  price3?: number;
  basePrice?: number;
  imageUrl?: string;
  images?: string[];
  variants?: Variant[];
  combinations?: Combination[];
}

export interface CatalogCategory {
  id: string;
  name: string;
}

export interface CatalogData {
  id: string;
  publicName?: string;
  description?: string;
  whatsappNumber?: string;
  requiresCheckout?: boolean;
  layout?: "default" | "2col" | "shopify";
  priceDisplay?: "price" | "price2" | "price3" | null;
  categories?: CatalogCategory[];
}

export interface BodegaData {
  name: string;
  publicName?: string;
  description?: string;
  phone?: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export interface CatalogIdsResponse {
  catalog: CatalogData;
  bodega: BodegaData;
  productIds: string[];
}

export interface CartItemVariantOption {
  variantName: string;
  optionValue: string;
}

export interface CartItem {
  cartItemId?: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  combinationId: string | null;
  variantOptions: CartItemVariantOption[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
