"use server";

import * as z from 'zod';
import bcrypt from 'bcrypt';

import { RegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { generateVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/mail';

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validatedfields = RegisterSchema.safeParse(values);

  if(!validatedfields.success){
    return { error: 'Invalid fields' };
  }

  const { email, password, name } = validatedfields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if(existingUser){
    return { error: 'Email already in use!' };
  }

  await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword
    }
  });

  // TODO: Send verification token to email
  const verificationToken = await generateVerificationToken(email);

  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: 'Sent Email for verification' };
}