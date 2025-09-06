import { useLocalStorage } from '../hooks/useLocalStorage'

export type InterfaceName = 'watchface' | 'simple'

export function useInterface() {
  return useLocalStorage<InterfaceName>('uiInterface', 'watchface')
}


