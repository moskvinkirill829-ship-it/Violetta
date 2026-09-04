import type { CSSProperties, ReactNode } from 'react'
import './Highlight.css'

type Props = {
  children: ReactNode
  color?: string
  className?: string
}

/**
 * Слово на жёлтой «заливке маркером», как «онлайн» и «3 категории» в макете.
 * Подложка слегка перекошена и выходит за границы текста — эффект от руки.
 */
export default function Highlight({ children, color = 'var(--c-yellow)', className = '' }: Props) {
  return (
    <span className={`hl ${className}`.trim()} style={{ '--hl-color': color } as CSSProperties}>
      <span className="hl__text">{children}</span>
    </span>
  )
}
