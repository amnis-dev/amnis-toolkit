/**
 * Re-export specific modules and types from Reselect
 * 
 * @license https://github.com/reduxjs/reselect/blob/master/LICENSE
 */
export {
    createSelector,
    createSelectorCreator,
    defaultMemoize,
    autotrackMemoize,
    weakMapMemoize,
  } from 'reselect'
  export type {
    Selector,
    OutputParametricSelector,
    OutputSelector,
    ParametricSelector,
    CreateSelectorFunction,
  } from 'reselect'