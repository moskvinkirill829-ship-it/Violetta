import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Возвращает callback-ref и флаг видимости — для плавного появления
 * элементов при попадании в зону видимости. Callback-ref удобен тем,
 * что его можно повесить на элемент любого типа (li, article, div…).
 *
 * Важно: на первой отрисовке всё, что уже близко к экрану (в пределах
 * ~1.3 высоты окна), показывается сразу — иначе на ноутбуке под первым
 * экраном виден пустой блок с opacity: 0, пока не проскроллишь.
 */
export function useReveal(threshold = 0.06) {
  const [shown, setShown] = useState(false)
  const io = useRef<IntersectionObserver | null>(null)
  const fallback = useRef<number | null>(null)

  const ref = useCallback(
    (node: Element | null) => {
      io.current?.disconnect()
      if (fallback.current) window.clearTimeout(fallback.current)
      if (!node || shown) return

      if (typeof IntersectionObserver === 'undefined') {
        setShown(true)
        return
      }

      // Блок уже виден или почти доскроллен — показываем без ожидания.
      const rect = node.getBoundingClientRect()
      if (rect.top < window.innerHeight * 1.3 && rect.bottom > 0) {
        setShown(true)
        return
      }

      io.current = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setShown(true)
            io.current?.disconnect()
          }
        },
        // положительный нижний отступ: блок проявляется заранее, ещё до
        // въезда в экран.
        { threshold, rootMargin: '0px 0px 18% 0px' },
      )
      io.current.observe(node)

      // Страховка: если наблюдатель почему-то не сработал — показать через 1.4 с.
      fallback.current = window.setTimeout(() => setShown(true), 1400)
    },
    [shown, threshold],
  )

  useEffect(
    () => () => {
      io.current?.disconnect()
      if (fallback.current) window.clearTimeout(fallback.current)
    },
    [],
  )

  return { ref, shown }
}
