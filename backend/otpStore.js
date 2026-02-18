export const OTP_EXPIRY_MS = 60_000;
export const MAX_ATTEMPTS  = 3;

const store = new Map();

export function createOtp(email) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  store.set(email, {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: Date.now(),
  });
  return code;
}

export function verifyOtp(email, inputCode) {
  const record = store.get(email);
  if (!record) return { success: false, reason: 'no_otp' };
  
  if (Date.now() > record.expiresAt) {
    store.delete(email);
    return { success: false, reason: 'expired' };
  }
  
  if (record.attempts >= MAX_ATTEMPTS) {
    return { success: false, reason: 'max_attempts' };
  }
  
  record.attempts += 1;
  
  if (record.code === inputCode) {
    store.delete(email);
    return { success: true };
  }
  
  const remaining = MAX_ATTEMPTS - record.attempts;
  return { success: false, reason: 'wrong_code', remaining };
}

export function deleteOtp(email) {
  store.delete(email);
}
