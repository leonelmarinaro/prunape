import type { AxeResults } from 'axe-core'

declare module 'vitest' {
  interface Assertion<R = unknown> {
    toHaveNoViolations(): R
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown
  }
}

// Para compatibilidad con vitest-axe que usa namespace Vi
declare global {
  namespace Vi {
    interface Assertion<T = unknown> {
      toHaveNoViolations(): T
    }
  }
}

export type { AxeResults }
