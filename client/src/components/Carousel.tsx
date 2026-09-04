import { useCallback, useEffect, useState, type ReactNode } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import type { EmblaPluginType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import './Carousel.css'

type Props = {
  children: ReactNode
  /** мс между автопрокрутками; 0 — выключить */
  autoplay?: number
  ariaLabel: string
  className?: string
}

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Carousel({ children, autoplay = 0, ariaLabel, className = '' }: Props) {
  const plugins: EmblaPluginType[] = autoplay
    ? [Autoplay({ delay: autoplay, stopOnInteraction: false, stopOnMouseEnter: true })]
    : []

  const [emblaRef, embla] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: false, containScroll: 'trimSnaps' },
    plugins,
  )

  const [snaps, setSnaps] = useState<number[]>([])
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (!embla) return
    setSelected(embla.selectedScrollSnap())
  }, [embla])

  useEffect(() => {
    if (!embla) return
    setSnaps(embla.scrollSnapList())
    onSelect()
    embla.on('select', onSelect)
    embla.on('reInit', onSelect)
    return () => {
      embla.off('select', onSelect)
      embla.off('reInit', onSelect)
    }
  }, [embla, onSelect])

  return (
    <div className={`carousel ${className}`} role="region" aria-roledescription="карусель" aria-label={ariaLabel}>
      <button
        type="button"
        className="carousel__arrow carousel__arrow--prev"
        aria-label="Предыдущий слайд"
        onClick={() => embla?.scrollPrev()}
      >
        <Arrow dir="prev" />
      </button>

      <div className="carousel__viewport" ref={emblaRef}>
        <div className="carousel__track">{children}</div>
      </div>

      <button
        type="button"
        className="carousel__arrow carousel__arrow--next"
        aria-label="Следующий слайд"
        onClick={() => embla?.scrollNext()}
      >
        <Arrow dir="next" />
      </button>

      <div className="carousel__dots" role="tablist" aria-label="Навигация по слайдам">
        {snaps.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === selected}
            aria-label={`Слайд ${i + 1}`}
            className={`carousel__dot ${i === selected ? 'is-active' : ''}`}
            onClick={() => embla?.scrollTo(i)}
          />
        ))}
      </div>
    </div>
  )
}
