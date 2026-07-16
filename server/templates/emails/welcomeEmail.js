export default function welcomeEmail(user) {
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
    .btn { display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; }
    .btn-wrap { text-align: center; margin-bottom: 24px; }
    .footer { text-align: center; padding-top: 30px; border-top: 1px solid #E2E8F0; margin-top: 30px; }
    .footer p { color: #94A3B8; font-size: 13px; margin-bottom: 8px; }
    .features { display: flex; flex-wrap: wrap; gap: 16px; margin: 24px 0; }
    .feature { flex: 1 1 45%; background: ${bgColor}; border-radius: 8px; padding: 16px; text-align: center; }
    .feature h3 { color: #1E293B; font-size: 14px; margin: 0 0 4px; }
    .feature p { color: #64748B; font-size: 12px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">
        <h1>Franchisia</h1>
      </div>
      <h2>Welcome to Franchisia!</h2>
      <p>Hi ${user.name || 'there'},</p>
      <p>Your email has been verified successfully. You're now ready to explore franchise opportunities, connect with franchisors, and grow your business.</p>
      <div class="features">
        <div class="feature"><h3>Discover</h3><p>Browse franchise opportunities</p></div>
        <div class="feature"><h3>Connect</h3><p>Network with franchisors</p></div>
        <div class="feature"><h3>Apply</h3><p>Submit applications easily</p></div>
        <div class="feature"><h3>Grow</h3><p>Build your franchise portfolio</p></div>
      </div>
      <div class="btn-wrap">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}" class="btn">Get Started</a>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Franchisia. All rights reserved.</p>
        <p>Welcome aboard!</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
