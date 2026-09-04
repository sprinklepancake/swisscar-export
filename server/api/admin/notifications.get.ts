// server/api/admin/notifications.get.ts
//
// The admin-facing notification feed.
//
// notifyAdmin() writes an activity_logs row for every event AND tries to email
// it. The email needs RESEND_API_KEY, which an installation may never set — and
// on a site with no configured mail transport the "tell the admin about new
// signups" requirement would silently do nothing. This endpoint makes the same
// events visible inside the admin panel with no configuration at all, so email
// becomes an enhancement rather than a dependency.
import { getSupabaseAdmin } from '~/server/utils/supabase'
import { requireAdmin } from '~/server/utils/auth'

// The event types notifyAdmin() emits. Ordinary per-user activity (bids, logins)
// is deliberately excluded — this is a work queue, not an audit log.
const NOTIFICATION_TYPES = ['user_registered', 'auction_access_requested', 'id_document_uploaded']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const limit = Math.min(parseInt(String(getQuery(event).limit || '30'), 10) || 30, 100)
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('activity_logs')
    .select('id, user_id, type, action, description, metadata, created_at')
    .in('type', NOTIFICATION_TYPES)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[admin/notifications]', error.message)
    return { success: false, notifications: [], unseenCount: 0 }
  }

  const rows = data || []

  // One extra query rather than a join: activity_logs.user_id has no FK-based
  // embed configured, and a missing relationship makes PostgREST fail the whole
  // select rather than return the rows without it.
  // notifyAdmin() files these with user_id = NULL so they never surface in the
  // subject's own profile feed; the subject id travels in metadata.
  const subjectId = (r: any) => (r.metadata && r.metadata.subjectUserId) || r.user_id || null
  const userIds = [...new Set(rows.map(subjectId).filter(Boolean))]
  const usersById = new Map<number, any>()
  if (userIds.length) {
    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role, verified_buyer, banned, id_document_url')
      .in('id', userIds)
    for (const u of users || []) usersById.set(u.id as number, u)
  }

  const notifications = rows.map((r: any) => {
    const uid = subjectId(r)
    const u = usersById.get(uid)
    return {
      id: r.id,
      type: r.type,
      title: r.action,
      body: r.description,
      createdAt: r.created_at,
      userId: uid,
      userName: u?.name || (r.metadata && r.metadata.email) || null,
      userEmail: u?.email || (r.metadata && r.metadata.email) || null,
      // Lets the panel show "already handled" instead of nagging the admin
      // about an account they approved days ago.
      // A plain signup needs no action. An auction signup does — marking it
      // "done" on arrival hid the very accounts this feed exists to surface.
      resolved: (r.type === 'user_registered' && !(r.metadata && r.metadata.wantsAuction))
        ? true
        : !!(u && u.verified_buyer),
      // A deleted account leaves its log row behind; say so rather than linking
      // to a user that is not in the table any more.
      userExists: !!u,
    }
  })

  return {
    success: true,
    notifications,
    // Things still needing the admin's attention.
    unseenCount: notifications.filter(n => !n.resolved && n.userExists).length,
  }
})
