export function Rodape({ ultimaSync }: { ultimaSync: Date | null }) {
  return (
    <footer className="border-t border-linha">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-4 py-5 text-[12px] text-tinta-3 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <span>SMAC · Sistema de Monitoramento de Ambiente na Cloud</span>
        <span className="font-mono tabular-nums">
          Atualização a cada 3 s
          {ultimaSync && ` · última às ${ultimaSync.toLocaleTimeString('pt-BR')}`}
        </span>
      </div>
    </footer>
  )
}
