import { describe, expect, it } from 'vitest'
import { translate } from '@/i18n/translate'
import { buildInvoice, hasInvoice, vatOf } from './invoice'
import { MOCK_ORDERS } from './mock-data'

describe('invoice', () => {
  it('splits the price into the base and the VAT that add up again', () => {
    for (const o of MOCK_ORDERS) {
      const { base, vat } = vatOf(o.price)
      expect(Math.abs(base + vat - o.price)).toBeLessThan(0.005)
    }
    expect(vatOf(123)).toEqual({ base: 100, vat: 23 })
  })

  it('is made only for paid or refunded orders', () => {
    expect(hasInvoice({ ...MOCK_ORDERS[0], status: 'paid' })).toBe(true)
    expect(hasInvoice({ ...MOCK_ORDERS[0], status: 'refunded' })).toBe(true)
    expect(hasInvoice({ ...MOCK_ORDERS[0], status: 'cancelled' })).toBe(false)
    expect(hasInvoice({ ...MOCK_ORDERS[0], status: 'pending' })).toBe(false)
  })

  it('builds a document with the order number and every item', () => {
    const order = MOCK_ORDERS.find((o) => o.items.length > 1)!
    const doc = buildInvoice(order, {
      t: (k, p) => translate('sk', k, p),
      formatEuro: (n) => `${n} €`,
      formatDate: (iso) => iso,
      customer: { name: 'Test', email: 'test@example.com' },
    })
    const text = JSON.stringify(doc.content)
    expect(text).toContain(order.id)
    for (const item of order.items) expect(text).toContain(item.name)
  })
})
