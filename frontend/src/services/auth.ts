import { useAuth, useUser } from '@clerk/clerk-react'

export function useAuthUser() {
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const { user } = useUser()

  return {
    isLoaded,
    isSignedIn,
    signOut,
    userId: user?.id ?? null,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? null,
  }
}
