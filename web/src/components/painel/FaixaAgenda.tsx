import { useRelogio } from '../../hooks/useRelogio'

const minutos = (h: string) => {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

/**
 * O dia em uma régua de 24 h: a faixa verde é o período em que o ar fica
 * ligado pelo horário programado (atravessa a meia-noite se precisar) e o
 * traço escuro marca a hora atual. Acompanha o que está digitado.
 */
export function FaixaAgenda({ ligar, desligar }: { ligar: string; desligar: string }) {
  const agora = useRelogio()
  const pos = ((agora.getHours() * 60 + agora.getMinutes()) / 1440) * 100

  // só um dos horários: marca o ponto, sem faixa
  const trechos: { de: number; ate: number }[] = []
  if (ligar && desligar) {
    const a = minutos(ligar) / 14.4
    const b = minutos(desligar) / 14.4
    if (a < b) trechos.push({ de: a, ate: b })
    else if (a > b) trechos.push({ de: a, ate: 100 }, { de: 0, ate: b })
  }

  const texto = ligar && desligar
    ? `Ligado das ${ligar} às ${desligar}`
    : ligar ? `Liga às ${ligar}, sem horário para desligar`
      : desligar ? `Desliga às ${desligar}, sem horário para ligar`
        : 'Sem horário programado'

  return (
    <div>
      <div className="relative h-3 overflow-hidden rounded-full bg-nevoa ring-1 ring-inset ring-linha" role="img" aria-label={texto}>
        {trechos.map((t, i) => (
          <span
            key={i}
            className="absolute inset-y-0 rounded-full bg-gradient-to-r from-energia to-energia-vivo transition-[left,width] duration-500 ease-saida"
            style={{ left: `${t.de}%`, width: `${t.ate - t.de}%` }}
          />
        ))}
        {[ligar, desligar].filter(Boolean).length === 1 && (
          <span className="absolute inset-y-0 w-1 rounded-full bg-energia" style={{ left: `${minutos(ligar || desligar) / 14.4}%` }} />
        )}
        <span className="absolute -inset-y-0.5 w-0.5 rounded-full bg-tinta" style={{ left: `${pos}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-tinta-4">
        <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
      </div>
      <p className="mt-1 text-[12px] text-tinta-3">{texto}</p>
    </div>
  )
}
