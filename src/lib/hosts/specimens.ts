export type HostSpecimenVariant =
  | 'lead'
  | 'tall'
  | 'small'
  | 'medium'
  | 'squat'
  | 'wide'

export interface HostSpecimen {
  no: '01' | '02' | '03' | '04' | '05' | '06'
  variant: HostSpecimenVariant
  name: { first: string; last: string }
  where: string
  photoUrl: string
  photoAlt: string
  keptEur: number
  /**
   * CSS `object-position` value applied to the plate's photo. Use this to
   * pull a face into frame on landscape-shaped variants (medium / wide)
   * where the default `center center` crop lands on the torso. Omit for
   * specimens that frame correctly without override.
   */
  imageFocus?: string
}

export const HOSTS_SPECIMENS: readonly HostSpecimen[] = [
  {
    no: '01',
    variant: 'lead',
    name: { first: 'Sigrid', last: 'Halland' },
    where: 'Bergen · Norway · Fjordhaus',
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format',
    photoAlt: 'Sigrid Halland',
    keptEur: 4_820,
  },
  {
    no: '02',
    variant: 'tall',
    name: { first: 'Tomás', last: 'Cano' },
    where: 'Costa Brava · ES · Casa Lluna',
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format',
    photoAlt: 'Tomás Cano',
    keptEur: 11_240,
  },
  {
    no: '03',
    variant: 'small',
    name: { first: 'Niamh', last: "O'Hara" },
    where: 'Inisheer · IE · Cottage',
    photoUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80&auto=format',
    photoAlt: "Niamh O'Hara",
    keptEur: 3_615,
  },
  {
    no: '04',
    variant: 'medium',
    name: { first: 'Yusuf', last: 'Erkol' },
    where: 'Marrakesh · MA · Riad Zitoun, three rooms',
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=700&q=80&auto=format',
    photoAlt: 'Yusuf Erkol',
    keptEur: 7_902,
    imageFocus: 'center 28%',
  },
  {
    no: '05',
    variant: 'squat',
    name: { first: 'Astrid', last: 'Vík' },
    where: 'Lofoten · NO · Bjørke',
    photoUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80&auto=format',
    photoAlt: 'Astrid Vík',
    keptEur: 5_280,
  },
  {
    no: '06',
    variant: 'wide',
    name: { first: 'Marco', last: 'Greco' },
    where: 'Folegandros · GR · Anemos House · attic, one bath, one cat',
    photoUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&q=80&auto=format',
    photoAlt: 'Marco Greco',
    keptEur: 6_140,
  },
] as const
