import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  let transporter;

  // 1. Check if SMTP configuration exists in env
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // 2. Fall back to Ethereal SMTP for testing/development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  // 3. Define mail options
  const mailOptions = {
    from: process.env.FROM_EMAIL || '"VinoSphere Concierge" <noreply@vinosphere.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  // 4. Send the email
  const info = await transporter.sendMail(mailOptions);

  // If using Ethereal, print the preview URL
  if (!process.env.SMTP_HOST) {
    console.log(`\n✉️  Email sent successfully to ${options.to}`);
    console.log(`🔗  Ethereal Preview URL: ${nodemailer.getTestMessageUrl(info)}\n`);
  }

  return info;
}
