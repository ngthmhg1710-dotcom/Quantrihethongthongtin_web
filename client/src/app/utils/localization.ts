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

const PRODUCT_NAME_VI_BY_ID: Record<number, string> = {
  1: 'Serum Hoa Hồng Cấp Ẩm',
  2: 'Sữa Rửa Mặt Tạo Bọt Dịu Nhẹ',
  3: 'Kem Dưỡng Sáng Da Vitamin C',
  4: 'Nước Cân Bằng Tẩy Da Chết',
  5: 'Kem Dưỡng Đêm Nuôi Dưỡng',
  6: 'Kem Chống Nắng SPF 50',
  7: 'Mặt Nạ Cấp Ẩm',
  8: 'Kem Mắt Tái Tạo',
  9: 'Mặt Nạ Đất Sét Làm Sạch',
  10: 'Bộ Chăm Sóc Môi',
  11: 'Xịt Tinh Chất Cân Bằng Da',
  12: 'Kem Dưỡng Phục Hồi Hàng Rào Da',
  13: 'Gel Rửa Mặt Dịu Nhẹ Hằng Ngày',
  14: 'Serum Niacinamide Sáng Da',
  15: 'Serum Tái Tạo Retinol',
  16: 'Kem Làm Dịu Cica',
};

export const localizeCategory = (category: string) => CATEGORY_VI_MAP[category] || category;

export const localizeProduct = <T extends Product>(product: T): T => {
  const localizedName = PRODUCT_NAME_VI_BY_ID[product.id] || product.name;
  return {
    ...product,
    name: localizedName,
    category: localizeCategory(product.category),
  };
};
