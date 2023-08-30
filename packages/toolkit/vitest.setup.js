/* eslint-disable no-undef */
import nodeFetch from 'node-fetch'
import { server } from './src/query/tests/mocks/server'
globalThis.fetch = nodeFetch
globalThis.Request = nodeFetch.Request
globalThis.Headers = nodeFetch.Headers

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

process.on('unhandledRejection', (error) => {
  // eslint-disable-next-line no-undef
  fail(error)
})

process.env.NODE_ENV = 'development'
