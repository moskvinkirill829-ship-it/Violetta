import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Возвращает callback-ref и флаг видимости — для плавного появления
 * элементов при попадании в зону видимости. Callback-ref удобен тем,
 * что его можно повесить на элемент любого типа (li, article, div…).
 */
export function useReveal(threshold = 0.06) {
  const [shown, setShown] = useState(false)
  const observed = useRef<Element | null>(null)
  const io = useRef<IntersectionObserver | null>(null)

  const ref = useCallback(
    (node: Element | null) => {
      io.current?.disconnect()
      observed.current = node
      if (!node || shown) return

      if (typeof IntersectionObserver === 'undefined') {
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
        // положительный нижний отступ: блок проявляется заранее — когда он
        // ещё чуть ниже сгиба, а не строго при въезде в экран. Иначе на
        // ноутбуке под первым экраном виден пустой блок с opacity: 0.
        { threshold, rootMargin: '0px 0px 14% 0px' },
      )
      io.current.observe(node)
    },
    [shown, threshold],
  )

  useEffect(() => () => io.current?.disconnect(), [])

  return { ref, shown }
}
