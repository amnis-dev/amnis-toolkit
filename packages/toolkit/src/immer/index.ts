/**
 * Re-export specific modules and types from Immer
 *
 * @license https://github.com/immerjs/immer/blob/main/LICENSE
 */
export {
    produce as createNextState,
    current,
    freeze,
    original,
    isDraft,
    isDraftable,
    produceWithPatches,
    enablePatches,
  } from 'immer'
  export type { Draft, Patch } from 'immer'