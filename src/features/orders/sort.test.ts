import { describe, expect, it } from 'vitest'
import { MOCK_ORDERS } from './mock-data'
import { DEFAULT_SORT, nextSort, sortOrders } from './sort'

describe('sortOrders', () => {
  it('sorts by date, newest first by default', () => {
    const dates = sortOrders(MOCK_ORDERS, DEFAULT_SORT).map((o) => o.createdAt)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('sorts by price both ways', () => {
    const up = sortOrders(MOCK_ORDERS, { key: 'price', direction: 'asc' }).map((o) => o.price)
    expect(up).toEqual([...up].sort((a, b) => a - b))
    const down = sortOrders(MOCK_ORDERS, { key: 'price', direction: 'desc' }).map((o) => o.price)
    expect(down).toEqual([...up].reverse())
  })

  it('does not change the list it was given', () => {
    const copy = [...MOCK_ORDERS]
    sortOrders(MOCK_ORDERS, { key: 'price', direction: 'asc' })
    expect(MOCK_ORDERS).toEqual(copy)
  })
})

describe('nextSort', () => {
  it('turns the same column around and starts another one with its own direction', () => {
    expect(nextSort(DEFAULT_SORT, 'created')).toEqual({ key: 'created', direction: 'asc' })
    expect(nextSort(DEFAULT_SORT, 'price')).toEqual({ key: 'price', direction: 'asc' })
    expect(nextSort({ key: 'price', direction: 'asc' }, 'created')).toEqual({
      key: 'created',
      direction: 'desc',
    })
  })
})
