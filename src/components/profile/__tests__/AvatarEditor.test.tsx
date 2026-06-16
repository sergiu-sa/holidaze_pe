import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AvatarEditor } from '../AvatarEditor'

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      name: 'tester',
      email: 'tester@stud.noroff.no',
      venueManager: false,
      avatar: undefined,
    },
  }),
}))

const { submitMock } = vi.hoisted(() => ({ submitMock: vi.fn() }))

vi.mock('../../../hooks/useUpdateProfile', () => ({
  useUpdateProfile: () => ({ submit: submitMock, isPending: false, error: null }),
}))

vi.mock('../../ui/ToastProvider', () => ({
  useToast: () => vi.fn(),
}))

vi.mock('../../ui/ConfirmDialog', () => ({
  useConfirm: () => () => Promise.resolve(true),
}))

vi.mock('../../../hooks/useImageProbe', () => ({
  useImageProbe: (url: string) => ({
    state: url ? 'ready' : 'empty',
    dim: url ? { w: 100, h: 100 } : null,
  }),
}))

describe('AvatarEditor', () => {
  beforeEach(() => {
    submitMock.mockReset()
    submitMock.mockResolvedValue(undefined)
  })

  it('renders display name as a read-only field with the current username', () => {
    render(
      <MemoryRouter>
        <AvatarEditor />
      </MemoryRouter>,
    )
    const nameInput = screen.getByDisplayValue('tester')
    expect(nameInput.tagName).toBe('INPUT')
    expect(nameInput).toHaveAttribute('readonly')
    expect(screen.getByText(/can't be changed/i)).toBeInTheDocument()
  })

  it('shows a friendly message (not the raw error) when saving fails', async () => {
    submitMock.mockRejectedValueOnce(new Error('TypeError: network boom'))
    render(
      <MemoryRouter>
        <AvatarEditor />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /save/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/couldn.t update your avatar/i)
    expect(alert).not.toHaveTextContent(/typeerror|boom/i)
  })
})
