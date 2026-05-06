/**
 * Điểm thưởng: 1 điểm / 1 đơn vị giá trị đơn hàng (cùng đơn vị với total trong DB), tối thiểu 1 điểm / giao dịch.
 * Ngưỡng ưu đãi — đồng bộ với client/src/app/utils/loyalty.ts (min, title, benefit).
 */
const LOYALTY_TIERS = [
  { min: 50, title: "Thành viên Đồng", benefit: "Giảm 3% cho đơn hàng kế tiếp (theo điều kiện chương trình)." },
  { min: 120, title: "Thành viên Bạc", benefit: "Giảm 5% + ưu tiên hỗ trợ khi mua hàng." },
  { min: 250, title: "Thành viên Vàng", benefit: "Miễn phí vận chuyển đơn kế tiếp (theo điều kiện)." },
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

module.exports = {
  LOYALTY_TIERS,
  computePointsEarned,
  findNewlyUnlockedTiers,
};
