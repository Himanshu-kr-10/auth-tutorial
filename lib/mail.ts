import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendTwoFactorTokenEmail = async (
  email: string,
  token: string
) => {
  await resend.emails.send({
    from: "onboading@resend.dev",
    to: email,
    subject: "Your two-factor authentication token",
    html: `<p>Your two-factor authentication token is: <strong>${token}</strong></p>`
  })

}

export const sendPasswordResetEmail = async (
  email: string,
  token: string
) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

 await resend.emails.send({
  from: "onboarding@resend.dev",
  to: email,
  subject: "Reset your password",
  html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`
 })

}

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  // Create a link to the verification page
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;
  // Send the verification email
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Please confirm your email address",
    html: `
      <p>Hi there!</p>
      <p>Please confirm your email address by clicking on the link below:</p>
      <a href="${confirmLink}">Confirm email address</a>
    `
  })
}