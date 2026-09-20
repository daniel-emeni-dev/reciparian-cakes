import { useSyncExternalStore } from 'react'

const subscribeNoop = () => () => {}

// False on the server and during hydration, true once running in the browser.
export function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}