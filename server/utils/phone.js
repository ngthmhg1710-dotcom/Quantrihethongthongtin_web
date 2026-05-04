/** Strip spaces, dots, dashes, parens — matches client checkout normalization. */
function normalizePhoneInput(input) {
  const s = String(input ?? "").trim();
  if (!s) return "";
  return s.replace(/[\s().\-_]/g, "");
}

function isValidPhoneNormalized(normalized) {
  return /^\+?[0-9]{8,16}$/.test(normalized);
}

module.exports = { normalizePhoneInput, isValidPhoneNormalized };
