import { current, isDraft } from '@reduxjs/toolkit/immer'
import { createSelectorCreator, defaultMemoize } from '@reduxjs/toolkit/reselect'

export const createDraftSafeSelectorCreator: typeof createSelectorCreator = (
  ...args: unknown[]
) => {
  const createSelector = (createSelectorCreator as any)(...args)
  return (...args: unknown[]) => {
    const selector = createSelector(...args)
    const wrappedSelector = (value: unknown, ...rest: unknown[]) =>
      selector(isDraft(value) ? current(value) : value, ...rest)
    return wrappedSelector as any
  }
}

/**
 * "Draft-Safe" version of `reselect`'s `createSelector`:
 * If an `immer`-drafted object is passed into the resulting selector's first argument,
 * the selector will act on the current draft value, instead of returning a cached value
 * that might be possibly outdated if the draft has been modified since.
 * @public
 */
export const createDraftSafeSelector =
  createDraftSafeSelectorCreator(defaultMemoize)
