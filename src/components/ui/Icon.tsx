import { ICON_REGISTRY, type IconName } from './icon-registry'

const SIZE_PX: Record<IconSize, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 24,
  xl: 32,
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface IconProps {
  name: IconName
  size?: IconSize
  /** Accessible label. When set, the icon is exposed to AT as role="img"; otherwise it's aria-hidden. */
  label?: string
  className?: string
}

// Icon — typed wrapper over lucide-react.
// Pass `label` for semantic icons; omit it for decoration paired with adjacent visible text.
export function Icon({ name, size = 'md', label, className }: IconProps) {
  const LucideGlyph = ICON_REGISTRY[name]
  const px = SIZE_PX[size]
  const a11y = label
    ? { role: 'img' as const, 'aria-label': label }
    : { 'aria-hidden': true as const, focusable: false as const }

  return (
    <LucideGlyph
      width={px}
      height={px}
      strokeWidth={1.5}
      className={className}
      {...a11y}
    />
  )
}
