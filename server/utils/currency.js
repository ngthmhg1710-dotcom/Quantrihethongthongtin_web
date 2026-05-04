const VND_PER_LEGACY_UNIT = 25_000;

function formatVnd(legacyUnitAmount) {
  const vnd = Math.round(Number(legacyUnitAmount) * VND_PER_LEGACY_UNIT);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(vnd) ? vnd : 0);
}

module.exports = { VND_PER_LEGACY_UNIT, formatVnd };
