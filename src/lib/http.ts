import { env } from '@/config/env'

/** Error for a non-2xx answer from the API. `status` is the HTTP status code. */
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

/**
 * Small typed fetch wrapper for the Ubian API: base URL from the environment, JSON in and out,
 * cookies included (for cookie-based sessions), and a typed error for failed requests.
 */
export async function http<T>(path: string, { method = 'GET', body, signal }: Options = {}): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    signal,
  })

  if (!response.ok) {
    let message = response.statusText
    try {
      const data = (await response.json()) as { message?: string }
      if (data.message) message = data.message
    } catch {
      /* the error answer had no JSON body */
    }
    throw new ApiError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
