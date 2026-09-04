// utils/phone.ts
//
// Shared by the browser (auto-imported by Nuxt) and the server, which re-exports
// it from server/utils/phone.ts so the two can never disagree about what a valid
// number is.
//
// Phone numbers used to be normalised with `phone.replace(/\D/g, '')`, which
// throws away the leading '+'. For a Swiss number that is survivable; for the
// Romanian, Serbian, Nigerian … numbers most of this marketplace's buyers
// actually use, it destroys the only thing that identifies the country, and
// "+40 721 234 567" came back as an unreachable "40721234567".

/** Digits only, with the leading '+' preserved when the user typed one. */
export const normalisePhone = (raw: unknown): string | null => {
  if (raw === null || raw === undefined) return null
  const s = String(raw).trim()
  if (!s) return null

  // 00 is the other way of writing '+' (the ITU international prefix).
  const intl = s.startsWith('+') || /^00\d/.test(s)
  const digits = intl ? s.replace(/\D/g, '').replace(/^00/, '') : s.replace(/\D/g, '')

  if (!digits) return null
  return intl ? `+${digits}` : digits
}

/**
 * Deliberately loose. National numbering plans run from 7 digits (some island
 * states) to 15 (the E.164 maximum), and rejecting anything outside a Swiss
 * shape is exactly the bug this file exists to prevent.
 */
export const isPlausiblePhone = (raw: unknown): boolean => {
  const digits = String(raw ?? '').replace(/\D/g, '')
  return digits.length >= 6 && digits.length <= 15
}
