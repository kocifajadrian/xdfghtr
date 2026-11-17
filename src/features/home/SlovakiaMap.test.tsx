import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SlovakiaMap } from './SlovakiaMap'

describe('SlovakiaMap', () => {
  it('draws the regions, the growing links and the towns', () => {
    const { container } = render(<SlovakiaMap />)
    const svg = container.querySelector('svg')!
    expect(svg.querySelectorAll('path[fill-opacity]').length).toBeGreaterThan(5) // regions
    expect(svg.querySelectorAll('path[stroke-dasharray]').length).toBeGreaterThan(20) // links
    expect(svg.querySelectorAll('circle').length).toBeGreaterThan(20) // towns
  })

  it('stays on the whole map: no camera movement', () => {
    const { container } = render(<SlovakiaMap />)
    expect(container.querySelector('animate[attributeName="viewBox"]')).toBeNull()
  })
})
