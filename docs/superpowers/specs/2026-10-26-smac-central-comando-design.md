# SMAC — redesign da central de comando

Data: 2026-10-26  
Status: aprovado pelo usuário

## Objetivo

Transformar o dashboard atual em uma central de comando premium, clara e responsiva, preservando integralmente as APIs, regras, dados e ações existentes. O redesign deve tornar o estado do campus compreensível em poucos segundos e tornar cada controle mais seguro de operar.

## Direção visual aprovada

O produto será apresentado como uma central operacional contemporânea, inspirada na precisão de instrumentos técnicos e não em ficção científica. A identidade usa fundo grafite azulado, superfícies com contraste controlado, tipografia sans de alta legibilidade, números tabulares e um único acento esmeralda reservado para energia, atividade e ações positivas.

O elemento memorável será a **malha viva das salas**: cada bloco funciona como um setor e cada sala como um nó de telemetria. Pulsos discretos e mudanças de estado comunicam monitoramento em tempo real sem transformar o dashboard em uma tela ruidosa.

### Regras de gosto e acabamento

- Design variance 7: composição assimétrica no resumo, grade disciplinada nas salas.
- Motion intensity 5: movimento visível, curto e funcional; nenhuma animação gratuita em ações frequentes.
- Visual density 6: compacto o suficiente para operação, sem aparência congestionada.
- Uma única família de cinzas frios e um único acento esmeralda; amarelo e vermelho aparecem somente em estados semânticos de atenção e falha.
- Nada de preto puro, brilho neon, gradiente roxo/azul, sombras genéricas ou excesso de cartões.
- Transições específicas em vez de `transition: all`; ações recorrentes entre 100 e 250 ms.
- Botões têm resposta tátil com `scale(0.97)`; hover só em dispositivos que realmente suportam hover.
- Animações usam `transform` e `opacity`, com alternativa para `prefers-reduced-motion`.

## Arquitetura da tela

### 1. Barra operacional

Uma barra superior compacta contém a marca SMAC, o nome “Estação de controle”, um indicador de saúde da conexão e a hora local. O subtítulo atual vira informação operacional, não texto de apresentação.

### 2. Resumo do campus

As quatro métricas atuais permanecem, mas deixam de ser quatro cartões idênticos. “Ar ligado” recebe maior peso; pessoas, desligamentos automáticos e alertas térmicos formam uma faixa secundária. Os valores usam números tabulares e recebem uma transição curta quando mudam.

### 3. Registro de eventos

“Avisos recentes” vira um registro operacional com horário, sala, tipo e mensagem em linhas escaneáveis. Eventos de desligamento automático e alerta recebem marca semântica, nunca apenas cor. O estado vazio continua explícito e útil.

### 4. Setores e malha de salas

Cada bloco A–F é um setor com cabeçalho, faixa de salas e resumo local. As salas usam uma grade responsiva e mantêm número, estado e detalhe. O contorno, indicador, ícone textual e conteúdo diferenciam:

- ligado;
- desligado;
- desligado automaticamente por sala vazia;
- temperatura acima do limite;
- ESP32 ou câmera offline.

O carregamento inicial usa esqueletos no formato da grade. A entrada das salas recebe stagger curto de 30–50 ms, sem bloquear interação.

### 5. Painel de controle da sala

O `dialog` existente permanece semanticamente, mas assume aparência de painel lateral em desktop e folha inferior em mobile. Ele preserva energia, presença, próxima verificação, temperatura, conexão, agenda, equipamento, gráfico e histórico.

O painel abre com transição espacial curta, mantém foco preso, fecha com Escape e devolve o foco à sala que o abriu. A ação de energia é dominante; agenda e equipamento ficam em grupos subordinados. Mensagens de sucesso e erro permanecem inline.

### 6. Rodapé de telemetria

O rodapé mostra a cadência de atualização e a última sincronização conhecida. Não haverá links ou conteúdo institucional inventado.

## Componentes e limites

O projeto continuará em HTML, CSS e JavaScript puro. Não serão adicionados React, Tailwind, bibliotecas de ícones ou bibliotecas de animação. Componentes visuais serão implementados com HTML semântico, classes reutilizáveis e SVGs inline simples quando realmente necessários.

Arquivos principais:

- `templates/dashboard.html`: estrutura, estados acessíveis e comportamento.
- `static/dashboard_style.css`: tokens, layout responsivo, superfícies e movimento.

O backend, banco, endpoints e regras de negócio não fazem parte do redesign.

## Fluxo de dados

O polling existente continua buscando `/api/salas` e `/api/eventos` a cada três segundos. A primeira resposta monta a grade; respostas seguintes atualizam somente conteúdo e classes de estado. Quando uma sala está aberta, histórico e leituras continuam sendo buscados em paralelo. As ações de energia, agenda e equipamento mantêm os mesmos endpoints e payloads.

O redesign pode adicionar atributos e elementos de apresentação, mas não altera contratos de API nem a forma dos dados.

## Estados e tratamento de erro

- Carregamento inicial: esqueletos estruturais, sem spinner genérico.
- API indisponível: banner operacional persistente com orientação clara e conteúdo anterior preservado quando possível.
- Lista vazia: mensagem composta e contextual.
- Ação em andamento: botão temporariamente indisponível e rótulo específico.
- Sucesso ou falha: retorno inline com `aria-live`.
- Dispositivo offline: estado visível no cartão e no painel da sala.
- Dados ausentes: usar “Sem leitura” ou “Ainda não verificada”, nunca valor inventado.

## Responsividade e acessibilidade

- Mobile-first a partir de 375 px; sem rolagem horizontal.
- Alvos de toque mínimos de 44 × 44 px.
- Contraste WCAG AA, foco visível e ordem de tabulação coerente.
- Estado nunca depende apenas de cor.
- Hierarquia correta de títulos e regiões semânticas.
- O painel lateral vira bottom sheet em telas estreitas.
- `prefers-reduced-motion` elimina deslocamentos e pulsos, preservando fades úteis.

## Verificação

1. Exercitar carregamento, vazio, erro de API e dados completos.
2. Conferir todas as ações existentes: energia, agenda, limpar agenda e equipamento.
3. Testar abertura, Escape, clique externo e retorno de foco do painel.
4. Conferir layouts em 375 px, 768 px, 1024 px e desktop amplo.
5. Validar teclado, foco, contraste, `aria-live` e redução de movimento.
6. Capturar desktop e mobile em uma rodada conjunta, corrigir em lote e confirmar em no máximo uma segunda rodada.
7. Executar o detector Impeccable nos arquivos alterados após a implementação.

## Fora do escopo

- Mudanças no backend, banco, hardware ou regras de presença.
- Novas funcionalidades de produto.
- Conteúdo comercial, logotipos ou dados institucionais não fornecidos.
- Migração de stack ou instalação de dependências.

## Critério de conclusão

O trabalho estará concluído quando a interface parecer uma central operacional coesa em desktop e mobile, todos os fluxos existentes continuarem funcionando, os estados essenciais estiverem claros sem depender apenas de cor e a revisão visual final não apontar defeitos materiais abertos.
