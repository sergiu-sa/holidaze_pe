import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

import { Tab, TabList, TabPanel, TabPanels, Tabs } from '../Tabs'

function Harness() {
  const [v, setV] = useState<'a' | 'b' | 'c'>('a')
  return (
    <Tabs value={v} onChange={setV} ariaLabel="Demo">
      <TabList>
        <Tab value="a">First</Tab>
        <Tab value="b">Second</Tab>
        <Tab value="c">Third</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
        <TabPanel value="c">Panel C</TabPanel>
      </TabPanels>
    </Tabs>
  )
}

describe('Tabs', () => {
  it('arrow-right moves selection forward and wraps to start', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    const first = screen.getByRole('tab', { name: /first/i })
    first.focus()
    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: /second/i })).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowRight}{ArrowRight}')
    expect(screen.getByRole('tab', { name: /first/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('only the active tab has tabindex=0 (roving tabindex)', () => {
    render(<Harness />)
    expect(screen.getByRole('tab', { name: /first/i })).toHaveAttribute('tabindex', '0')
    expect(screen.getByRole('tab', { name: /second/i })).toHaveAttribute('tabindex', '-1')
  })
})
