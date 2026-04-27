import {
  AlignLeft,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Coffee,
  Compass,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Heart,
  Info,
  LocateFixed,
  Lock,
  LogOut,
  type LucideIcon,
  Mail,
  MapPin,
  Menu,
  Minus,
  ParkingSquare,
  PawPrint,
  Pencil,
  Plus,
  Printer,
  Search,
  Share2,
  ShoppingBag,
  Star,
  Ticket,
  Trash2,
  Unlock,
  User,
  Users,
  Wifi,
  X,
} from 'lucide-react'

/**
 * Holidaze icon registry — typed allowlist mapped to lucide-react components.
 */
export const ICON_REGISTRY = {
  // amenities
  wifi: Wifi,
  parking: ParkingSquare,
  breakfast: Coffee,
  pets: PawPrint,

  // specs
  bed: ShoppingBag,
  guests: Users,
  guest: User,

  // place / coords
  pin: MapPin,
  compass: Compass,
  globe: Globe,
  coords: LocateFixed,

  // navigation
  menu: Menu,
  close: X,
  search: Search,
  filter: Filter,
  sort: AlignLeft,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,

  // calendar / time
  calendar: Calendar,
  clock: Clock,

  // auth / status
  mail: Mail,
  lock: Lock,
  unlock: Unlock,
  eye: Eye,
  'eye-off': EyeOff,
  check: Check,
  plus: Plus,
  minus: Minus,
  info: Info,

  // actions
  printer: Printer,
  ticket: Ticket,
  share: Share2,
  external: ExternalLink,
  download: Download,
  edit: Pencil,
  trash: Trash2,
  logout: LogOut,

  // misc
  star: Star,
  heart: Heart,
} as const satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICON_REGISTRY
