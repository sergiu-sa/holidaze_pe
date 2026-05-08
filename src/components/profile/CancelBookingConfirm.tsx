import { useConfirm } from '../ui/ConfirmDialog'

export function useCancelBookingConfirm(): () => Promise<boolean> {
  const confirm = useConfirm()
  return () =>
    confirm({
      rubric: 'Cancel booking',
      title: 'Cancel this booking?',
      body: 'The dates open back up immediately. You can book again later.',
      confirmText: 'Cancel booking',
      cancelText: 'Keep it',
      danger: true,
    })
}
