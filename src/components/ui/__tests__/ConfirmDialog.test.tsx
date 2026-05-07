import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { ConfirmDialogProvider, useConfirm } from '../ConfirmDialog'

function Harness({ onResult }: { onResult: (ok: boolean) => void }) {
  const confirm = useConfirm()
  function handleClick() {
    void confirm({
      rubric: 'Action required',
      title: 'Cancel this booking?',
      body: 'The dates open back up immediately.',
      confirmText: 'Cancel booking',
      cancelText: 'Keep it',
      danger: true,
    }).then(onResult)
  }
  return (
    <button type="button" onClick={handleClick}>
      open
    </button>
  )
}

beforeEach(() => {
  // jsdom doesn't implement HTMLDialogElement natively; install a polyfill once.
  const proto = HTMLDialogElement.prototype as Partial<HTMLDialogElement>
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function (this: HTMLDialogElement) {
      this.open = true
    }
    proto.close = function (this: HTMLDialogElement) {
      this.open = false
      this.dispatchEvent(new Event('close'))
    }
  }
})

describe('ConfirmDialog', () => {
  it('resolves true when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    let result: boolean | null = null
    render(
      <ConfirmDialogProvider>
        <Harness onResult={(ok) => { result = ok }} />
      </ConfirmDialogProvider>,
    )

    await user.click(screen.getByText('open'))
    await user.click(await screen.findByRole('button', { name: /cancel booking/i }))
    expect(result).toBe(true)
  })

  it('resolves false on dialog close (Esc)', async () => {
    const user = userEvent.setup()
    let result: boolean | null = null
    render(
      <ConfirmDialogProvider>
        <Harness onResult={(ok) => { result = ok }} />
      </ConfirmDialogProvider>,
    )
    await user.click(screen.getByText('open'))
    const dialog = await screen.findByRole('dialog')
    dialog.dispatchEvent(new Event('close'))
    await waitFor(() => { expect(result).toBe(false) })
  })
})
