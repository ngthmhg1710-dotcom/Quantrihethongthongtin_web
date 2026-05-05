/**
 * Giá trong API / Mongo hiện lưu theo đơn vị mô phỏng như USD (vd. 45).
 * Hiển thị VND: nhân VND_PER_LEGACY_UNIT (có thể chỉnh 1 chỗ).
 */
export const VND_PER_LEGACY_UNIT = 25_000;

/** Miễn phí ship khi tạm tính (cùng đơn vị lưu trong DB) ≥ giá trị này. */
export const SHIPPING_FREE_SUBTOTAL_MIN_LEGACY = 20;

/** Phí ship khi chưa đủ ngưỡng (cùng đơn vị lưu trong DB). */
export const SHIPPING_FEE_LEGACY = 5.99;

export function formatVnd(legacyUnitAmount: number): string {
  const vnd = Math.round(Number(legacyUnitAmount) * VND_PER_LEGACY_UNIT);
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(vnd) ? vnd : 0);
}
