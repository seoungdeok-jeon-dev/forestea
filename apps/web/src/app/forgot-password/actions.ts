"use server";

import { prisma } from "@forestea/db";
import crypto from "crypto";

export interface PasswordResetResult {
  ok: boolean;
  error?: string;
}

export async function requestPasswordReset(formData: FormData): Promise<PasswordResetResult> {
  const email = (formData.get("email") as string | null)?.toLowerCase().trim();

  if (!email) {
    return { ok: false, error: "Email is required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // For security, always return success even if user doesn't exist
  // This prevents email enumeration attacks
  if (!user) {
    // Still return success to prevent attackers from knowing if email exists
    return { ok: true };
  }

  // Don't allow password reset for OAuth-only accounts
  if (!user.passwordHash) {
    return { ok: false, error: "This account uses social login. Please sign in with Google." };
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

  // Save token to database
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // TODO: Send email with reset link
  // For now, just log it (in production, use a proper email service like Resend, SendGrid, etc.)
  const resetUrl = `${process.env.AUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  console.log("\n=================================");
  console.log("PASSWORD RESET REQUEST");
  console.log("=================================");
  console.log(`Email: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`Token expires: ${resetTokenExpiry.toISOString()}`);
  console.log("=================================\n");

  // In production, send email here:
  // await sendEmail({
  //   to: email,
  //   subject: "Reset your Forestea password",
  //   html: `Click here to reset your password: ${resetUrl}`,
  // });

  return { ok: true };
}

export async function resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
  if (!token) {
    return { ok: false, error: "Invalid or missing reset token." };
  }

  if (!newPassword || newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  // Find user with valid token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date(), // Token must not be expired
      },
    },
  });

  if (!user) {
    return { ok: false, error: "Invalid or expired reset token." };
  }

  // Hash new password
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  return { ok: true };
}
