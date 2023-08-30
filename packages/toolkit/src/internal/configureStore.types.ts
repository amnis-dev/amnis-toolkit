import type {
  Middleware,
} from '@reduxjs/toolkit/redux'

export type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>