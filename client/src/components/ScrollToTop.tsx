import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** При смене маршрута прокручивает страницу наверх. */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
