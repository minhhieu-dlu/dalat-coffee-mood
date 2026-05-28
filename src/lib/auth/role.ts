export type AppRole = 'admin' | 'user'

type UserLike = {
  user_metadata?: Record<string, unknown> | null
} | null | undefined

export function getUserRole(user: UserLike): AppRole {
  return user?.user_metadata?.role === 'admin' ? 'admin' : 'user'
}