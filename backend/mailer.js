import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildOtpEmail(toEmail, code) {
  return {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `${code} is your Lokal verification code`,
    text: `Your Lokal OTP is: ${code}\n\nExpires in 60 seconds.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0b0c0f;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0c0f;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#13151a;border-radius:16px;padding:40px;max-width:480px;">
          <tr><td style="padding-bottom:24px;">
            <span style="font-size:12px;font-weight:700;letter-spacing:0.15em;color:rgba(240,240,238,0.4);">● LOKAL</span>
          </td></tr>
          <tr><td style="padding-bottom:12px;">
            <h1 style="margin:0;font-size:24px;color:#f0f0ee;">Your verification code</h1>
          </td></tr>
          <tr><td style="padding-bottom:24px;">
            <p style="margin:0;font-size:14px;color:rgba(240,240,238,0.5);">
              Use the code below to sign in. Expires in <strong style="color:#f0f0ee;">60 seconds</strong>.
            </p>
          </td></tr>
          <tr><td style="padding-bottom:24px;">
            <div style="background:#1c1f27;border-left:4px solid #e8ff4a;border-radius:12px;padding:24px;text-align:center;">
              <span style="font-size:40px;font-weight:800;letter-spacing:0.3em;color:#e8ff4a;font-family:monospace;">${code}</span>
            </div>
          </td></tr>
          <tr><td style="padding-bottom:24px;">
            <p style="margin:0;font-size:12px;color:rgba(240,240,238,0.3);">
              🔒 Never share this code. If you didn't request this, ignore this email.
            </p>
          </td></tr>
          <tr><td style="border-top:1px solid rgba(255,255,255,0.06);padding-top:20px;">
            <p style="margin:0;font-size:11px;color:rgba(240,240,238,0.2);">Sent to ${toEmail}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };
}

export async function sendOtpEmail(email, code) {
  const mail = buildOtpEmail(email, code);
  const info = await transporter.sendMail(mail);
  console.log(`[mailer] OTP sent to ${email}`);
  return info;
}

export async function verifyMailerConnection() {
  await transporter.verify();
  console.log('[mailer] SMTP verified');
}
