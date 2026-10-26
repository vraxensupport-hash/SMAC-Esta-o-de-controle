---
name: "SMAC — Estação de controle"
description: "Central operacional em papel branco, com um cartão escuro de destaque e a malha viva do campus."
colors:
  papel: "#FBFBFA"
  superficie: "#FFFFFF"
  nevoa: "#F3F5F4"
  tinta: "#111917"
  tinta-2: "#3A4643"
  tinta-3: "#65726E"
  tinta-4: "#97A39F"
  linha: "#E5E9E7"
  linha-forte: "#D2D9D6"
  energia: "#0B7F5F"
  energia-vivo: "#12A07A"
  energia-suave: "#E6F4EE"
  auto: "#9A5F08"
  auto-suave: "#FBF1DD"
  alerta: "#C2412D"
  alerta-suave: "#FCEBE7"
typography:
  sans: "Geist Variable"
  mono: "Geist Mono Variable"
rounded:
  controle: "12px"
  sala: "16px"
  bloco: "26px"
  moldura: "30px"
motion:
  saida: "cubic-bezier(0.23, 1, 0.32, 1)"
  gaveta: "cubic-bezier(0.32, 0.72, 0, 1)"
  mola: "spring 380 / 32"
  rapida: "150ms"
  normal: "250ms"
---

# SMAC — sistema visual

Os tokens moram em `web/tailwind.config.js` e `web/src/lib/movimento.ts`; este arquivo explica as regras por trás deles.

## Direção

Modo **Operate**: o operador confirma a saúde do campus, acha a exceção, abre a sala e age. Fundo papel quase branco, um único **cartão escuro** de destaque ("Campus agora", com hachura diagonal lenta) e o resto em superfícies claras. A memória da tela é a **malha viva**: 100 pontos, um por sala, que respiram quando o ar está ligado.

## Cor

- **Um acento só:** esmeralda (`energia`) é ação, atividade e "ligado". Nada decorativo usa verde.
- **Semânticos:** âmbar (`auto`) é desligamento automático por sala vazia; coral (`alerta`) é temperatura acima do limite e erro.
- **Estado nunca só por cor:** todo estado tem texto e ícone (selo do cartão, rótulo do aria-label).
- No cartão escuro, os mesmos estados usam versões mais claras (`#D9A043`, `#EC6A53`) para manter contraste.

## Tipografia

Geist para interface, Geist Mono para número de sala, horário, temperatura e contagem (sempre `tabular-nums`). Rótulos de seção em caixa alta pequena com tracking largo.

## Superfícies

- **Moldura** (`components/ui/Moldura.tsx`): casca em névoa com brilho interno e cartão branco dentro. Use em blocos de destaque (barras por bloco, energia e temperatura no painel).
- **Ficha**: bloco cinza claro com ícone em círculo, para métricas secundárias.
- Listas de dados ficam num único cartão com divisórias, não em vários cartões soltos.

## Movimento

- Animar **mudança de estado**, não decorar: onda no cartão quando a sala muda, evento novo entra com desfoque, número rola quando muda.
- Movimento contínuo só onde indica "ao vivo": pontos que respiram, hachura do cartão escuro, luz na borda do alerta (só quando há alerta).
- Respostas de 150–250 ms com curva de saída; painel com curva de gaveta; botões afundam (`scale(0.97)`).
- `prefers-reduced-motion`: sem deslocamentos, sem hachura andando; fades continuam.

## Acessibilidade

Alvos de 44 px, foco visível em esmeralda, painel com foco preso e Escape, retorno de ações em `aria-live`, contraste AA nos textos.
