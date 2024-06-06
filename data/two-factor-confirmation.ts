import { db } from '@/lib/db'

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
  try {
    // Find the two-factor confirmation by user ID
    const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({
      where: {
        userId
      }
    })
    // Return the two-factor confirmation
    return twoFactorConfirmation

  } catch {
    return null
  }
}