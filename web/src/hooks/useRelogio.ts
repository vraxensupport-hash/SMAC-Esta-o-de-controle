import { useEffect, useState } from 'react'

/** Hora atual, atualizada a cada segundo. */
export function useRelogio() {
  const [agora, setAgora] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setAgora(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return agora
}
