import * as nodemailer from 'nodemailer';
import { env } from '../../config/env';

export interface WineryApprovalEmailData {
  to: string;
  ownerName: string;
  wineryName: string;
  loginEmail: string;
  password?: string;
  loginUrl?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || (env as any).SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || (env as any).SMTP_PORT || '587');
    const user = process.env.SMTP_USER || (env as any).SMTP_USER;
    const pass = process.env.SMTP_PASS || (env as any).SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });
      console.log('✅ SMTP Email Transporter configured for:', host);
    } else {
      console.log('ℹ️ SMTP credentials not fully provided. Running EmailService in Resilient Simulated Mode.');
    }
  }

  /**
   * Dispatches the official approval notification and credentials to the winery owner
   */
  async sendWineryApprovalEmail(data: WineryApprovalEmailData): Promise<boolean> {
    const loginUrl = data.loginUrl || process.env.WINERY_DASHBOARD_URL || 'http://localhost:3001';
    const fromAddress = process.env.EMAIL_FROM || '"VinoSphere Platform" <admin@vinosphere.in>';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F9FB; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); border: 1px solid #ECECEC; }
          .header { background: #6D071A; padding: 36px 30px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { color: #E5C3C8; margin: 8px 0 0 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
          .content { padding: 36px 32px; color: #222222; }
          .badge { display: inline-block; padding: 6px 14px; background: #EBF7EE; color: #166534; font-size: 12px; font-weight: 700; border-radius: 999px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
          h2 { color: #1A1A1A; font-size: 20px; margin: 0 0 14px 0; }
          p { font-size: 14px; line-height: 1.6; color: #4B5563; margin: 0 0 18px 0; }
          .credentials-box { background: #F8F9FB; border: 1px solid #ECECEC; border-radius: 14px; padding: 22px; margin: 24px 0; }
          .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
          .cred-row:last-child { border-bottom: none; }
          .cred-label { font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase; }
          .cred-value { font-size: 13px; font-weight: 700; color: #111827; font-family: monospace; }
          .btn-container { text-align: center; margin: 32px 0 20px 0; }
          .btn { display: inline-block; padding: 14px 34px; background: #6D071A; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 14px; letter-spacing: 0.3px; }
          .footer { background: #FAF5F6; padding: 24px 30px; text-align: center; border-top: 1px solid #ECECEC; font-size: 11px; color: #9CA3AF; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>VinoSphere</h1>
            <p>Luxury Viticulture Platform</p>
          </div>
          <div class="content">
            <span class="badge">✓ Estate Verified & Approved</span>
            <h2>Welcome, ${data.ownerName}!</h2>
            <p>We are delighted to inform you that your winery estate, <strong>${data.wineryName}</strong>, has been officially verified and approved by the VinoSphere Superadmin.</p>
            <p>Your estate workspace is now active. You can manage your wine catalog, curate tasting experiences, track reservations, and publish vineyard events.</p>
            
            <div class="credentials-box">
              <div class="cred-row">
                <span class="cred-label">Estate Name:</span>
                <span class="cred-value">${data.wineryName}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Login Email:</span>
                <span class="cred-value">${data.loginEmail}</span>
              </div>
              ${data.password ? `
              <div class="cred-row">
                <span class="cred-label">Password:</span>
                <span class="cred-value">${data.password}</span>
              </div>
              ` : ''}
              <div class="cred-row">
                <span class="cred-label">Portal Access:</span>
                <span class="cred-value">${loginUrl}</span>
              </div>
            </div>

            <div class="btn-container">
              <a href="${loginUrl}" class="btn" target="_blank">Access Your Winery Dashboard →</a>
            </div>

            <p style="font-size: 12px; color: #6B7280; margin-top: 24px;">
              For security, you can update your password and estate credentials at any time in the <em>My Winery &rarr; Settings</em> tab of your dashboard.
            </p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} VinoSphere Platform. All rights reserved. Nashik Valley Viticulture Network.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
VinoSphere Platform - Estate Verified & Approved

Dear ${data.ownerName},

Congratulations! Your winery estate, "${data.wineryName}", has been verified and approved by the VinoSphere Superadmin.

Your credentials to access your dedicated winery workspace:
- Estate: ${data.wineryName}
- Login Email: ${data.loginEmail}
${data.password ? `- Password: ${data.password}\n` : ''}- Portal URL: ${loginUrl}

Log in now to manage your wines, tasting experiences, and events:
${loginUrl}

Best regards,
VinoSphere Platform Superadmin Team
    `;

    try {
      if (this.transporter) {
        const info = await this.transporter.sendMail({
          from: fromAddress,
          to: data.to,
          subject: `Approved: Welcome ${data.wineryName} to VinoSphere Platform`,
          text: textContent,
          html: htmlContent
        });
        console.log('📧 Approval email successfully dispatched to:', data.to, 'MessageId:', info.messageId);
        return true;
      } else {
        // Dev fallback: output simulated dispatch
        console.log('================================================================');
        console.log('📨 [DEV EMAIL DISPATCH] TO:', data.to);
        console.log('📌 SUBJECT: Approved: Welcome ' + data.wineryName + ' to VinoSphere Platform');
        console.log('🔑 LOGIN EMAIL:', data.loginEmail);
        if (data.password) console.log('🔒 PASSWORD:', data.password);
        console.log('🌐 LOGIN URL:', loginUrl);
        console.log('================================================================');
        return true;
      }
    } catch (err: any) {
      console.error('⚠️ Failed to send approval email via SMTP, logged locally:', err.message);
      return false;
    }
  }
}

export const emailService = new EmailService();
