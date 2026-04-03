import nodemailer from 'nodemailer'

export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
}

export const sendLimitAlertEmail = async (
  email: string,
  name: string,
  limit: number,
  totalSpend: number,
  smtp: SmtpConfig
) => {
  if (!smtp.host || !smtp.user || !smtp.pass) {
    console.log(`[EMAIL SIMULATION] Limit alert for ${email} — spent $${totalSpend.toFixed(2)}, limit $${limit.toFixed(2)}`)
    return
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port || 587,
    auth: { user: smtp.user, pass: smtp.pass },
  })

  try {
    await transporter.sendMail({
      from: `"Zorvyn Alerts" <${smtp.user}>`,
      to: email,
      subject: 'Monthly Spending Limit Exceeded',
      html: `
        <h2>Hello ${name},</h2>
        <p>This is an automated alert from Zorvyn Finance.</p>
        <p>Your total expenses this month have reached <b>$${totalSpend.toFixed(2)}</b>,
        which exceeds your set threshold of <b>$${limit.toFixed(2)}</b>.</p>
        <p>Please review your dashboard to manage your expenses.</p>
        <br>
        <p>Best,<br>The Zorvyn Team</p>
      `,
    })
  } catch (error) {
    console.error('[email] Failed to send alert:', error)
  }
}
