import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createOtp, verifyOtp, deleteOtp, MAX_ATTEMPTS } from './otpStore.js';
import { sendOtpEmail, verifyMailerConnection } from './mailer.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/send-otp
app.post('/api/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Invalid email.' });
  }
  
  const normalized = email.trim().toLowerCase();
  
  try {
    deleteOtp(normalized);
    const code = createOtp(normalized);
    await sendOtpEmail(normalized, code);
    
    console.log(`[send-otp] ✓ ${normalized}`);
    return res.json({ success: true, expiresIn: 60 });
  } catch (err) {
    console.error('[send-otp] Error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Invalid email.' });
  }
  
  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({ success: false, message: 'OTP must be 6 digits.' });
  }
  
  const normalized = email.trim().toLowerCase();
  const result = verifyOtp(normalized, otp);
  
  if (result.success) {
    console.log(`[verify-otp] ✓ ${normalized}`);
    return res.json({ success: true });
  }
  
  const messages = {
    no_otp: 'No OTP found. Please request a new one.',
    expired: 'OTP expired. Please request a new one.',
    max_attempts: `Max ${MAX_ATTEMPTS} attempts. Please request a new OTP.`,
    wrong_code: `Incorrect. ${result.remaining} attempt${result.remaining !== 1 ? 's' : ''} left.`,
  };
  
  console.warn(`[verify-otp] ✗ ${normalized} (${result.reason})`);
  return res.status(400).json({
    success: false,
    reason: result.reason,
    remaining: result.remaining || null,
    message: messages[result.reason] || 'Verification failed.',
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, async () => {
  console.log(`\n Backend → http://localhost:${PORT}`);
  
  if (!process.env.SMTP_USER) {
    console.warn(' SMTP not configured. Copy .env.example → .env\n');
    return;
  }
  
  try {
    await verifyMailerConnection();
  } catch (err) {
    console.error(' SMTP failed:', err.message);
  }
});
