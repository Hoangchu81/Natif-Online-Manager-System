import dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@natif.vn';
const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'NATIF OMS';

interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed';
}

interface EmailStatus {
  status: 'sent' | 'bounced' | 'complained' | 'delivered';
}

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

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  isConfigured(): boolean {
    return Boolean(RESEND_API_KEY && RESEND_API_KEY.startsWith('re_'));
  }

  async send(to: string, subject: string, html: string, text?: string): Promise<EmailResult> {
    if (!this.isConfigured()) {
      console.warn('[EMAIL] Not configured — skipping send to', to, 'subject:', subject);
      return { messageId: 'mock-not-sent', status: 'failed' };
    }

    try {
      const data = await resendApi('/emails', {
        method: 'POST',
        body: JSON.stringify({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
          to: [to],
          subject,
          html,
          text: text || this.htmlToText(html),
        }),
      });
      console.log('[EMAIL] Sent to', to, 'messageId:', data.id);
      return { messageId: data.id, status: 'sent' };
    } catch (err) {
      console.error('[EMAIL] Failed to send to', to, err);
      throw err;
    }
  }

  async sendBatch(
    recipients: Array<{ email: string; name?: string }>,
    subject: string,
    html: string
  ): Promise<EmailResult> {
    if (!this.isConfigured()) {
      console.warn('[EMAIL] Not configured — skipping batch send to', recipients.length, 'recipients');
      return { messageId: 'mock-batch-not-sent', status: 'failed' };
    }

    try {
      const data = await resendApi('/emails', {
        method: 'POST',
        body: JSON.stringify({
          from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
          to: recipients.map(r => r.email),
          subject,
          html,
        }),
      });
      return { messageId: data.id, status: 'sent' };
    } catch (err) {
      console.error('[EMAIL] Batch send failed', err);
      throw err;
    }
  }

  async getDeliveryStatus(messageId: string): Promise<EmailStatus | null> {
    if (!this.isConfigured()) return null;
    try {
      const data = await resendApi(`/emails/${messageId}`) as { lastEvent: string };
      const statusMap: Record<string, EmailStatus['status']> = {
        'delivered': 'delivered',
        'bounced': 'bounced',
        'complained': 'complained',
        'sent': 'sent',
      };
      return {
        status: statusMap[data.lastEvent] || 'sent',
      };
    } catch {
      return null;
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
}

export const emailService = EmailService.getInstance();
