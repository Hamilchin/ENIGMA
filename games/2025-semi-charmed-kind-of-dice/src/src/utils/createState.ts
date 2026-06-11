import type { State, StateProxy } from '../types'

export const createState = (state: Record<string, unknown>) => {
  const _updates: Record<string, Array<() => void>> = Object.fromEntries(
    Object.keys(state).map((s) => [s, []]),
  )
  const _update = (s: string) => _updates[s].forEach((u) => u())
  const addUpdate = (s: string, u: () => void) => _updates[s].push(u)
  return new Proxy({ ...state, _updates, _update, addUpdate } as StateProxy, {
    set(o, p, v) {
      if (typeof p === 'string') {
        ;(o as StateProxy)[p] = v
        o._update(p)
        return true
      }
      return false
    },
  }) as State
}
