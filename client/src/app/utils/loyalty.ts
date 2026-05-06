/** Đồng bộ với server/utils/loyalty.js */
export const LOYALTY_TIERS = [
  { min: 50, title: 'Thành viên Đồng', benefit: 'Giảm 3% tạm tính mỗi đơn khi thanh toán.' },
  { min: 120, title: 'Thành viên Bạc', benefit: 'Giảm 5% tạm tính mỗi đơn khi thanh toán.' },
  { min: 250, title: 'Thành viên Vàng', benefit: 'Giảm 5% tạm tính + miễn phí giao hàng mỗi đơn.' },
] as const;

export function getCurrentLoyaltyTier(points: number) {
  const p = Math.max(0, Math.floor(points));
  let current: (typeof LOYALTY_TIERS)[number] | null = null;
  for (const t of LOYALTY_TIERS) {
    if (p >= t.min) current = t;
  }
  return current;
}

export function getNextLoyaltyTier(points: number) {
  const p = Math.max(0, Math.floor(points));
  return LOYALTY_TIERS.find((t) => p < t.min) ?? null;
}

/** Đồng bộ với server/utils/loyalty.js — getLoyaltyDiscountMeta */
export function getLoyaltyDiscountMeta(points: number) {
  const p = Math.max(0, Math.floor(points));
  if (p >= 250) return { discountPercent: 5, loyaltyFreeShipping: true };
  if (p >= 120) return { discountPercent: 5, loyaltyFreeShipping: false };
  if (p >= 50) return { discountPercent: 3, loyaltyFreeShipping: false };
  return { discountPercent: 0, loyaltyFreeShipping: false };
}
