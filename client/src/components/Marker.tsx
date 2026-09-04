import type { ReactNode } from 'react'
import './Marker.css'

type Props = {
  children: ReactNode
  color?: string
  /** Тип штриха: волнистый маркер или прямой мазок */
  variant?: 'wave' | 'brush'
  className?: string
}

/**
 * Текст с «нарисованным от руки» подчёркиванием, как в макете
 * (жёлтый маркер под «выбирайте то, что нужно», оранжевый под «Отзывы о нас»).
 */
export default function Marker({ children, color = 'var(--c-yellow)', variant = 'brush', className = '' }: Props) {
  return (
    <span className={`marker marker--${variant} ${className}`}>
      <span className="marker__text">{children}</span>
      {variant === 'wave' ? (
        <svg className="marker__stroke" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M2 9 C 40 2, 70 14, 110 8 S 190 2, 230 9 S 285 13, 298 6"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg className="marker__stroke" viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M6 12 C 60 4, 120 15, 180 9 C 230 4, 270 12, 294 8 L 292 13 C 250 17, 180 14, 120 16 C 70 17, 30 15, 8 15 Z"
            fill={color}
            opacity="0.9"
          />
        </svg>
      )}
    </span>
  )
}
