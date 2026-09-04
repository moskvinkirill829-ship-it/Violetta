import type { ReactElement } from 'react'

type IconName =
  | 'hourglass'
  | 'palette'
  | 'laptop'
  | 'handshake'
  | 'bell'
  | 'user'
  | 'check'
  | 'book'

type Props = {
  name: IconName
  size?: number
  className?: string
  /** жёлтая точка-акцент, как в фирменных иконках макета */
  dot?: boolean
}

const S = {
  fill: 'none',
  stroke: 'var(--c-primary)',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const paths: Record<IconName, ReactElement> = {
  hourglass: (
    <>
      <path d="M6 3h12M6 21h12" {...S} />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" {...S} />
    </>
  ),
  palette: (
    <>
      <path
        d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 2-1.8 0-.6-.4-1-.4-1.6 0-.8.7-1.4 1.6-1.4H17a4 4 0 0 0 4-4c0-4.6-4-8.2-9-8.2Z"
        {...S}
      />
      <circle cx="8" cy="10" r="1.1" fill="var(--c-primary)" stroke="none" />
      <circle cx="12" cy="7.5" r="1.1" fill="var(--c-primary)" stroke="none" />
      <circle cx="16" cy="10" r="1.1" fill="var(--c-primary)" stroke="none" />
    </>
  ),
  laptop: (
    <>
      <rect x="4" y="5" width="16" height="11" rx="1.6" {...S} />
      <path d="M2.5 19.5h19" {...S} />
      <path d="M10.5 9.5l3.5 2.5-3.5 2.2z" fill="var(--c-primary)" stroke="none" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 8.5 8 6l4 2 4-2 5 2.5" {...S} />
      <path d="M8 6l-3.5 6.5a1.7 1.7 0 0 0 2.6 2.1L10 12" {...S} />
      <path d="M16 6l3.5 6.5a1.7 1.7 0 0 1-2.6 2.1l-1.4-1.3" {...S} />
      <path d="M10 12l2 1.8a1.6 1.6 0 0 0 2.3-.2l1.2-1.3" {...S} />
      <path d="M12 8v3" {...S} />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.6 2.2H4.4L6 16Z" {...S} />
      <path d="M10 20a2 2 0 0 0 4 0" {...S} />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" {...S} />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" {...S} />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="8.5" {...S} />
      <path d="M8.2 12.3l2.7 2.7 5-5.4" {...S} />
    </>
  ),
  book: (
    <>
      <path d="M12 6c-2-1.4-5-1.6-7.5-1.2v12C7 16.4 10 16.6 12 18c2-1.4 5-1.6 7.5-1.2v-12C17 4.4 14 4.6 12 6Z" {...S} />
      <path d="M12 6v12" {...S} />
    </>
  ),
}

export default function Icon({ name, size = 32, className = '', dot = false }: Props) {
  return (
    <span className={`icon ${className}`} style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-hidden="true">
        {paths[name]}
      </svg>
      {dot && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: size * 0.22,
            height: size * 0.22,
            borderRadius: '50%',
            background: 'var(--c-yellow)',
            right: -size * 0.05,
            top: size * 0.02,
          }}
        />
      )}
    </span>
  )
}
