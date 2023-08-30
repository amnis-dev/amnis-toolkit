import type { StoreEnhancer } from '@reduxjs/toolkit/redux'
import { Tuple } from '@reduxjs/toolkit/internal'
import type { ExtractDispatchExtensions, Middlewares } from '@reduxjs/toolkit/internal'
import type { AutoBatchOptions } from './autoBatchEnhancer'
import { autoBatchEnhancer } from './autoBatchEnhancer'

type GetDefaultEnhancersOptions = {
  autoBatch?: boolean | AutoBatchOptions
}

export type GetDefaultEnhancers<M extends Middlewares<any>> = (
  options?: GetDefaultEnhancersOptions
) => Tuple<[StoreEnhancer<{ dispatch: ExtractDispatchExtensions<M> }>]>

export const buildGetDefaultEnhancers = <M extends Middlewares<any>>(
  middlewareEnhancer: StoreEnhancer<{ dispatch: ExtractDispatchExtensions<M> }>
): GetDefaultEnhancers<M> =>
  function getDefaultEnhancers(options) {
    const { autoBatch = true } = options ?? {}

    let enhancerArray = new Tuple<StoreEnhancer[]>(middlewareEnhancer)
    if (autoBatch) {
      enhancerArray.push(
        autoBatchEnhancer(typeof autoBatch === 'object' ? autoBatch : undefined)
      )
    }
    return enhancerArray as any
  }
