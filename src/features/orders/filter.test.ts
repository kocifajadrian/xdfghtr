import { describe, expect, it } from 'vitest'
import { filterOrders, NO_FILTER, orderYears } from './filter'
import { MOCK_ORDERS } from './mock-data'

const label = (o: { product: string }) => o.product

describe('filterOrders', () => {
  it('shows everything without a filter', () => {
    expect(filterOrders(MOCK_ORDERS, NO_FILTER, label)).toHaveLength(MOCK_ORDERS.length)
  })

  it('filters by the last days', () => {
    const recent = filterOrders(MOCK_ORDERS, { ...NO_FILTER, period: '30d' }, label)
    expect(recent.length).toBeGreaterThan(0)
    expect(recent.length).toBeLessThan(MOCK_ORDERS.length)
  })

  it('filters by calendar year', () => {
    const [year] = orderYears(MOCK_ORDERS)
    const inYear = filterOrders(MOCK_ORDERS, { ...NO_FILTER, period: year as `${number}` }, label)
    expect(inYear.every((o) => o.createdAt.startsWith(year))).toBe(true)
  })

  it('searches the number and the description, ignoring accents and case', () => {
    expect(filterOrders(MOCK_ORDERS, { ...NO_FILTER, query: '14409058' }, label)).toHaveLength(1)
    const parking = filterOrders(MOCK_ORDERS, { ...NO_FILTER, query: 'PARKOVANIE zilina' }, label)
    expect(parking.length).toBeGreaterThan(0)
    expect(parking.every((o) => o.description.includes('Parkovanie'))).toBe(true)
  })

  it('combines the conditions', () => {
    const none = filterOrders(MOCK_ORDERS, { ...NO_FILTER, query: '14409058', period: '30d' }, label)
    expect(none).toHaveLength(0)
  })

  it('has item prices that add up to the total', () => {
    for (const o of MOCK_ORDERS) {
      const sum = o.items.reduce((s, i) => s + i.qty * i.price, 0)
      expect(Math.abs(sum - o.price)).toBeLessThan(0.005)
    }
  })
})
