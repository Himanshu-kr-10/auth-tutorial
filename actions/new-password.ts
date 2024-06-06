"use server"

import { getPasswordResetTokenByToken } from "@/data/password-reset-token"
import { getUserByEmail } from "@/data/user"
import { NewPasswordSchema } from "@/schemas"
import * as z from "zod"
import bcrypt from "bcrypt"
import { db } from "@/lib/db"

export const newPassword = async(
  values: z.infer<typeof NewPasswordSchema>,
  token?: string | null
) => {
  //check if the token is their in the field
  if(!token) {
    return { error: "Missing Token!"}
  }

  // validate the password fields that come from the form
  const validateFields = NewPasswordSchema.safeParse(values)
  
  if(!validateFields.success) {
    return { error: "Invalid fields!"}
  }
  //take that password out 
  const { password } = validateFields.data
  //now check the token which we get from user and the token which is send on the email is same
  const existingToken = await getPasswordResetTokenByToken(token)
  
  if(!existingToken) {
    return { error: "Invalid token!"}
  }
  //check if the token is expired
  const hasExpired = new Date() > new Date(existingToken.expires);

  if(hasExpired) {
    return { error: "Token has expired!"}
  }
  //check the email is their on the basis of token
  const existingUser = await getUserByEmail(existingToken.email)

  if(!existingUser) {
    return { error: "Email does not exists!"}
  }
  // now take the new password and hash it
  const hashedPassword = await bcrypt.hash(password, 10)
  // update the new password at the place of old one
  await db.user.update({
    where: { id: existingUser.id },
    data: {
      password: hashedPassword
    }
  })
  // delete the token for password resent from the db so that user have to give new token
  await db.passwordResetToken.delete({
    where: { id: existingToken.id }
  })

  return { success: "Password updated!"} 
  
}