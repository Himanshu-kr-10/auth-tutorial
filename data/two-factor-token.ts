import { db } from '@/lib/db'

export const getTwoFactorTokenByToken = async (token: string) => {
  try {
    const twoFactorToken = await db.twoFactorToken.findUnique({
      where: {
        token
      }
    })

    return twoFactorToken

  } catch {
    return null
  }
}
export const getTwoFactorTokenByEmail = async (email: string) => {
  try {
    // Find the two-factor token by email
    const twoFactorToken = await db.twoFactorToken.findFirst({
      where: {
        email
      }
    })
    // Return the two-factor token
    return twoFactorToken

  } catch {
    return null
  }
}