import { logOtpGenerated, logOtpSuccess, logOtpFailure } from './analytics';

const BASE = '/api';

export async function sendOtp(email: string) {
  const res = await fetch(`${BASE}/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  
  if (data.success) {
    logOtpGenerated(email, '6');
  }
  
  return data;
}

export async function verifyOtp(email: string, otp: string) {
  const res = await fetch(`${BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp }),
  });
  const data = await res.json();
  
  if (data.success) {
    logOtpSuccess(email);
  } else {
    logOtpFailure(email, data.reason || 'unknown', data.remaining);
  }
  
  return data;
}
