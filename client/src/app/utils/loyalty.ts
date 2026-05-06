/** Đồng bộ với server/utils/loyalty.js */
export const LOYALTY_TIERS = [
  { min: 50, title: 'Thành viên Đồng', benefit: 'Giảm 3% cho đơn hàng kế tiếp (theo điều kiện chương trình).' },
  { min: 120, title: 'Thành viên Bạc', benefit: 'Giảm 5% + ưu tiên hỗ trợ khi mua hàng.' },
  { min: 250, title: 'Thành viên Vàng', benefit: 'Miễn phí vận chuyển đơn kế tiếp (theo điều kiện).' },
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
