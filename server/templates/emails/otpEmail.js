export default function otpEmail(user, otpCode) {
  const brandColor = '#2563EB';
  const bgColor = '#F8FAFC';
  const cardColor = '#FFFFFF';

  return `
<!html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: ${cardColor}; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 30px; }
    .logo h1 { color: ${brandColor}; font-size: 28px; margin: 0; }
    h2 { color: #1E293B; font-size: 22px; text-align: center; margin-bottom: 20px; }
    p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: center; }
    .otp-wrap { text-align: center; margin: 32px 0; }
    .otp { display: inline-block; padding: 16px 40px; background: #F0F5FF; border: 2px dashed ${brandColor}; border-radius: 12px; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: ${brandColor}; font-family: 'Courier New', monospace; }
    .meta { text-align: center; background: ${bgColor}; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .meta p { font-size: 13px; color: #64748B; margin: 0; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E2E8F0; margin-top: 30px; }
    .footer p { color: #94A3B8; font-size: 13px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <h1>Franchisia</h1>
      </div>
      <h2>Verify Your Email</h2>
      <p>Hi ${user.name || 'there'},</p>
      <p>Use the verification code below to complete your email verification. This code expires in 10 minutes.</p>
      <div class="otp-wrap">
        <div class="otp">${otpCode}</div>
      </div>
      <div class="meta">
        <p>If you didn't create this account, please ignore this email.</p>
        <p>For security, never share this code with anyone.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Franchisia. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
