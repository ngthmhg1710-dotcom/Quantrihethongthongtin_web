/**
 * Điểm thưởng: 1 điểm / 1 đơn vị giá trị đơn hàng (cùng đơn vị với total trong DB), tối thiểu 1 điểm / giao dịch.
 * Ngưỡng ưu đãi — đồng bộ với client/src/app/utils/loyalty.ts (min, title, benefit).
 */
const LOYALTY_TIERS = [
  { min: 50, title: "Thành viên Đồng", benefit: "Giảm 3% tạm tính mỗi đơn khi thanh toán." },
  { min: 120, title: "Thành viên Bạc", benefit: "Giảm 5% tạm tính mỗi đơn khi thanh toán." },
  { min: 250, title: "Thành viên Vàng", benefit: "Giảm 5% tạm tính + miễn phí giao hàng mỗi đơn." },
];

function computePointsEarned(orderTotal) {
  const t = Number(orderTotal);
  if (!Number.isFinite(t) || t <= 0) return 1;
  return Math.max(1, Math.floor(t));
}

function findNewlyUnlockedTiers(previousPoints, newPoints) {
  const prev = Math.max(0, Math.floor(Number(previousPoints) || 0));
  const next = Math.max(0, Math.floor(Number(newPoints) || 0));
  return LOYALTY_TIERS.filter((tier) => prev < tier.min && next >= tier.min).map((tier) => ({
    min: tier.min,
    title: tier.title,
    benefit: tier.benefit,
  }));
}

/**
 * Giá trị đơn = tạm tính sản phẩm (trước ship). Điểm tính theo số dư *trước* khi cộng điểm đơn này.
 * Đồng 50+: giảm 3% tạm tính. Bạc 120+: giảm 5%. Vàng 250+: giảm 5% + luôn miễn phí ship đơn này.
 */
function getLoyaltyDiscountMeta(points) {
  const p = Math.max(0, Math.floor(Number(points) || 0));
  if (p >= 250) return { discountPercent: 5, loyaltyFreeShipping: true };
  if (p >= 120) return { discountPercent: 5, loyaltyFreeShipping: false };
  if (p >= 50) return { discountPercent: 3, loyaltyFreeShipping: false };
  return { discountPercent: 0, loyaltyFreeShipping: false };
}

module.exports = {
  LOYALTY_TIERS,
  computePointsEarned,
  findNewlyUnlockedTiers,
  getLoyaltyDiscountMeta,
};
