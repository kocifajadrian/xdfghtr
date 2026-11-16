/**
 * The invoice PDF of an order, made in the browser with pdfmake (loaded only when someone presses the download button,
 * because the library with its fonts is large). The real API will send the official PDF; then this file goes away.
 * The seller data below is made up for the demo.
 */
import type { Content, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { MessageKey } from '@/i18n'
import type { Order } from './types'

export type InvoiceContext = {
  t: (key: MessageKey, params?: Record<string, string | number>) => string
  formatEuro: (amount: number) => string
  formatDate: (iso: string) => string
  /** Who the invoice is for. */
  customer: { name: string; email: string }
}

const GREEN = '#1f6b3a'
const GREY = '#6b7280'
const LINE = '#e5e7eb'
export const VAT_RATE = 23

const SELLER = [
  'Ubian s.r.o.',
  'Mostná 12',
  '010 01 Žilina',
  'IČO: 12 345 678',
  'IČ DPH: SK2012345678',
  'info@ubian.example',
]

const round = (n: number) => Math.round(n * 100) / 100

/** Prices include VAT, so the VAT is the part of the total that is `VAT_RATE` percent of the price without it. */
export function vatOf(total: number) {
  const vat = round((total * VAT_RATE) / (100 + VAT_RATE))
  return { base: round(total - vat), vat }
}

const label = (text: string): Content => ({
  text: text.toUpperCase(),
  fontSize: 8,
  bold: true,
  color: GREY,
  margin: [0, 0, 0, 3],
})

export function buildInvoice(
  order: Order,
  { t, formatEuro, formatDate, customer }: InvoiceContext,
): TDocumentDefinitions {
  const { base, vat } = vatOf(order.price)
  const head = (text: string, alignment: 'left' | 'right' = 'left'): TableCell => ({
    text,
    bold: true,
    fontSize: 9,
    color: GREY,
    alignment,
    margin: [0, 4, 0, 4],
  })
  const right = (text: string, extra: object = {}): TableCell => ({ text, alignment: 'right', ...extra })

  const meta: [string, string][] = [
    [t('orders.created'), formatDate(order.createdAt)],
    [t('orders.payment'), t(`orders.payment.${order.payment}` as MessageKey)],
    [t('orders.status'), t(`orders.status.${order.status}` as MessageKey)],
    ...(order.card ? ([[t('orders.card'), order.card]] as [string, string][]) : []),
  ]

  return {
    info: { title: `${t('invoice.title')} ${order.id}`, author: 'Ubian' },
    pageSize: 'A4',
    pageMargins: [48, 48, 48, 64],
    defaultStyle: { fontSize: 10, color: '#111827', lineHeight: 1.15 },
    content: [
      {
        columns: [
          { text: 'ubian', fontSize: 30, bold: true, color: GREEN },
          {
            stack: [
              { text: t('invoice.title'), fontSize: 20, bold: true, alignment: 'right' },
              {
                text: `${t('invoice.number')} ${order.id}`,
                color: GREY,
                alignment: 'right',
                margin: [0, 2, 0, 0],
              },
            ],
          },
        ],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 2, lineColor: GREEN }],
        margin: [0, 14, 0, 18],
      },

      {
        columns: [
          {
            width: 130,
            stack: [
              label(t('invoice.supplier')),
              ...SELLER.map((line, i) => ({ text: line, bold: i === 0 })),
            ],
          },
          {
            width: 120,
            stack: [
              label(t('invoice.customer')),
              { text: customer.name, bold: true },
              { text: customer.email },
            ],
          },
          {
            width: '*',
            stack: [
              label(t('invoice.details')),
              ...meta.map(([name, value]) => ({
                columns: [
                  { text: name, color: GREY, width: 86 },
                  { text: value, width: '*' },
                ],
                columnGap: 6,
              })),
            ],
          },
        ],
        columnGap: 24,
      },

      { text: order.description, color: GREY, margin: [0, 24, 0, 8] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 60, 80, 80],
          body: [
            [
              head(t('orders.items')),
              head(t('invoice.qty'), 'right'),
              head(t('invoice.unit'), 'right'),
              head(t('invoice.total'), 'right'),
            ],
            ...order.items.map((item): TableCell[] => [
              { text: item.name, margin: [0, 5, 0, 5] },
              right(String(item.qty), { margin: [0, 5, 0, 5] }),
              right(formatEuro(item.price), { margin: [0, 5, 0, 5] }),
              right(formatEuro(item.qty * item.price), { margin: [0, 5, 0, 5], bold: true }),
            ]),
          ],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === node.table.body.length ? 0 : 1),
          hLineColor: () => LINE,
          vLineWidth: () => 0,
          fillColor: (row) => (row === 0 ? '#f3f4f6' : null),
          paddingLeft: () => 8,
          paddingRight: () => 8,
        },
      },

      {
        margin: [0, 16, 0, 0],
        columns: [
          { text: '', width: '*' },
          {
            width: 220,
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ text: t('invoice.base'), color: GREY }, right(formatEuro(base))],
                [{ text: t('invoice.vat', { rate: VAT_RATE }), color: GREY }, right(formatEuro(vat))],
                [
                  { text: t('invoice.total'), bold: true, fontSize: 13, margin: [0, 6, 0, 0] },
                  right(formatEuro(order.price), {
                    bold: true,
                    fontSize: 13,
                    color: GREEN,
                    margin: [0, 6, 0, 0],
                  }),
                ],
              ],
            },
            layout: {
              hLineWidth: (i) => (i === 2 ? 1.5 : 0),
              hLineColor: () => GREEN,
              vLineWidth: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 3,
              paddingBottom: () => 3,
            },
          },
        ],
      },
    ],
    footer: (page, pages) => ({
      margin: [48, 0, 48, 0],
      columns: [
        { text: t('invoice.demo'), fontSize: 8, color: GREY },
        { text: `${page} / ${pages}`, fontSize: 8, color: GREY, alignment: 'right', width: 'auto' },
      ],
    }),
  }
}

/** Makes the PDF and saves it as `ubian-faktura-<order number>.pdf`. */
export async function downloadInvoice(order: Order, context: InvoiceContext) {
  const [{ default: pdfMake }, { default: vfs }] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
  ])
  pdfMake.addVirtualFileSystem(vfs)
  await pdfMake.createPdf(buildInvoice(order, context)).download(`ubian-invoice-${order.id}.pdf`)
}

/** Only orders that were paid have an invoice (a refunded one too: the money was taken first). */
export const hasInvoice = (order: Order) => order.status === 'paid' || order.status === 'refunded'
