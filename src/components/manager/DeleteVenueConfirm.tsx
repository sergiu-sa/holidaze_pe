import { useConfirm } from '../ui/ConfirmDialog'

export function useDeleteVenueConfirm(): (venueName: string) => Promise<boolean> {
  const confirm = useConfirm()
  return (venueName: string) =>
    confirm({
      rubric: 'Delete venue',
      title: `Delete ${venueName}?`,
      body: 'This is permanent. Existing bookings on this venue are also removed.',
      confirmText: 'Delete venue',
      cancelText: 'Keep it',
      danger: true,
    })
}
