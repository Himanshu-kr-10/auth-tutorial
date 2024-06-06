"use server";

import * as z from 'zod';

import { LoginSchema } from '@/schemas';
import { db } from '@/lib/db';
import { signIn } from '@/auth';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { AuthError } from 'next-auth';
import { getUserByEmail } from '@/data/user';
import { 
  generateVerificationToken, 
  generateTwoFactorToken
} from '@/lib/tokens';
import { 
  sendVerificationEmail,
  sendTwoFactorTokenEmail
} from '@/lib/mail';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';


export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {

  
  // Validate the fields on server side
  const validatedfields = LoginSchema.safeParse(values);
  // If the fields are invalid, return an error
  if(!validatedfields.success){
    return { error: 'Invalid fields' };
  }
  // Destructure the fields
  const { email, password, code } = validatedfields.data;
  // Check if the user exists in the database using the email
  const existingUser = await getUserByEmail(email);
  // If the user does not exist, return an error
  if(!existingUser || !existingUser.password || !existingUser.email){
    return { error: 'Email does not exit' };
  }

  // security check

  // If the user has not verified their email, send a verification email
  if(!existingUser.emailVerified){
    // Generate a verification token using the user's email
    const verificationToken = await generateVerificationToken(existingUser.email);
    // Send a verification email to the user's email
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    // Return a success message
    return { success: 'Confirmation email sent' };
  }
  // If the user has two-factor authentication enabled
  if(existingUser.isTwoFactorEnabled && existingUser.email) {
    // If the user has entered a code
    if(code) {
      // Get the two-factor token using the user's email
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      // If the two-factor token does not exist, return an error
      if(!twoFactorToken) {
        return { error: 'Invalid code' };
      }
      // If the two-factor token does not match the code enter by user, return an error
      if(twoFactorToken.token !== code){
        return { error: 'Invalid code' };
      }
      // Check if the two-factor token has expired
      const hasExpired = new Date() > new Date(twoFactorToken.expires);
      // If the two-factor token has expired, return an error
      if(hasExpired) {
        return { error: 'Code has expired' };
      }
      // Delete the two-factor token from the database
      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id }
      })
      // Get the two-factor confirmation by user ID
      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      // If the two-factor confirmation exists, delete it
      if(existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        })
      }
      // Create a new two-factor confirmation
      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id
        }
      })
      
    } else {
      // Generate a two-factor token using the user's email
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      // Send a two-factor token email to the user's email
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
      )
      // Return a success message
      return { twoFactor: true }
    }

  }



  try {
    // Sign in the user using their email and password
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT
    })

  } catch (error) {
    if(error instanceof AuthError){
      switch (error.type) {
        case "CredentialsSignin": 
          return { error: 'Invalid credentials' };
        default:
          return { error: 'Something went wrong' };
      }
    }

    throw error;
  }
}