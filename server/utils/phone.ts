// server/utils/phone.ts
//
// Re-export of utils/phone.ts so Nitro's auto-import picks it up. The rules for
// what counts as a valid phone number live in exactly one file — see there for
// why the leading '+' matters.
export { normalisePhone, isPlausiblePhone } from '../../utils/phone'
