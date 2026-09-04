import { useEffect, useState } from 'react'
import { reviews } from '../data/site'
import Carousel from '../components/Carousel'
import Reveal from '../components/Reveal'
import Marker from '../components/Marker'
import './Reviews.css'

export default function Reviews() {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((v) => (v === null ? v : (v + 1) % reviews.length))
      if (e.key === 'ArrowLeft') setOpen((v) => (v === null ? v : (v - 1 + reviews.length) % reviews.length))
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <section className="rev section" id="reviews">
      <div className="container">
        <Reveal className="rev__head">
          <h2 className="section-title rev__title">
            <Marker variant="brush" color="var(--c-orange)">Отзывы</Marker> о нас
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <Carousel ariaLabel="Отзывы учеников и родителей" autoplay={4200} className="rev__carousel">
            {reviews.map((r, i) => (
              <button type="button" className="rev-card" key={r.src} onClick={() => setOpen(i)}>
                <img src={r.src} alt={r.alt} loading="lazy" />
              </button>
            ))}
          </Carousel>
        </Reveal>
      </div>

      {open !== null && (
        <div className="rev-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр отзыва" onClick={() => setOpen(null)}>
          <button className="rev-lightbox__close" aria-label="Закрыть" onClick={() => setOpen(null)}>
            ×
          </button>
          <img
            src={reviews[open].src}
            alt={reviews[open].alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
