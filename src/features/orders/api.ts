/**
 * The signed-in user's orders. With no API address configured it returns MOCK data (mock-data.ts). The real call is
 * not defined yet: when it is, replace the body of listOrders and keep the signature.
 */
import { env } from '@/config/env'
import { http } from '@/lib/http'
import { MOCK_ORDERS } from './mock-data'
import type { Order } from './types'

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function listOrders(): Promise<Order[]> {
  if (env.useMockApi) {
    await sleep(400)
    return MOCK_ORDERS
  }
  return http<Order[]>('/orders')
}
