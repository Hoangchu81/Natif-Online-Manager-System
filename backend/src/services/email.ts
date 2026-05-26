import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

dotenv.config();

// ─── Configuration ───────────────────────────────────────────────────────────
// Primary: Google Workspace SMTP (or Gmail with App Password)
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.SMTP_SECURE === 'true'; // true for 465, false for 587
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || ''; // App Password for Gmail
const SMTP_FROM = process.env.SMTP_FROM || process.env.EMAIL_FROM || 'noreply@natif.vn';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || process.env.EMAIL_FROM_NAME || 'NATIF OMS';

// Fallback: Resend API
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_FROM;
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || SMTP_FROM_NAME;

// ─── Transport selection ─────────────────────────────────────────────────────
type TransportMode = 'smtp' | 'resend' | 'none';

function getTransportMode(): TransportMode {
  if (SMTP_USER && SMTP_PASS) return 'smtp';
  if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_')) return 'resend';
  return 'none';
}

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed';
  transport: TransportMode;
}

interface EmailStatus {
  status: 'sent' | 'bounced' | 'complained' | 'delivered';
}

// ─── Resend API helper ───────────────────────────────────────────────────────
async function resendApi(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`https://api.resend.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend API error ${res.status}: ${error}`);
  }
  return res.json();
}

// ─── Email Service ───────────────────────────────────────────────────────────
export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private mode: TransportMode;

  private constructor() {
    this.mode = getTransportMode();
    if (this.mode === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        tls: { rejectUnauthorized: false },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10, // max 10 messages/second
      });
      console.log(`[EMAIL] SMTP transport configured: ${SMTP_HOST}:${SMTP_PORT} as ${SMTP_USER}`);
    } else if (this.mode === 'resend') {
      console.log('[EMAIL] Resend API transport configured');
    } else {
      console.warn('[EMAIL] No email transport configured. Set SMTP_USER+SMTP_PASS or RESEND_API_KEY.');
    }
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  isConfigured(): boolean {
    return this.mode !== 'none';
  }

  getMode(): TransportMode {
    return this.mode;
  }

  /** Verify SMTP connection (call on startup) */
  async verify(): Promise<boolean> {
    if (this.mode !== 'smtp' || !this.transporter) return this.mode === 'resend';
    try {
      await this.transporter.verify();
      console.log('[EMAIL] SMTP connection verified OK');
      return true;
    } catch (err) {
      console.error('[EMAIL] SMTP verification failed:', err);
      return false;
    }
  }

  /** Send single email */
  async send(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
    if (!this.isConfigured()) {
      console.warn('[EMAIL] Not configured — skipping send to', to, 'subject:', subject);
      return { messageId: 'mock-not-sent', status: 'failed', transport: 'none' };
    }

    const plainText = text || this.htmlToText(html);

    // Try SMTP first
    if (this.mode === 'smtp' && this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"${SMTP_FROM_NAME}" <${SMTP_FROM}>`,
          to,
          subject: `[NATIF] ${subject}`,
          html,
          text: plainText,
        });
        console.log('[EMAIL] SMTP sent to', to, 'messageId:', info.messageId);
        return { messageId: info.messageId, status: 'sent', transport: 'smtp' };
      } catch (err) {
        console.error('[EMAIL] SMTP send failed to', to, err);
        // Fallback to Resend if available
        if (RESEND_API_KEY && RESEND_API_KEY.startsWith('re_')) {
          console.log('[EMAIL] Falling back to Resend API...');
          return this.sendViaResend(to, subject, html, plainText);
        }
        return { messageId: 'smtp-failed', status: 'failed', transport: 'smtp' };
      }
    }

    // Resend path
    return this.sendViaResend(to, subject, html, plainText);
  }

  private async sendViaResend(to: string, subject: string, html: string, text: string): Promise<EmailResult> {
    try {
      const data = await resendApi('/emails', {
        method: 'POST',
        body: JSON.stringify({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
          to: [to],
          subject: `[NATIF] ${subject}`,
          html,
          text,
        }),
      });
      console.log('[EMAIL] Resend sent to', to, 'messageId:', data.id);
      return { messageId: data.id, status: 'sent', transport: 'resend' };
    } catch (err) {
      console.error('[EMAIL] Resend send failed to', to, err);
      return { messageId: 'resend-failed', status: 'failed', transport: 'resend' };
    }
  }

  /** Send batch email */
  async sendBatch(
    recipients: Array<{ email: string; name?: string }>,
    subject: string,
    html: string
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];
    for (const r of recipients) {
      // Rate limit: small delay between sends
      const result = await this.send(r.email, subject, html);
      results.push(result);
      if (recipients.length > 5) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    return results;
  }

  /** Get delivery status (Resend only) */
  async getDeliveryStatus(messageId: string): Promise<EmailStatus | null> {
    if (this.mode !== 'resend' || !RESEND_API_KEY) return null;
    try {
      const data = await resendApi(`/emails/${messageId}`) as { lastEvent: string };
      const statusMap: Record<string, EmailStatus['status']> = {
        'delivered': 'delivered',
        'bounced': 'bounced',
        'complained': 'complained',
        'sent': 'sent',
      };
      return { status: statusMap[data.lastEvent] || 'sent' };
    } catch {
      return null;
    }
  }

  /** Health check endpoint data */
  getHealthInfo(): { configured: boolean; mode: TransportMode; host?: string; user?: string } {
    return {
      configured: this.isConfigured(),
      mode: this.mode,
      host: this.mode === 'smtp' ? SMTP_HOST : undefined,
      user: this.mode === 'smtp' ? SMTP_USER : undefined,
    };
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .trim();
  }
}

export const emailService = EmailService.getInstance();
