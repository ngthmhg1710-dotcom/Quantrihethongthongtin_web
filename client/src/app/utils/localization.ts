import type { Product } from '../data/products';

const CATEGORY_VI_MAP: Record<string, string> = {
  Cleanser: 'Sữa rửa mặt',
  Toner: 'Nước cân bằng',
  Serum: 'Serum',
  Moisturizer: 'Kem dưỡng ẩm',
  Sunscreen: 'Kem chống nắng',
  'Eye Cream': 'Kem mắt',
  Mask: 'Mặt nạ',
  'Night Cream': 'Kem dưỡng đêm',
  'Lip Care': 'Chăm sóc môi',
  Exfoliator: 'Tẩy tế bào chết',
  Essence: 'Tinh chất',
  Ampoule: 'Ống tinh chất',
  'Body Care': 'Chăm sóc cơ thể',
  'Makeup Remover': 'Tẩy trang',
};

export const localizeCategory = (category: string) => CATEGORY_VI_MAP[category] || category;

export const localizeProduct = <T extends Product>(product: T): T => ({
  ...product,
  category: localizeCategory(product.category),
});
