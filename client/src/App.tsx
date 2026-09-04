import Header from './sections/Header'
import Hero from './sections/Hero'
import Advantages from './sections/Advantages'
import HowItWorks from './sections/HowItWorks'
import Subjects from './sections/Subjects'
import Teachers from './sections/Teachers'
import Reviews from './sections/Reviews'
import LeadForm from './sections/LeadForm'
import Footer from './sections/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Advantages />
        <HowItWorks />
        <Subjects />
        <Teachers />
        <Reviews />
        <LeadForm />
      </main>
      <Footer />
    </>
  )
}
