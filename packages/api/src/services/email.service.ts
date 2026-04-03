import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASS || "pass",
  },
});

export const sendLimitAlertEmail = async (email: string, name: string, limit: number, totalSpend: number) => {
  const mailOptions = {
    from: '"Zorvyn Alerts" <alerts@zorvyn.dev>',
    to: email,
    subject: "Monthly Spending Limit Exceeded",
    html: `
      <h2>Hello ${name},</h2>
      <p>This is an automated alert from Zorvyn Finance.</p>
      <p>Your total expenses this month have reached <b>$${totalSpend.toFixed(2)}</b>, which exceeds your set threshold of <b>$${limit.toFixed(2)}</b>.</p>
      <p>Please review your dashboard to manage your expenses.</p>
      <br>
      <p>Best,<br>The Zorvyn Team</p>
    `,
  };

  try {
    // If SMTP is not defined, we log it to console to prevent crashing and simulate behavior
    if (!process.env.SMTP_HOST) {
      console.log(`[EMAIL SIMULATION] Sent limit alert to ${email} (Spent: ${totalSpend}, Limit: ${limit})`);
      return;
    }
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send email alert:", error);
  }
};
