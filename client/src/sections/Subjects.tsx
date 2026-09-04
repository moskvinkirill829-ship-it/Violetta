import { subjects } from '../data/site'
import Reveal from '../components/Reveal'
import Marker from '../components/Marker'
import './Subjects.css'

export default function Subjects() {
  return (
    <section className="subj section" id="subjects">
      <div className="container subj__inner">
        <Reveal className="subj__head">
          <h2 className="subj__title">
            Популярные <Marker variant="wave" color="var(--c-yellow)">предметы</Marker>
          </h2>
          <p className="subj__sub">выбирайте то, что нужно</p>
        </Reveal>

        <Reveal className="subj__grid" delay={100}>
          {subjects.map((name) => (
            <a
              key={name}
              href="#lead"
              className="subj__chip"
              aria-label={`${name} — записаться на урок`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 6c-2-1.4-5-1.6-7.5-1.2v12C7 16.4 10 16.6 12 18c2-1.4 5-1.6 7.5-1.2v-12C17 4.4 14 4.6 12 6Z"
                  fill="none"
                  stroke="var(--c-primary)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path d="M12 6v12" fill="none" stroke="var(--c-primary)" strokeWidth="2" />
              </svg>
              <span>{name}</span>
              <svg className="subj__chip-go" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
