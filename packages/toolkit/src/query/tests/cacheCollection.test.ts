import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { configureStore } from '@reduxjs/toolkit'
import { vi } from 'vitest'
import type { Middleware, Reducer } from '@reduxjs/toolkit/redux'
import {
  THIRTY_TWO_BIT_MAX_INT,
  THIRTY_TWO_BIT_MAX_TIMER_SECONDS,
} from '../core/buildMiddleware/cacheCollection'

beforeAll(() => {
  vi.useFakeTimers()
})

const onCleanup = vi.fn()

beforeEach(() => {
  onCleanup.mockClear()
})

test(`query: await cleanup, defaults`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
  vi.advanceTimersByTime(59000)
  expect(onCleanup).not.toHaveBeenCalled()
  vi.advanceTimersByTime(2000)
  expect(onCleanup).toHaveBeenCalled()
})

test(`query: await cleanup, keepUnusedDataFor set`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
      keepUnusedDataFor: 29,
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
  vi.advanceTimersByTime(28000)
  expect(onCleanup).not.toHaveBeenCalled()
  vi.advanceTimersByTime(2000)
  expect(onCleanup).toHaveBeenCalled()
})

test(`query: handles large keepUnuseDataFor values over 32-bit ms`, async () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
      }),
      keepUnusedDataFor: THIRTY_TWO_BIT_MAX_TIMER_SECONDS - 10,
    })
  )

  store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()

  // Shouldn't have been called right away
  vi.advanceTimersByTime(1000)
  expect(onCleanup).not.toHaveBeenCalled()

  // Shouldn't have been called any time in the next few minutes
  vi.advanceTimersByTime(1_000_000)
  expect(onCleanup).not.toHaveBeenCalled()

  // _Should_ be called _wayyyy_ in the future (like 24.8 days from now)
  vi.advanceTimersByTime(THIRTY_TWO_BIT_MAX_TIMER_SECONDS * 1000),
    expect(onCleanup).toHaveBeenCalled()
})

describe(`query: await cleanup, keepUnusedDataFor set`, () => {
  const { store, api } = storeForApi(
    createApi({
      baseQuery: fetchBaseQuery({ baseUrl: 'https://example.com' }),
      endpoints: (build) => ({
        query: build.query<unknown, string>({
          query: () => '/success',
        }),
        query2: build.query<unknown, string>({
          query: () => '/success',
          keepUnusedDataFor: 35,
        }),
        query3: build.query<unknown, string>({
          query: () => '/success',
          keepUnusedDataFor: 0,
        }),
        query4: build.query<unknown, string>({
          query: () => '/success',
          keepUnusedDataFor: Infinity,
        }),
      }),
      keepUnusedDataFor: 29,
    })
  )

  test('global keepUnusedDataFor', async () => {
    store.dispatch(api.endpoints.query.initiate('arg')).unsubscribe()
    vi.advanceTimersByTime(28000)
    expect(onCleanup).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(onCleanup).toHaveBeenCalled()
  })

  test('endpoint keepUnusedDataFor', async () => {
    store.dispatch(api.endpoints.query2.initiate('arg')).unsubscribe()
    vi.advanceTimersByTime(34000)
    expect(onCleanup).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2000)
    expect(onCleanup).toHaveBeenCalled()
  })

  test('endpoint keepUnusedDataFor: 0 ', async () => {
    expect(onCleanup).not.toHaveBeenCalled()
    store.dispatch(api.endpoints.query3.initiate('arg')).unsubscribe()
    expect(onCleanup).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(onCleanup).toHaveBeenCalled()
  })

  test('endpoint keepUnusedDataFor: Infinity', async () => {
    expect(onCleanup).not.toHaveBeenCalled()
    store.dispatch(api.endpoints.query4.initiate('arg')).unsubscribe()
    expect(onCleanup).not.toHaveBeenCalled()
    vi.advanceTimersByTime(THIRTY_TWO_BIT_MAX_INT)
    expect(onCleanup).not.toHaveBeenCalled()
  })
})

function storeForApi<
  A extends {
    reducerPath: 'api'
    reducer: Reducer<any, any>
    middleware: Middleware
    util: { resetApiState(): any }
  }
>(api: A) {
  const store = configureStore({
    reducer: { api: api.reducer },
    middleware: (gdm) =>
      gdm({ serializableCheck: false, immutableCheck: false }).concat(
        api.middleware
      ),
    enhancers: (gde) =>
      gde({
        autoBatch: false,
      }),
  })
  let hadQueries = false
  store.subscribe(() => {
    const queryState = store.getState().api.queries
    if (hadQueries && Object.keys(queryState).length === 0) {
      onCleanup()
    }
    hadQueries = hadQueries || Object.keys(queryState).length > 0
  })
  return { api, store }
}
