import type { Pool } from 'pg';
import { emailService } from './email.js';

export type NotificationType =
  | 'application.submitted'
  | 'application.received'
  | 'application.director_review'
  | 'application.dept_assigned'
  | 'application.preliminary_review'
  | 'application.approved'
  | 'application.rejected_final'
  | 'expert.assigned'
  | 'expert.accepted'
  | 'expert.declined'
  | 'review.completed'
  | 'action.council'
  | 'action.survey'
  | 'action.supplementary'
  | 'action.rejected'
  | 'council.created'
  | 'council.meeting_scheduled'
  | 'council.recommendation'
  | 'contract.reminder'
  | 'contract.signed'
  | 'disbursement.made'
  | 'disbursement.reminder'
  | 'reporting.overdue'
  | 'project.completed'
  | 'password.changed'
  | 'password.reset'
  | 'email.verified';

export type NotificationPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface NotificationRecipient {
  id?: string;
  email: string;
  name: string;
  role?: string;
}

export interface NotificationPayload {
  type: NotificationType;
  recipients: NotificationRecipient[];
  subject: string;
  body: string;
  data: Record<string, unknown>;
  priority: NotificationPriority;
  templateCode?: string;
}

interface DbEmailTemplate {
  id: string;
  code: string;
  subject_template: string;
  body_template: string;
  variables: string[];
}

const APP_URL = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'https://oms.natif.vn';

export class NotificationService {
  private static instance: NotificationService;
  private pool!: Pool;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  setPool(pool: Pool) {
    this.pool = pool;
  }

  renderTemplate(templateCode: string, variables: Record<string, string>): { subject: string; body: string } {
    let subject = templateCode;
    let body = templateCode;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      const safeValue = this.escapeHtml(value);
      subject = subject.replace(regex, value);
      body = body.replace(regex, safeValue);
    }
    return { subject, body };
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async send(payload: NotificationPayload): Promise<void> {
    const { type, recipients, subject, body, data, priority, templateCode } = payload;

    // 1. Save in-app notifications for each user recipient
    for (const recipient of recipients) {
      if (!recipient.id) continue;
      try {
        await this.pool.query(
          `INSERT INTO notifications (user_id, type, title, body, data)
           VALUES ($1, $2, $3, $4, $5)`,
          [recipient.id, type, subject, body, JSON.stringify(data)]
        );
      } catch (err) {
        console.error('[NOTIFICATION] Failed to save in-app notification', err);
      }
    }

    // 2. Send emails for each recipient
    for (const recipient of recipients) {
      const html = this.wrapHtmlEmail(subject, body);
      const logId = await this.logEmail(recipient, subject, body, html, templateCode || type);

      try {
        const result = await emailService.send(recipient.email, subject, html);
        await this.updateEmailLog(logId, result.messageId, 'sent');
        // Mark in-app notification as email sent
        if (recipient.id) {
          await this.pool.query(
            `UPDATE notifications SET is_email_sent = true, email_sent_at = NOW()
             WHERE id = (
               SELECT id FROM notifications
               WHERE user_id = $1 AND type = $2 AND is_email_sent = false
               ORDER BY created_at DESC LIMIT 1
             )`,
            [recipient.id, type]
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await this.updateEmailLog(logId, '', 'failed', msg);
      }
    }
  }

  async sendInApp(userId: string, notification: {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO notifications (user_id, type, title, body, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, notification.type, notification.title, notification.body, JSON.stringify(notification.data || {})]
      );
    } catch (err) {
      console.error('[NOTIFICATION] Failed to send in-app', err);
    }
  }

  async sendBatch(
    templateCode: string,
    recipients: Array<{ id?: string; email: string; name: string }>,
    baseVariables: Record<string, string>
  ): Promise<void> {
    const template = await this.getTemplate(templateCode);
    if (!template) {
      console.warn('[NOTIFICATION] Template not found:', templateCode);
      return;
    }

    for (const recipient of recipients) {
      const variables = { ...baseVariables, recipient_name: recipient.name };
      const { subject, body } = this.renderTemplate(template.subject_template, variables);
      const { body: htmlBody } = this.renderTemplate(template.body_template, variables);

      // In-app
      if (recipient.id) {
        await this.sendInApp(recipient.id, {
          type: templateCode as NotificationType,
          title: subject,
          body: htmlBody,
          data: baseVariables,
        });
      }

      // Email
      const logId = await this.logEmail(recipient, subject, htmlBody, htmlBody, templateCode);
      try {
        const result = await emailService.send(recipient.email, subject, htmlBody);
        await this.updateEmailLog(logId, result.messageId, 'sent');
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        await this.updateEmailLog(logId, '', 'failed', msg);
      }
    }
  }

  async scheduleReminder(
    notificationType: string,
    applicationId: string,
    userId: string,
    scheduledAt: Date,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO scheduled_reminders (notification_type, application_id, user_id, scheduled_at, data)
         VALUES ($1, $2, $3, $4, $5)`,
        [notificationType, applicationId, userId, scheduledAt, JSON.stringify(data)]
      );
    } catch (err) {
      console.error('[NOTIFICATION] Failed to schedule reminder', err);
    }
  }

  private async getTemplate(code: string): Promise<DbEmailTemplate | null> {
    try {
      const result = await this.pool.query<DbEmailTemplate>(
        `SELECT id, code, subject_template, body_template, variables
         FROM email_templates WHERE code = $1 AND is_active = true`,
        [code]
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }

  private async logEmail(
    recipient: NotificationRecipient,
    subject: string,
    bodyText: string,
    bodyHtml: string,
    templateCode?: string
  ): Promise<string> {
    try {
      const result = await this.pool.query<{ id: string }>(
        `INSERT INTO email_logs (recipient_email, recipient_name, subject, body_text, body_html, template_code, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'queued')
         RETURNING id`,
        [recipient.email, recipient.name, subject, bodyText, bodyHtml, templateCode || null]
      );
      return result.rows[0].id;
    } catch (err) {
      console.error('[NOTIFICATION] Failed to log email', err);
      return '';
    }
  }

  private async updateEmailLog(
    logId: string,
    messageId: string,
    status: 'sent' | 'failed' | 'skipped',
    error?: string
  ): Promise<void> {
    if (!logId) return;
    try {
      await this.pool.query(
        `UPDATE email_logs SET
           status = $1, resend_message_id = $2, error_message = $3,
           sent_at = CASE WHEN $1 = 'sent' THEN NOW() ELSE sent_at END
         WHERE id = $4`,
        [status, messageId, error || null, logId]
      );
    } catch (err) {
      console.error('[NOTIFICATION] Failed to update email log', err);
    }
  }

  private wrapHtmlEmail(title: string, body: string): string {
    const escapedBody = this.escapeHtml(body).replace(/\n/g, '<br>');
    return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f3892;">
  <div style="background: #1f3892; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24px;">Quỹ Đổi mới công nghệ quốc gia</h1>
  </div>
  <div style="padding: 30px; background: #f9fafb;">
    ${escapedBody}
  </div>
  <div style="padding: 15px; background: #1f3892; color: white; text-align: center; font-size: 12px;">
    <p style="margin: 0;">Ban Quản lý Quỹ Đổi mới công nghệ quốc gia (NATIF) | natif.gov.vn</p>
  </div>
</div>`;
  }

  // === Helper: Application Workflow Notifications ===

  async notifyApplicationSubmitted(
    pool: Pool,
    application: {
      id: string; title: string; company_name: string; tax_code: string;
      contact_name: string; contact_email: string; contact_phone: string;
      program_type: string; budget_requested: number; submitted_at: Date;
      user_id: string;
    }
  ): Promise<void> {
    const shortId = application.id.slice(0, 8).toUpperCase();
    const vars = {
      contact_name: application.contact_name,
      title: application.title,
      company_name: application.company_name,
      tax_code: application.tax_code,
      program_type_display: this.programTypeDisplay(application.program_type),
      budget_requested_formatted: Number(application.budget_requested).toLocaleString('vi-VN'),
      submitted_at: new Date(application.submitted_at).toLocaleDateString('vi-VN'),
      application_id_short: shortId,
      app_url: APP_URL,
    };

    // To Enterprise
    await this.sendBatch('application.submitted.enterprise', [{
      id: application.user_id,
      email: application.contact_email,
      name: application.contact_name,
    }], vars);

    // To Clerks
    const clerks = await pool.query<{ id: string; email: string; full_name: string }>(
      `SELECT id, email, full_name FROM users WHERE role = 'clerk' AND is_active = true AND deleted_at IS NULL`
    );
    for (const clerk of clerks.rows) {
      await this.sendBatch('application.submitted.clerk', [{
        id: clerk.id,
        email: clerk.email,
        name: clerk.full_name,
      }], {
        ...vars,
        clerk_name: clerk.full_name,
      });
    }
  }

  async notifyWorkflowTransition(
    pool: Pool,
    application: {
      id: string; title: string; company_name: string;
      contact_email: string; contact_name: string;
      status: string; scenario?: string;
      proposal_notes?: string; director_decision_notes?: string;
      supplementary_deadline?: Date;
    },
    toStatus: string,
    actors: {
      enterpriseId: string; deptHeadId?: string; deptHeadEmail?: string; deptHeadName?: string;
      directorId?: string; officerId?: string; officerEmail?: string;
    }
  ): Promise<void> {
    const vars = {
      contact_name: application.contact_name,
      title: application.title,
      company_name: application.company_name,
      app_url: APP_URL,
      proposal_notes: application.proposal_notes || '',
      director_decision_notes: application.director_decision_notes || '',
      supplementary_deadline: application.supplementary_deadline
        ? new Date(application.supplementary_deadline).toLocaleDateString('vi-VN')
        : '',
    };

    switch (toStatus) {
      case 'received': {
        // To Enterprise
        await this.send({
          type: 'application.received',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ đã được tiếp nhận - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nHồ sơ "${application.title}" của Quý Doanh nghiệp đã được tiếp nhận và đang chuyển lên Giám đốc xem xét.\n\nThời gian xét duyệt: không quá 60 ngày làm việc theo Nghị định 268/2025/NĐ-CP.`,
          data: { applicationId: application.id },
          priority: 'HIGH',
        });

        // To Director
        if (actors.directorId) {
          const directors = await pool.query<{ id: string; email: string; full_name: string }>(
            `SELECT id, email, full_name FROM users WHERE role = 'director' AND is_active = true AND deleted_at IS NULL`
          );
          for (const d of directors.rows) {
            await this.send({
              type: 'application.director_review',
              recipients: [{ id: d.id, email: d.email, name: d.full_name }],
              subject: `[NATIF] Hồ sơ mới cần xem xét - ${application.title}`,
              body: `Kính gửi ${d.full_name},\n\nCó hồ sơ mới "${application.title}" từ ${application.company_name} cần được xem xét và phân bổ.`,
              data: { applicationId: application.id },
              priority: 'HIGH',
            });
          }
        }
        break;
      }

      case 'dept_assigned': {
        if (actors.deptHeadId) {
          await this.send({
            type: 'application.dept_assigned',
            recipients: [{
              id: actors.deptHeadId,
              email: actors.deptHeadEmail || '',
              name: actors.deptHeadName || '',
            }],
            subject: `[NATIF] Bạn được gán hồ sơ cần thẩm định - ${application.title}`,
            body: `Kính gửi ${actors.deptHeadName},\n\nBạn được gán hồ sơ "${application.title}" của ${application.company_name} để thẩm định sơ bộ.`,
            data: { applicationId: application.id },
            priority: 'HIGH',
          });
        }
        // To Enterprise
        await this.send({
          type: 'application.dept_assigned',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ được phân bổ thẩm định - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nHồ sơ "${application.title}" của Quý Doanh nghiệp đã được phân bổ để thẩm định sơ bộ.`,
          data: { applicationId: application.id },
          priority: 'HIGH',
        });
        break;
      }

      case 'supplementary_requested': {
        await this.send({
          type: 'action.supplementary',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ cần bổ sung tài liệu - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nHồ sơ "${application.title}" cần được bổ sung tài liệu.\n\nNội dung: ${application.proposal_notes || ''}\n\nThời hạn: ${vars.supplementary_deadline || 'không xác định'}`,
          data: { applicationId: application.id, scenario: 'supplementary' },
          priority: 'HIGH',
        });
        break;
      }

      case 'survey_conducted': {
        await this.send({
          type: 'action.survey',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ cần khảo sát thực tế - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nHồ sơ "${application.title}" của Quý Doanh nghiệp cần được khảo sát thực tế. Đại diện NATIF sẽ liên hệ để sắp xếp lịch.`,
          data: { applicationId: application.id, scenario: 'survey' },
          priority: 'HIGH',
        });
        break;
      }

      case 'rejected': {
        await this.send({
          type: 'action.rejected',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ không được phê duyệt - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nRất tiếm, hồ sơ "${application.title}" không được phê duyệt.\n\nLý do: ${application.proposal_notes || 'Không có'}`,
          data: { applicationId: application.id, scenario: 'reject' },
          priority: 'HIGH',
        });
        break;
      }

      case 'approved': {
        await this.send({
          type: 'application.approved',
          recipients: [{ id: actors.enterpriseId, email: application.contact_email, name: application.contact_name }],
          subject: `[NATIF] Hồ sơ được phê duyệt - ${application.title}`,
          body: `Kính gửi ${application.contact_name},\n\nHồ sơ "${application.title}" đã được PHÊ DUYỆT!\n\nQuyết định: ${application.director_decision_notes || ''}\n\nChúng tôi sẽ liên hệ để hướng dẫn các bước tiếp theo (ký hợp đồng, giải ngân).`,
          data: { applicationId: application.id },
          priority: 'CRITICAL',
        });
        break;
      }
    }
  }

  async notifyExpertAssigned(
    pool: Pool,
    expert: { id: string; email: string; full_name: string },
    application: {
      id: string; title: string; company_name: string;
      program_type: string; budget_requested: number;
      deadline?: string;
    }
  ): Promise<void> {
    await this.send({
      type: 'expert.assigned',
      recipients: [{ id: expert.id, email: expert.email, name: expert.full_name }],
      subject: `[NATIF] Mời đánh giá hồ sơ - ${application.title}`,
      body: `Kính gửi ${expert.full_name},\n\nBạn được mời tham gia đánh giá hồ sơ sau:\n\n• Dự án: ${application.title}\n• Doanh nghiệp: ${application.company_name}\n• Chương trình: ${this.programTypeDisplay(application.program_type)}\n• Ngân sách: ${Number(application.budget_requested).toLocaleString('vi-VN')} VND\n${application.deadline ? `• Thời hạn: ${application.deadline}` : ''}\n\nVui lòng đăng nhập để xem chi tiết và đánh giá.`,
      data: { applicationId: application.id, expertId: expert.id },
      priority: 'HIGH',
    });
  }

  async notifyReviewCompleted(
    pool: Pool,
    review: {
      expert_id: string; expert_name: string;
      application_id: string; title: string; company_name: string;
      overall_score: number; recommendation: string;
      strengths?: string; weaknesses?: string; comments?: string;
      score_innovation?: number; score_feasibility?: number;
      score_impact?: number; score_budget?: number; score_team?: number;
    },
    recipients: Array<{ id: string; email: string; full_name: string; role: string }>
  ): Promise<void> {
    const recDisplay = this.recommendationDisplay(review.recommendation);
    for (const r of recipients) {
      await this.send({
        type: 'review.completed',
        recipients: [{ id: r.id, email: r.email, name: r.full_name }],
        subject: `[NATIF] Đánh giá chuyên gia hoàn thành - ${review.title}`,
        body: `Kính gửi ${r.full_name},\n\nChuyên gia ${review.expert_name} đã hoàn thành đánh giá hồ sơ "${review.title}":\n\n• Điểm tổng: ${review.overall_score}/10\n• Khuyến nghị: ${recDisplay}\n• Điểm mạnh: ${review.strengths || '—'}\n• Điểm yếu: ${review.weaknesses || '—'}\n• Nhận xét: ${review.comments || '—'}`,
        data: { applicationId: review.application_id, expertId: review.expert_id },
        priority: 'HIGH',
      });
    }
  }

  private programTypeDisplay(type: string): string {
    const map: Record<string, string> = {
      interest_subsidy: 'Hỗ trợ lãi suất',
      sponsorship: 'Tài trợ',
      voucher: 'Voucher',
      ecosystem: 'Hệ sinh thái',
    };
    return map[type] || type;
  }

  private recommendationDisplay(rec: string): string {
    const map: Record<string, string> = {
      approve: 'Đề xuất phê duyệt',
      reject: 'Đề xuất từ chối',
      revise: 'Đề xuất sửa đổi',
    };
    return map[rec] || rec;
  }
}

export const notificationService = NotificationService.getInstance();
