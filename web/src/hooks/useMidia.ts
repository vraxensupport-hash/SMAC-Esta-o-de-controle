import { useEffect, useState } from 'react'

/** true enquanto a media query casar (ex.: '(min-width: 768px)'). */
export function useMidia(consulta: string) {
  const [casa, setCasa] = useState(() => window.matchMedia(consulta).matches)
  useEffect(() => {
    const m = window.matchMedia(consulta)
    const mudar = () => setCasa(m.matches)
    m.addEventListener('change', mudar)
    return () => m.removeEventListener('change', mudar)
  }, [consulta])
  return casa
}
