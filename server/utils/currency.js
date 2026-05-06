const VND_PER_LEGACY_UNIT = 25_000;

/** Đồng bộ với client/src/app/utils/currency.ts — đơn vị legacy như trong DB. */
const SHIPPING_FREE_SUBTOTAL_MIN_LEGACY = 20;
const SHIPPING_FEE_LEGACY = 5.99;

function formatVnd(legacyUnitAmount) {
  const vnd = Math.round(Number(legacyUnitAmount) * VND_PER_LEGACY_UNIT);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(vnd) ? vnd : 0);
}

module.exports = {
  VND_PER_LEGACY_UNIT,
  SHIPPING_FREE_SUBTOTAL_MIN_LEGACY,
  SHIPPING_FEE_LEGACY,
  formatVnd,
};
