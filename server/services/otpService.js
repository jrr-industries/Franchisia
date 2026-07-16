import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prisma.js';
import { sendOtpEmail } from './emailService.js';

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_RESENDS = 3;

function generateOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, 10);
}

async function verifyOtpHash(otp, hash) {
  return bcrypt.compare(otp, hash);
}

export async function createAndSendOtp(userId, email, userName) {
  console.log("[OTP] === createAndSendOtp START ===");
  console.log(`[OTP] userId=${userId}, email=${email}, userName=${userName}`);

  const existingCount = await prisma.otp.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  console.log(`[OTP] Existing OTP count (last 10min): ${existingCount}`);

  if (existingCount >= MAX_RESENDS) {
    console.log(`[OTP] FAIL: Too many resends (${existingCount} >= ${MAX_RESENDS})`);
    return { success: false, error: 'Too many OTP requests. Please try again later.' };
  }

  console.log(`[OTP] Deleting old OTPs for userId=${userId}`);
  await prisma.otp.deleteMany({ where: { userId } });
  console.log(`[OTP] Old OTPs deleted`);

  console.log(`[OTP] Generating OTP...`);
  const otp = generateOtp();
  console.log(`[OTP] Generated OTP: ${otp}`);

  console.log(`[OTP] Hashing OTP...`);
  const otpHash = await hashOtp(otp);
  console.log(`[OTP] Hash: ${otpHash}`);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  console.log(`[OTP] expiresAt: ${expiresAt.toISOString()}`);

  console.log(`[OTP] Saving OTP to database...`);
  try {
    const created = await prisma.otp.create({
      data: { userId, otpHash, expiresAt, attempts: 0 },
    });
    console.log(`[OTP] OTP saved to DB: id=${created.id}, userId=${created.userId}`);

    // Verify it was saved
    const verifySaved = await prisma.otp.findUnique({ where: { id: created.id } });
    if (verifySaved) {
      console.log(`[OTP] Verified: OTP exists in DB (id=${verifySaved.id})`);
    } else {
      console.log(`[OTP] WARNING: OTP not found in DB immediately after create!`);
    }
  } catch (dbError) {
    console.error(`[OTP] DATABASE ERROR during prisma.otp.create:`, dbError);
    return { success: false, error: 'Database error saving OTP' };
  }

  console.log(`[OTP] Calling sendOtpEmail({ email, name: userName }, otp)...`);
  console.log(`[OTP] sendOtpEmail params: email=${email}, otp=${otp}`);

  let emailResult;
  try {
    emailResult = await sendOtpEmail({ email, name: userName }, otp);
    console.log(`[OTP] sendOtpEmail result:`, JSON.stringify(emailResult));
  } catch (emailError) {
    console.error(`[OTP] sendOtpEmail THREW exception:`, emailError);
    console.error(`[OTP] Stack:`, emailError.stack);
    await prisma.otp.deleteMany({ where: { userId } });
    return { success: false, error: 'Exception in sendOtpEmail: ' + emailError.message };
  }

  if (!emailResult.success) {
    console.log(`[OTP] FAIL: sendOtpEmail returned success=false. Error: ${emailResult.error}`);
    console.log(`[OTP] Deleting OTP from DB due to email failure`);
    await prisma.otp.deleteMany({ where: { userId } });
    return { success: false, error: 'Failed to send OTP email. Please try again.' };
  }

  console.log(`[OTP] SUCCESS: OTP sent and email delivered`);
  console.log(`[OTP] === createAndSendOtp END ===`);
  return { success: true, expiresAt };
}

export async function verifyOtp(userId, otp) {
  const otpRecord = await prisma.otp.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    return { success: false, error: 'No OTP found. Please request a new one.' };
  }

  if (new Date() > otpRecord.expiresAt) {
    await prisma.otp.deleteMany({ where: { userId } });
    return { success: false, error: 'OTP has expired. Please request a new one.' };
  }

  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    await prisma.otp.deleteMany({ where: { userId } });
    return { success: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }

  const isValid = await verifyOtpHash(otp, otpRecord.otpHash);

  if (!isValid) {
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_ATTEMPTS - (otpRecord.attempts + 1);
    return { success: false, error: `Invalid code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.` };
  }

  await prisma.otp.deleteMany({ where: { userId } });

  return { success: true };
}

export async function resendOtp(userId, email, userName) {
  const recentCount = await prisma.otp.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
  });

  if (recentCount >= MAX_RESENDS) {
    return { success: false, error: 'Maximum resend limit reached. Please try again later.' };
  }

  await prisma.otp.deleteMany({ where: { userId } });

  return createAndSendOtp(userId, email, userName);
}
