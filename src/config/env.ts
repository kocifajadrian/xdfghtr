// The only place that reads import.meta.env. The rest of the app imports `env` from here.

const apiUrl = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const mockFlag = import.meta.env.VITE_USE_MOCK_API

const useMockApi = mockFlag === undefined || mockFlag === '' ? apiUrl === '' : mockFlag !== 'false'

export const env = {
  apiUrl,
  /** Mock API is on by default when no API address is configured. */
  useMockApi,
  /**
   * The demo opens already signed in, so a shared link shows the whole app at once. Only with the mock API; switch it
   * off with VITE_DEMO_SIGNED_IN=false (tests run signed out, too).
   */
  demoSignedIn:
    useMockApi && import.meta.env.VITE_DEMO_SIGNED_IN !== 'false' && import.meta.env.MODE !== 'test',
} as const
