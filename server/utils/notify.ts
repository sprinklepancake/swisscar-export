// server/utils/notify.ts
//
// Outbound notifications to the site administrators.
//
// The platform had no way at all to tell an admin that something needed their
// attention — a new account could sit in the auction-approval queue for days
// because nobody knew it was there. This module is the single place that fixes
// that, and it is deliberately dependency-free: everything goes over plain
// HTTP, so no mail library has to be installed or bundled.
//
// CONFIGURATION (all optional — the app works with none of it set):
//
//   ADMIN_NOTIFICATION_EMAIL   Where to send admin mail. Comma-separated for
//                              several recipients.
//   RESEND_API_KEY             Resend (https://resend.com) API key. This is the
//                              transport; without it no email is sent.
//   MAIL_FROM                  Verified sender, e.g. "SwissCarExport
//                              <noreply@swisscarexport.ch>". Defaults to
//                              Resend's shared onboarding sender so a key alone
//                              is enough to start receiving mail.
//   ADMIN_NOTIFY_WEBHOOK_URL   Optional Slack/Discord/Zapier incoming webhook.
//                              Receives the same message as JSON.
//
// Nothing here may ever break the request that triggered it. A signup must
// succeed even if the mail provider is down, so every failure is caught and
// logged and the function still resolves.
import { getSupabaseAdmin } from '~/server/utils/supabase'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'SwissCarExport <onboarding@resend.dev>'

export interface AdminNotification {
  /** Subject line / webhook title. */
  subject: string
  /** Plain-text body. Rendered as-is in the email and the webhook payload. */
  body: string
  /** Machine-readable tag, stored on the activity log row. */
  type: string
  /** The user the notification is about, if any. */
  userId?: number | null
  /** Anything worth keeping for later; stored verbatim on the log row. */
  metadata?: Record<string, any>
}

const recipients = (): string[] =>
  String(process.env.ADMIN_NOTIFICATION_EMAIL || '')
    .split(',')
    .map(a => a.trim())
    .filter(Boolean)

const escapeHtml = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/** Wraps the plain-text body in a minimal, client-safe HTML email. */
const renderHtml = (subject: string, body: string) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:560px">
  <h2 style="margin:0 0 16px;font-size:18px;color:#991b1b">${escapeHtml(subject)}</h2>
  <div style="white-space:pre-wrap">${escapeHtml(body)}</div>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
  <p style="font-size:12px;color:#6b7280;margin:0">
    Sent automatically by swisscarexport.ch. Open the admin panel to act on this.
  </p>
</div>`.trim()

async function sendEmail(subject: string, body: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const to = recipients()

  if (!apiKey || !to.length) {
    // Not an error: an installation that has not configured mail yet still gets
    // the activity-log record below, so nothing is lost.
    console.warn(
      `[notify] email not sent (${!apiKey ? 'RESEND_API_KEY' : 'ADMIN_NOTIFICATION_EMAIL'} is not set): ${subject}`,
    )
    return false
  }

  try {
    await $fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: {
        from: process.env.MAIL_FROM || DEFAULT_FROM,
        to,
        subject,
        text: body,
        html: renderHtml(subject, body),
      },
    })
    return true
  } catch (error: any) {
    console.error('[notify] email failed:', error?.data || error?.message || error)
    return false
  }
}

async function sendWebhook(subject: string, body: string, meta: Record<string, any>) {
  const url = process.env.ADMIN_NOTIFY_WEBHOOK_URL
  if (!url) return

  try {
    await $fetch(url, {
      method: 'POST',
      // Slack reads `text`; Discord requires `content` and rejects a payload
      // without it with 400 "Cannot send an empty message" — so a Discord
      // webhook, which .env.example advertises as supported, silently never
      // delivered. Each service ignores the other's key, so send both, and keep
      // the raw fields for Zapier/n8n style consumers.
      body: {
        text: `*${subject}*\n${body}`,
        content: `**${subject}**\n${body}`,
        subject,
        body,
        ...meta,
      },
    })
  } catch (error: any) {
    console.error('[notify] webhook failed:', error?.message || error)
  }
}

/**
 * Tell the administrators about something.
 *
 * Always writes an activity_logs row (so the event survives a mail outage and
 * shows up in the admin panel), then tries email and the optional webhook.
 * Never throws.
 */
export async function notifyAdmin(n: AdminNotification): Promise<void> {
  const metadata = { ...(n.metadata || {}) }

  try {
    await getSupabaseAdmin().from('activity_logs').insert({
      // DELIBERATELY NULL. activity_logs is also the user's own "recent
      // activity" feed — /api/user/profile selects it with .eq('user_id', id)
      // and pages/profile.vue renders `description` verbatim. Filing an
      // admin-facing notification under the subject's id showed them internal
      // text and a link to the admin panel on their own profile page. The
      // subject travels in metadata instead, which nothing user-facing reads.
      user_id: null,
      type: n.type,
      action: n.subject.slice(0, 255),
      description: n.body,
      metadata: { ...metadata, subjectUserId: n.userId ?? null },
    } as any)
  } catch (error: any) {
    console.error('[notify] could not write activity log:', error?.message || error)
  }

  await Promise.all([
    sendEmail(n.subject, n.body),
    sendWebhook(n.subject, n.body, { type: n.type, userId: n.userId ?? null, ...metadata }),
  ])
}

/**
 * Fire-and-forget wrapper. Use this inside a request handler so the user is not
 * kept waiting on an external mail API — and so a hung provider cannot stall a
 * registration.
 */
export function notifyAdminInBackground(n: AdminNotification): void {
  notifyAdmin(n).catch(err => console.error('[notify] unhandled:', err?.message || err))
}
