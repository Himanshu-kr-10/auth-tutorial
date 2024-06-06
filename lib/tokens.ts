import crypto from 'crypto';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

import { getVerificationTokenByEmail } from '@/data/verification-token';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';

export const generateTwoFactorToken = async (email: string) => {
  // Generate a random token of 6 digits
  const token = crypto.randomInt(100000, 1_000_000).toString();
  // Set the expiration date to 5 minutes from now
  const expires = new Date(new Date().getTime() + 5 * 60 * 1000);
  // Check if there is an existing two-factor token for the email
  const existingToken = await getTwoFactorTokenByEmail(email);
  // If there is an existing token, delete it
  if(existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id }
    })
  }
  // Create a new two-factor token
  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires
    }
  });
  // Return the two-factor token
  return twoFactorToken;
}

export const generateVerificationToken = async (email: string) => {
  // Generate a random token
  const token = uuidv4();
  // Set the expiration date to 1 hour from now
  const expires = new Date(new Date().getTime() + 3600 * 1000);
  // Check if there is an existing verification token for the email
  const existingToken = await getVerificationTokenByEmail(email);
  // If there is an existing token, delete it
  if(existingToken) {
    await db.verificationToken.delete({
      where: { id: existingToken.id }
    })
  }
  // Create a new verification token
  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires
    }
  })
  // Return the verification token
  return verificationToken;
}

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if(existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id }
    })
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
}