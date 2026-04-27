import type { HTMLAttributes, ReactNode } from 'react'

import { Icon } from './Icon'
import type { IconName } from './icon-registry'

export type ChipVariant = 'index' | 'amenity'

interface BaseProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  className?: string
}

interface IndexChipProps extends BaseProps {
  variant: 'index'
  children: ReactNode
}

interface AmenityChipProps extends BaseProps {
  variant: 'amenity'
  icon?: IconName
  children: ReactNode
}

export type ChipProps = IndexChipProps | AmenityChipProps

const VARIANT_CLASS: Record<ChipVariant, string> = {
  index: 'chip chip--index',
  amenity: 'chip chip--amenity',
}

// Chip — index or amenity
export function Chip(props: ChipProps) {
  const { variant, className, children, ...rest } = props
  const composed = [VARIANT_CLASS[variant], className].filter(Boolean).join(' ')

  if (variant === 'amenity') {
    const { icon, ...amenityRest } = rest as Omit<AmenityChipProps, 'variant' | 'children' | 'className'>
    return (
      <span className={composed} {...amenityRest}>
        {icon && <Icon name={icon} size="sm" />}
        <span>{children}</span>
      </span>
    )
  }

  return (
    <span className={composed} {...rest}>
      {children}
    </span>
  )
}
