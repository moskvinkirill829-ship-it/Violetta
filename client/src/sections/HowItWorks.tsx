import { steps } from '../data/site'
import Reveal from '../components/Reveal'
import Highlight from '../components/Highlight'
import './HowItWorks.css'

export default function HowItWorks() {
  return (
    <section className="how section" id="how">
      <div className="container how__inner">
        <Reveal className="how__head">
          <h2 className="how__title">Как мы работаем</h2>
          <p className="how__sub">
            Простой и понятный <Highlight>путь к знаниям</Highlight>
          </p>
        </Reveal>

        <ol className="how__steps">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.n} className="how__step" delay={i * 120}>
              <span className="how__num">{s.n}</span>
              <img className="how__icon" src={`/icons/i-${s.icon}.png`} alt="" width={72} height={72} loading="lazy" />
              <h3 className="how__step-title">{s.title}</h3>
              <p className="how__step-text">{s.text}</p>
              {i < steps.length - 1 && (
                <svg className="how__arrow" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 12h15M13 6l6 6-6 6" fill="none" stroke="var(--c-primary-2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
