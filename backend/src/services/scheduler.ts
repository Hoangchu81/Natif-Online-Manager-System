import type { Pool } from 'pg';
import { notificationService } from './notification.js';

const APP_URL = process.env.FRONTEND_URL?.replace(/\/$/, '') || 'https://oms.natif.vn';

export class SchedulerService {
  private static instance: SchedulerService;
  private pool!: Pool;
  private intervalId?: ReturnType<typeof setInterval>;
  private isRunning = false;

  private constructor() {}

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  setPool(pool: Pool) {
    this.pool = pool;
  }

  start(intervalMs = 60 * 60 * 1000): void { // Default: every hour
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.runScheduledJobs(), intervalMs);
    console.log('[SCHEDULER] Started with interval:', intervalMs / 1000 / 60, 'minutes');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('[SCHEDULER] Stopped');
    }
  }

  async runScheduledJobs(): Promise<void> {
    console.log('[SCHEDULER] Running scheduled jobs at', new Date().toISOString());
    await Promise.allSettled([
      this.processPendingReminders(),
      this.processContractReminders(),
      this.processReportReminders(),
      this.processOverdueReports(),
      this.cleanupOldNotifications(),
      this.cleanupOldEmailLogs(),
      this.cleanupOldAuditLogs(),
    ]);
  }

  async processPendingReminders(): Promise<void> {
    try {
      const result = await this.pool.query<{
        id: string; notification_type: string; application_id: string;
        user_id: string; data: Record<string, unknown>;
      }>(
        `SELECT id, notification_type, application_id, user_id, data
         FROM scheduled_reminders
         WHERE is_sent = false AND scheduled_at <= NOW()`
      );

      for (const reminder of result.rows) {
        try {
          const user = await this.pool.query<{ email: string; full_name: string; contact_name?: string }>(
            `SELECT email, full_name, COALESCE(full_name, email) as contact_name
             FROM users WHERE id = $1 AND is_active = true`,
            [reminder.user_id]
          );

          const app = await this.pool.query<{ title: string; contact_name: string; contact_email: string }>(
            `SELECT title, contact_name, contact_email FROM applications WHERE id = $1`,
            [reminder.application_id]
          );

          if (user.rows[0] && app.rows[0]) {
            const contactName = app.rows[0].contact_name || user.rows[0].full_name;
            const u = user.rows[0];

            await notificationService.send({
              type: reminder.notification_type as Parameters<typeof notificationService.send>[0]['type'],
              recipients: [{ id: reminder.user_id, email: u.email, name: u.full_name }],
              subject: `[NATIF] Nhắc nhở - ${app.rows[0].title}`,
              body: `Kính gửi ${contactName},\n\nBạn có nhắc nhở từ hệ thống NATIF cho dự án "${app.rows[0].title}".`,
              data: { applicationId: reminder.application_id, ...(reminder.data as Record<string, unknown>) },
              priority: 'MEDIUM',
            });
          }

          await this.pool.query(
            `UPDATE scheduled_reminders SET is_sent = true, sent_at = NOW() WHERE id = $1`,
            [reminder.id]
          );
        } catch (err) {
          console.error('[SCHEDULER] Failed to process reminder', reminder.id, err);
        }
      }
    } catch (err) {
      console.error('[SCHEDULER] processPendingReminders error', err);
    }
  }

  async processContractReminders(): Promise<void> {
    try {
      const result = await this.pool.query<{
        id: string; application_id: string; contract_deadline: Date;
        contact_email: string; contact_name: string; title: string; user_id: string;
      }>(
        `SELECT c.id, c.application_id, c.contract_deadline,
                a.contact_email, a.contact_name, a.title, a.user_id
         FROM contracts c
         JOIN applications a ON a.id = c.application_id
         WHERE c.status = 'pending'
           AND c.contract_deadline BETWEEN NOW() AND NOW() + INTERVAL '7 days'
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.type = 'contract.reminder'
               AND n.data->>'contractId' = c.id::text
               AND n.created_at > NOW() - INTERVAL '24 hours'
           )`
      );

      for (const contract of result.rows) {
        const daysLeft = Math.ceil((new Date(contract.contract_deadline).getTime() - Date.now()) / 86400000);
        await notificationService.send({
          type: 'contract.reminder',
          recipients: [{
            id: contract.user_id,
            email: contract.contact_email,
            name: contract.contact_name,
          }],
          subject: `[NATIF] Nhắc ký hợp đồng - ${contract.title}`,
          body: `Kính gửi ${contract.contact_name},\n\nHồ sơ "${contract.title}" đã được phê duyệt. Vui lòng ký hợp đồng trước ngày ${new Date(contract.contract_deadline).toLocaleDateString('vi-VN')} (còn ${daysLeft} ngày).\n\nQuá thời hạn, hồ sơ sẽ bị hủy.`,
          data: { applicationId: contract.application_id, contractId: contract.id },
          priority: 'HIGH',
        });
      }
    } catch (err) {
      console.error('[SCHEDULER] processContractReminders error', err);
    }
  }

  async processReportReminders(): Promise<void> {
    try {
      const result = await this.pool.query<{
        id: string; application_id: string; report_type: string;
        due_date: Date; contact_email: string; contact_name: string; title: string; user_id: string;
      }>(
        `SELECT r.id, r.application_id, r.report_type, r.due_date,
                a.contact_email, a.contact_name, a.title, a.user_id
         FROM project_reports r
         JOIN applications a ON a.id = r.application_id
         WHERE r.status = 'pending'
           AND r.due_date BETWEEN NOW() AND NOW() + INTERVAL '14 days'
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.type = 'disbursement.reminder'
               AND n.data->>'reportId' = r.id::text
               AND n.created_at > NOW() - INTERVAL '24 hours'
           )`
      );

      for (const report of result.rows) {
        await notificationService.send({
          type: 'disbursement.reminder',
          recipients: [{
            id: report.user_id,
            email: report.contact_email,
            name: report.contact_name,
          }],
          subject: `[NATIF] Nhắc báo cáo tiến độ - ${report.title}`,
          body: `Kính gửi ${report.contact_name},\n\nBáo cáo tiến độ dự án "${report.title}" sắp đến hạn nộp.\n\n• Loại báo cáo: ${report.report_type}\n• Hạn nộp: ${new Date(report.due_date).toLocaleDateString('vi-VN')}`,
          data: { applicationId: report.application_id, reportId: report.id },
          priority: 'MEDIUM',
        });
      }
    } catch (err) {
      console.error('[SCHEDULER] processReportReminders error', err);
    }
  }

  async processOverdueReports(): Promise<void> {
    try {
      const result = await this.pool.query<{
        id: string; application_id: string; report_type: string;
        due_date: Date; days_overdue: number; user_id: string;
        contact_email: string; contact_name: string; title: string;
      }>(
        `SELECT r.id, r.application_id, r.report_type, r.due_date,
                a.contact_email, a.contact_name, a.title, a.user_id,
                EXTRACT(DAY FROM NOW() - r.due_date)::int as days_overdue
         FROM project_reports r
         JOIN applications a ON a.id = r.application_id
         WHERE r.status = 'pending'
           AND r.due_date < NOW()
           AND NOT EXISTS (
             SELECT 1 FROM notifications n
             WHERE n.type = 'reporting.overdue'
               AND n.data->>'reportId' = r.id::text
               AND n.created_at > NOW() - INTERVAL '7 days'
           )`
      );

      for (const report of result.rows) {
        await notificationService.send({
          type: 'reporting.overdue',
          recipients: [{
            id: report.user_id,
            email: report.contact_email,
            name: report.contact_name,
          }],
          subject: `[NATIF] Báo cáo quá hạn - ${report.title}`,
          body: `Kính gửi ${report.contact_name},\n\nBáo cáo tiến độ dự án "${report.title}" đã quá hạn.\n\n• Số ngày quá hạn: ${report.days_overdue}\n• Hạn nộp: ${new Date(report.due_date).toLocaleDateString('vi-VN')}\n\nVui lòng nộp ngay để tránh ảnh hưởng đến các đợt giải ngân tiếp theo.`,
          data: { applicationId: report.application_id, reportId: report.id },
          priority: 'HIGH',
        });
      }
    } catch (err) {
      console.error('[SCHEDULER] processOverdueReports error', err);
    }
  }

  async cleanupOldNotifications(): Promise<void> {
    try {
      const result = await this.pool.query(
        `DELETE FROM notifications
         WHERE is_read = true AND created_at < NOW() - INTERVAL '30 days'`
      );
      if (result.rowCount && result.rowCount > 0) {
        console.log(`[SCHEDULER] Cleaned up ${result.rowCount} old notifications`);
      }
    } catch (err) {
      console.error('[SCHEDULER] cleanupOldNotifications error', err);
    }
  }

  async cleanupOldEmailLogs(): Promise<void> {
    try {
      const redactResult = await this.pool.query(
        `UPDATE email_logs
         SET body_text = NULL, body_html = NULL, error_message = NULL
         WHERE created_at < NOW() - INTERVAL '30 days'
           AND (body_text IS NOT NULL OR body_html IS NOT NULL OR error_message IS NOT NULL)`
      );
      const deleteResult = await this.pool.query(
        `DELETE FROM email_logs
         WHERE created_at < NOW() - INTERVAL '180 days'`
      );
      if ((redactResult.rowCount || 0) > 0 || (deleteResult.rowCount || 0) > 0) {
        console.log(`[SCHEDULER] Email logs redacted=${redactResult.rowCount || 0}, deleted=${deleteResult.rowCount || 0}`);
      }
    } catch (err) {
      console.error('[SCHEDULER] cleanupOldEmailLogs error', err);
    }
  }

  async cleanupOldAuditLogs(): Promise<void> {
    try {
      const result = await this.pool.query(
        `DELETE FROM application_audit_logs
         WHERE id IN (
           SELECT id FROM application_audit_logs
           WHERE created_at < NOW() - INTERVAL '365 days'
           ORDER BY created_at
           LIMIT 1000
         )`
      );
      if (result.rowCount && result.rowCount > 0) {
        console.log(`[SCHEDULER] Cleaned up ${result.rowCount} old audit logs`);
      }
    } catch (err) {
      console.error('[SCHEDULER] cleanupOldAuditLogs error', err);
    }
  }
}

export const schedulerService = SchedulerService.getInstance();
