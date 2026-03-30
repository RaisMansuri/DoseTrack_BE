const otpStore = new Map();

function makeOtpKey(email) {
  return email.trim().toLowerCase();
}

function saveOtp(email, otp, ttlMinutes = 5) {
  const key = makeOtpKey(email);
  otpStore.set(key, {
    otp,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000
  });
}

function readOtp(email) {
  const key = makeOtpKey(email);
  const record = otpStore.get(key);

  if (!record) {
    return null;
  }

  if (record.expiresAt < Date.now()) {
    otpStore.delete(key);
    return null;
  }

  return record;
}

function clearOtp(email) {
  otpStore.delete(makeOtpKey(email));
}

module.exports = {
  saveOtp,
  readOtp,
  clearOtp
};
