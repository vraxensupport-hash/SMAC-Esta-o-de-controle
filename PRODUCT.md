# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Operadores responsáveis por acompanhar e controlar os aparelhos de ar-condicionado das salas da faculdade. O sistema é usado como uma estação de controle para localizar salas, reconhecer estados críticos e agir rapidamente.

## Product Purpose

O SMAC centraliza o monitoramento de temperatura, presença, conexão e energia dos aparelhos de ar-condicionado. Ele permite ligar e desligar equipamentos, programar horários e reduzir desperdício ao desligar automaticamente salas vazias.

## Positioning

O sistema combina telemetria do ESP32, verificação de presença por câmera e controle infravermelho em uma única malha operacional por sala, preservando o mesmo contrato de API para o simulador e para o hardware real.

## Operating Context

- Campus acadêmico organizado em blocos A a F e salas numeradas.
- Acompanhamento contínuo em um dashboard que atualiza automaticamente.
- Decisões orientadas por estado do ar, temperatura, presença, agenda e conectividade.
- Uso atual em contexto acadêmico e de demonstração, com evolução prevista para hardware ESP32 real.

## Capabilities and Constraints

- Backend FastAPI, banco SQLite e frontend em HTML, CSS e JavaScript sem framework.
- A interface consome as APIs existentes de salas, eventos, leituras, energia, agenda e equipamento.
- O redesign deve preservar regras, endpoints, dados e comportamento funcional.
- A página deve continuar leve, responsiva e utilizável sem dependências frontend externas.
- Estados importantes: ligado, desligado, sala vazia, temperatura acima do limite, dispositivo offline, câmera offline, carregamento, vazio e erro de conexão.

## Brand Commitments

- Nome confirmado: SMAC — Sistema de Monitoramento de Ambiente na Cloud.
- Direção aprovada pelo usuário: central de comando premium.
- O produto deve comunicar controle, eficiência energética, confiabilidade e monitoramento em tempo real.

## Evidence on Hand

- Conteúdo e fluxos reais em `README.md`, `templates/dashboard.html` e `static/dashboard_style.css`.
- Dados reais ou simulados são fornecidos pela API local e pelo banco `smac.db`.
- Não há logotipo institucional, fotografias, depoimentos ou métricas comerciais confirmadas; trabalhos futuros não devem inventá-los.

## Product Principles

- Fazer o estado de cada sala ser entendido em poucos segundos.
- Priorizar ação operacional e legibilidade acima de decoração.
- Tornar mudanças de estado visíveis sem criar distração constante.
- Preservar o funcionamento com simulador hoje e hardware real depois.
- Usar eficiência energética como consequência concreta do produto, não como afirmação promocional vazia.

## Accessibility & Inclusion

- Contraste mínimo WCAG AA, foco visível e alvos de toque de pelo menos 44 px.
- Estado nunca comunicado apenas por cor.
- Movimento reduzido quando `prefers-reduced-motion` estiver ativo.
