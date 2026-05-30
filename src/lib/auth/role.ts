export const ADMIN_EMAILS = new Set(['admin@gmail.com', 'quantri@gmail.com'])

export type AppRole = 'admin' | 'user'

type UserLike = {
  email?: string | null
  user_metadata?: Record<string, unknown> | null
} | null | undefined

export function isAdminEmail(email?: string | null) {
  return typeof email === 'string' && ADMIN_EMAILS.has(email.toLowerCase())
}

export function getUserRole(user: UserLike): AppRole {
  const metadataRole = user?.user_metadata?.role

  if (metadataRole === 'admin') {
    return 'admin'
  }

  return 'user'
}