-- Remove legacy password-reset OTP columns and the unused friends table.
ALTER TABLE users DROP COLUMN IF EXISTS reset_otp;
ALTER TABLE users DROP COLUMN IF EXISTS reset_otp_expiry;
DROP TABLE IF EXISTS user_friends;
