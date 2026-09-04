import Highlight from '../components/Highlight'
import './Hero.css'

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__copy">
          <h1 className="hero__title">
            Все школьные предметы <Highlight>онлайн</Highlight>
          </h1>
          <p className="hero__lead">Подберём репетитора, который подойдёт именно вам</p>
          <a href="#lead" className="btn btn--ghost btn--lg hero__cta">
            Попробовать бесплатно
          </a>
        </div>

        <div className="hero__media">
          <span className="hero__blob hero__blob--1" aria-hidden="true" />
          <span className="hero__blob hero__blob--2" aria-hidden="true" />
          <span className="hero__dot hero__dot--1" aria-hidden="true" />
          <span className="hero__dot hero__dot--2" aria-hidden="true" />
          <img
            className="hero__photo"
            src="/images/hero-student.png"
            alt="Ученица занимается онлайн с репетитором за ноутбуком"
            width={1650}
            height={928}
            loading="eager"
          />
        </div>
      </div>
    </section>
  )
}
