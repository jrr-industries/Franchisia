export default function applicationReceivedEmail(application) {
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
    p { color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .info { background: ${bgColor}; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .info p { margin-bottom: 8px; font-size: 14px; }
    .info strong { color: #1E293B; }
    .btn { display: inline-block; padding: 14px 32px; background-color: ${brandColor}; color: #FFFFFF; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; }
    .btn-wrap { text-align: center; margin-bottom: 24px; }
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
      <h2>New Application Received</h2>
      <p>Hi there,</p>
      <p>You've received a new application for <strong>${application.listing?.title || 'your listing'}</strong>.</p>
      <div class="info">
        <p><strong>Applicant:</strong> ${application.applicant?.name || 'N/A'}</p>
        <p><strong>Email:</strong> ${application.applicant?.email || 'N/A'}</p>
        <p><strong>Listing:</strong> ${application.listing?.title || 'N/A'}</p>
        <p><strong>Received:</strong> ${new Date(application.createdAt).toLocaleDateString()}</p>
      </div>
      <div class="btn-wrap">
        <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard/applications/${application.id}" class="btn">Review Application</a>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Franchisia. All rights reserved.</p>
        <p>New application received</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}
