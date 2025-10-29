export const VoucherQueries = {
  all: "SELECT * FROM vouchers",
  findActive: "SELECT * FROM vouchers WHERE expires_at > NOW()",
  redeem: "UPDATE vouchers SET redeemed_at = NOW(), redeemed_by = ? WHERE code = ?"
};
