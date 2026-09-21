import emailOtpModel from "../models/emailOtp.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOtpNotification } from "../utils/bookingnotification.js";

const OTP_TIME_MIN = 10;
const MAX_ATTEMPTS = 5;

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

export const generateOtp = async ({ email, purpose }) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !purpose) {
    return { ok: false, sent: false, reason: "Email and purpose are required" };
  }

  const code = crypto.randomInt(100000, 1000000).toString();
  const codeHash = await bcrypt.hash(code, 10);
  const expireAt = new Date(Date.now() + OTP_TIME_MIN * 60 * 1000);

  try {
    await sendOtpNotification({
      email: normalizedEmail,
      code,
      purpose,
    });
  } catch (error) {
    console.error("OTP email failed:", error.message);
    return {
      ok: false,
      sent: false,
      reason: error.message || "Failed to send OTP email via Brevo",
    };
  }

  await emailOtpModel.create({
    email: normalizedEmail,
    purpose,
    codeHash,
    expireAt,
    attempts: 0,
    consumeAt: null,
  });

  return { ok: true, sent: true };
};

export const verifyOtp = async ({ email, purpose, code, consume = true }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedCode = String(code || "").trim();

  if (!normalizedEmail || !purpose || !normalizedCode) {
    return { verified: false, reason: "Email and OTP are required" };
  }

  const record = await emailOtpModel
    .findOne({
      email: normalizedEmail,
      purpose,
    })
    .sort({ _id: -1 });

  if (!record) {
    return { verified: false, reason: "No verification code found. Request a new one." };
  }

  if (record.consumeAt) {
    return { verified: false, reason: "This code was already used. Request a new one." };
  }

  if (new Date() > record.expireAt) {
    return { verified: false, reason: "This code has expired. Request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    return { verified: false, reason: "Too many attempts. Request a new code." };
  }

  const isCodeMatched = await bcrypt.compare(normalizedCode, record.codeHash);

  if (!isCodeMatched) {
    record.attempts += 1;
    await record.save();
    return { verified: false, reason: "Invalid OTP" };
  }

  if (consume) {
    record.consumeAt = new Date();
    await record.save();
  }

  return { verified: true };
};
