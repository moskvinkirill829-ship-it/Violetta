import { createElement, type CSSProperties, type ElementType, type ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
import './Reveal.css'

type Props = {
  children: ReactNode
  as?: ElementType
  delay?: number
  className?: string
  style?: CSSProperties
  id?: string
}

/** Обёртка: плавное появление снизу вверх при попадании в зону видимости. */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  style,
  id,
}: Props) {
  const { ref, shown } = useReveal()
  return createElement(
    Tag,
    {
      ref,
      id,
      className: `reveal ${shown ? 'reveal--in' : ''} ${className}`.trim(),
      style: { ...style, transitionDelay: `${delay}ms` },
    },
    children,
  )
}
