import { useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import type { Leitura } from '../../lib/api'
import { cn, graus, quando } from '../../lib/formato'

const L = 360
const A = 170
const PAD = { topo: 40, base: 28, esq: 10, dir: 10 }
const GUIAS = 6

/** Curva suave pelos pontos (a mesma tensão do analytics-bento). */
function curva(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const t = 0.2
    d += ` C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t}, ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t}, ${p2.x} ${p2.y}`
  }
  return d
}

/**
 * Cartão de temperatura no estilo do BudgetCard: valor grande, variação no
 * período, curva suave com área em degradê, guias tracejadas e um balão
 * que acompanha o dedo ou o mouse. A linha se desenha ao abrir.
 */
export function GraficoTemperatura({ leituras, limite, atual }: { leituras: Leitura[]; limite: number; atual: number | null }) {
  const id = useId().replace(/:/g, '')
  const reduzir = useReducedMotion()
  const svg = useRef<SVGSVGElement>(null)
  const [foco, setFoco] = useState<number | null>(null)

  if (leituras.length < 2) return <SemLeituras atual={atual} />

  const v = leituras.map(l => l.temperatura)
  const min = Math.min(...v, limite) - 0.8
  const max = Math.max(...v, limite) + 0.8
  const x = (i: number) => PAD.esq + (i / (v.length - 1)) * (L - PAD.esq - PAD.dir)
  const y = (t: number) => PAD.topo + (1 - (t - min) / (max - min)) * (A - PAD.topo - PAD.base)
  const pts = v.map((t, i) => ({ x: x(i), y: y(t) }))
  const linha = curva(pts)
  const area = `${linha} L ${x(v.length - 1)} ${A - PAD.base} L ${x(0)} ${A - PAD.base} Z`
  const ult = v.length - 1
  const ativo = foco ?? ult
  const quente = v[ativo] > limite
  const variacao = v[ult] - v[0]
  const guias = Array.from({ length: GUIAS }, (_, g) => Math.round((g / (GUIAS - 1)) * ult))
  const rotulos = [0, Math.round(ult / 2), ult]

  function mover(e: React.PointerEvent<SVGSVGElement>) {
    if (!svg.current) return
    const r = svg.current.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * L
    const i = Math.round(((px - PAD.esq) / (L - PAD.esq - PAD.dir)) * ult)
    setFoco(Math.max(0, Math.min(ult, i)))
  }

  const descricao = `${v.length} leituras de temperatura. Mínima de ${graus(Math.min(...v))}, máxima de ${graus(Math.max(...v))} e mais recente de ${graus(v[ult])}. Limite de alerta em ${graus(limite)}.`
  const Seta = variacao >= 0 ? TrendingUp : TrendingDown

  return (
    <figure className="p-5 pb-3 sm:p-6 sm:pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-tinta-3">Temperatura</p>
          <p className={cn('mt-1 font-mono text-[40px] font-semibold leading-none tracking-[-0.04em] tabular-nums', v[ult] > limite ? 'text-alerta' : 'text-tinta')}>
            {graus(v[ult])}
          </p>
        </div>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-linha bg-papel px-3 py-1.5 shadow-[0_1px_3px_rgb(17_25_23/0.05)]">
          <span className="font-mono text-[12.5px] font-semibold text-tinta tabular-nums">
            {variacao >= 0 ? '+' : '−'}{Math.abs(variacao).toFixed(1).replace('.', ',')} °C
          </span>
          <Seta size={14} className={variacao > 0.05 ? 'text-alerta' : 'text-energia'} aria-hidden />
        </span>
      </div>

      <div className="relative mt-1">
        <svg
          ref={svg}
          viewBox={`0 0 ${L} ${A}`}
          className="h-auto w-full touch-none select-none overflow-visible"
          role="img"
          aria-label={descricao}
          onPointerMove={mover}
          onPointerDown={mover}
          onPointerLeave={() => setFoco(null)}
        >
          <defs>
            <linearGradient id={`area-${id}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#12A07A" stopOpacity="0.30" />
              <stop offset="0.55" stopColor="#12A07A" stopOpacity="0.10" />
              <stop offset="1" stopColor="#12A07A" stopOpacity="0" />
            </linearGradient>
          </defs>

          {guias.map(i => (
            <line
              key={i}
              x1={x(i)} x2={x(i)} y1={PAD.topo - 8} y2={A - PAD.base}
              stroke="#D2D9D6" strokeDasharray="3 5"
              className="transition-opacity duration-200"
              opacity={foco !== null && Math.abs(i - foco) <= ult / (GUIAS * 2) ? 1 : 0.6}
            />
          ))}

          <line x1={PAD.esq} x2={L - PAD.dir} y1={y(limite)} y2={y(limite)} stroke="#C2412D" strokeOpacity={0.55} strokeDasharray="4 4" />
          <text x={PAD.esq} y={y(limite) - 5} className="fill-alerta font-mono text-[10px]">limite {limite.toFixed(0)} °C</text>

          <motion.path d={area} fill={`url(#area-${id})`} initial={{ opacity: reduzir ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.35 }} />
          <motion.path
            d={linha}
            fill="none"
            stroke="#0B7F5F"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduzir ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* ponto ativo: anel claro + miolo branco com contorno */}
          <g style={{ transform: `translate(${x(ativo)}px, ${y(v[ativo])}px)`, transition: 'transform 150ms cubic-bezier(0.23, 1, 0.32, 1)' }}>
            <circle r={12} fill={quente ? '#C2412D' : '#12A07A'} opacity={0.14} />
            <circle r={6.5} fill="#fff" stroke={quente ? '#C2412D' : '#0B7F5F'} strokeWidth={3} />
          </g>

          {rotulos.map(i => (
            <text key={i} x={x(i)} y={A - 8} textAnchor={i === 0 ? 'start' : i === ult ? 'end' : 'middle'} className="fill-tinta-4 font-mono text-[10.5px]">
              {quando(leituras[i].momento)}
            </text>
          ))}
        </svg>

        {/* balão flutuante */}
        <div
          className="pointer-events-none absolute transition-[left,top] duration-150 ease-saida"
          style={{ left: `${(x(ativo) / L) * 100}%`, top: `${(y(v[ativo]) / A) * 100}%`, transform: 'translate(-50%, calc(-100% - 16px))' }}
          aria-hidden
        >
          <div className="relative whitespace-nowrap rounded-xl bg-tinta px-3 py-1.5 text-center shadow-[0_6px_16px_rgb(17_25_23/0.25)]">
            <span className="font-mono text-[13px] font-semibold text-white tabular-nums">{graus(v[ativo])}</span>
            {foco !== null && <span className="ml-1.5 font-mono text-[10.5px] text-white/55">{quando(leituras[ativo].momento)}</span>}
            <span className="absolute -bottom-1.5 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[6px] border-t-[6px] border-x-transparent border-t-tinta" />
          </div>
        </div>
      </div>
      <figcaption className="sr-only">{descricao}</figcaption>
    </figure>
  )
}

/** Sem leituras suficientes: uma curva fantasma tracejada e o motivo. */
function SemLeituras({ atual }: { atual: number | null }) {
  return (
    <div className="p-5 sm:p-6">
      <p className="text-[13px] font-medium text-tinta-3">Temperatura</p>
      <p className="mt-1 font-mono text-[40px] font-semibold leading-none tracking-[-0.04em] text-tinta-4">
        {atual !== null ? graus(atual) : '—'}
      </p>
      <svg viewBox="0 0 360 70" className="mt-4 h-auto w-full" aria-hidden>
        <path d="M 10 50 C 70 50, 90 18, 150 26 S 250 58, 350 20" fill="none" stroke="#D2D9D6" strokeWidth={2} strokeDasharray="5 6" strokeLinecap="round" />
      </svg>
      <p className="mt-3 text-[12.5px] text-tinta-3">O ESP32 desta sala ainda não enviou leituras. O gráfico aparece a partir da segunda leitura.</p>
    </div>
  )
}
