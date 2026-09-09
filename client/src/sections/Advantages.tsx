import { advantages } from '../data/site'
import Reveal from '../components/Reveal'
import './Advantages.css'

export default function Advantages() {
  return (
    <section className="adv" id="advantages">
      <div className="container">
        <ul className="adv__grid">
          {advantages.map((a, i) => (
            <Reveal as="li" key={a.title} className="adv__item" delay={i * 80}>
              <img className="adv__icon" src={`/icons/adv-${a.icon}.png`} alt="" width={72} height={72} loading="lazy" />
              <div className="adv__text">
                <h3 className="adv__title">{a.title}</h3>
                <p>{a.text}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
