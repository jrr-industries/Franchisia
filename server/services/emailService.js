import { Resend } from 'resend';
import verificationEmail from '../templates/emails/verificationEmail.js';
import welcomeEmail from '../templates/emails/welcomeEmail.js';
import passwordResetEmail from '../templates/emails/passwordResetEmail.js';
import applicationSubmittedEmail from '../templates/emails/applicationSubmitted.js';
import applicationReceivedEmail from '../templates/emails/applicationReceived.js';
import applicationApprovedEmail from '../templates/emails/applicationApproved.js';
import applicationRejectedEmail from '../templates/emails/applicationRejected.js';
import otpEmail from '../templates/emails/otpEmail.js';

let resend = null;

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
} else {
  console.warn('RESEND_API_KEY not set. Emails will not be sent.');
}

const FROM = process.env.EMAIL_FROM || 'Franchisia <onboarding@resend.dev>';

if (FROM.includes('onboarding@resend.dev')) {
  console.warn('DEV MODE: EMAIL_FROM is onboarding@resend.dev. Resend free tier silently drops emails to unverified recipients. Set a custom domain in production.');
}

const REPLY_TO = process.env.EMAIL_REPLY_TO || 'support@franchisia.com';

export async function sendEmail({ to, subject, html, text }) {
  if (!resend) {
    console.warn('Email not sent: RESEND_API_KEY not configured');
    return { success: false, skipped: true };
  }
  try {
    const data = { from: FROM, to, subject, html };
    if (text) data.text = text;
    if (REPLY_TO) data.reply_to = REPLY_TO;
    console.log(`[Resend] Sending email to=${to}, from=${FROM}, subject=${subject}`);
    console.log(`[Resend] Resend API key present: ${!!process.env.RESEND_API_KEY}`);
    const response = await resend.emails.send(data);
    console.log(`[Resend] Raw response:`, JSON.stringify(response));
    if (response?.error) {
      console.error(`[Resend] ERROR: ${response.error.message} (code=${response.error.statusCode})`);
      return { success: false, error: response.error.message, code: response.error.statusCode };
    }
    const resendId = response?.data?.id || response?.id || null;
    if (resendId) {
      console.log(`[Resend] SUCCESS: Email sent with id=${resendId}`);
      return { success: true, resendId };
    }
    console.error(`[Resend] UNKNOWN: No resendId and no error in response. Response:`, JSON.stringify(response));
    return { success: false, error: 'Unknown Resend response format' };
  } catch (error) {
    console.error('[Resend] EXCEPTION:', error);
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmail(user, url) {
  const html = verificationEmail(user, url);
  const result = await sendEmail({
    to: user.email,
    subject: 'Verify your Franchisia email',
    html,
    text: `Verify your email by visiting: ${url}`,
  });
  if (result.success) console.log('✓ Verification email sent');
  return result;
}

export async function sendWelcomeEmail(user) {
  const html = welcomeEmail(user);
  const result = await sendEmail({
    to: user.email,
    subject: 'Welcome to Franchisia!',
    html,
    text: 'Welcome to Franchisia! Your email has been verified successfully.',
  });
  if (result.success) console.log('✓ Welcome email sent');
  return result;
}

export async function sendPasswordResetEmail(user, url) {
  const html = passwordResetEmail(user, url);
  const result = await sendEmail({
    to: user.email,
    subject: 'Reset your Franchisia password',
    html,
    text: `Reset your password by visiting: ${url}`,
  });
  if (result.success) console.log('✓ Password reset email sent');
  return result;
}

export async function sendApplicationSubmittedEmail(application) {
  const html = applicationSubmittedEmail(application);
  const result = await sendEmail({
    to: application.applicant.email,
    subject: 'Application Submitted Successfully',
    html,
    text: `Your application for ${application.listing?.title || 'the franchise'} has been submitted successfully.`,
  });
  if (result.success) console.log('✓ Application email sent');
  return result;
}

export async function sendApplicationReceivedEmail(application, franchisorEmail) {
  const html = applicationReceivedEmail(application);
  const result = await sendEmail({
    to: franchisorEmail,
    subject: 'New Franchise Application Received',
    html,
    text: `A new application has been received for ${application.listing?.title || 'your listing'}.`,
  });
  if (result.success) console.log('✓ Application email sent');
  return result;
}

export async function sendApplicationApprovedEmail(application) {
  const html = applicationApprovedEmail(application);
  const result = await sendEmail({
    to: application.applicant.email,
    subject: 'Application Approved!',
    html,
    text: `Your application for ${application.listing?.title || 'the franchise'} has been approved!`,
  });
  if (result.success) console.log('✓ Application email sent');
  return result;
}

export async function sendApplicationRejectedEmail(application) {
  const html = applicationRejectedEmail(application);
  const result = await sendEmail({
    to: application.applicant.email,
    subject: 'Application Status Update',
    html,
    text: `Your application for ${application.listing?.title || 'the franchise'} has been reviewed.`,
  });
  if (result.success) console.log('✓ Application email sent');
  return result;
}

export async function sendOtpEmail(user, otpCode) {
  console.log("[Email] === sendOtpEmail START ===");
  console.log(`[Email] Recipient: ${user?.email}`);
  console.log(`[Email] OTP code: ${otpCode}`);
  console.log(`[Email] Subject: Your Franchisia Verification Code`);

  const html = otpEmail(user, otpCode);
  console.log(`[Email] HTML body length: ${html.length} chars`);
  console.log(`[Email] HTML body preview (first 200 chars): ${html.substring(0, 200)}`);

  console.log(`[Email] Checking if OTP appears in HTML: ${html.includes(otpCode) ? 'YES - OTP found in template' : 'WARNING - OTP NOT in template!'}`);

  console.log(`[Email] Calling sendEmail(to=${user.email})...`);

  const result = await sendEmail({
    to: user.email,
    subject: 'Your Franchisia Verification Code',
    html,
    text: `Your verification code is: ${otpCode}. It expires in 10 minutes.`,
  });

  console.log(`[Email] sendEmail returned:`, JSON.stringify(result));
  console.log(`[Email] === sendOtpEmail END ===`);

  if (result.success) {
    console.log('✓ OTP email sent successfully via Resend');
  } else {
    console.log(`✗ OTP email FAILED: ${result.error || 'Unknown error'}`);
  }

  return result;
}
