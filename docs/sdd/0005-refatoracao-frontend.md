# 0005 - Refatoracao Frontend

## Status

Implementada

## Problema

O frontend atual funciona, mas ainda depende de estilos Bootstrap aplicados
diretamente nas views, estilos inline e pouca estrutura compartilhada de layout.
Isso dificulta evoluir a experiencia visual, manter responsividade consistente e
adicionar suporte confiavel a tema escuro/claro.

## Escopo

- Refatorar o frontend Vue mantendo os fluxos existentes.
- Usar `docs/DESIGN.md` como referencia do design system.
- Implementar abordagem mobile first.
- Definir tema escuro como padrao.
- Permitir alternancia para tema claro.
- Reduzir estilos inline nas views.
- Criar fundacao de tokens CSS e componentes reutilizaveis quando necessario.
- Melhorar estados de loading, erro, vazio, sucesso e foco.
- Atualizar documentacao, specs e testes/checks relacionados.

## Fora De Escopo

- Alterar regras de Firestore ou Storage.
- Alterar modelo de dados de `comprovantes`, `acessos` ou `capturas`.
- Alterar tempo de expiracao dos comprovantes.
- Alterar a aparencia interna dos comprovantes bancarios alem do necessario para
  responsividade e integracao com o shell.
- Criar painel administrativo.
- Fazer deploy antes de validacao local.

## Requisitos

- R1: O frontend deve seguir `docs/DESIGN.md`.
- R2: A experiencia deve ser mobile first e responsiva em mobile, tablet e
  desktop.
- R3: O tema escuro deve ser o padrao inicial.
- R4: O usuario deve conseguir alternar para tema claro.
- R5: A preferencia de tema deve ser persistida quando possivel.
- R6: As telas `_gerar`, `acessos` e `transacao` devem manter o fluxo funcional
  atual.
- R7: Estados de loading, erro, vazio e sucesso devem ser visiveis e
  consistentes.
- R8: Controles interativos devem ter foco visivel e alvo minimo adequado para
  toque.
- R9: A refatoracao nao deve ampliar coleta de dados sensiveis nem permissoes
  Firebase.
- R10: Documentacao e verificacoes devem ser atualizadas junto com a mudanca.

## Criterios De Aceite

- AC1: `docs/DESIGN.md` e citado ou refletido na implementacao da refatoracao.
- AC2: Em viewport de `360px`, as telas principais nao apresentam overflow
  horizontal, clipping ou controles sobrepostos.
- AC3: Em desktop, o conteudo tem largura controlada e nao estica
  indefinidamente.
- AC4: O app inicia em tema escuro quando nao ha preferencia salva.
- AC5: O usuario consegue trocar para tema claro e a escolha permanece apos
  recarregar a pagina.
- AC6: O fluxo gerar -> acessos -> transacao continua funcionando em ambiente
  Firebase configurado.
- AC7: A pagina de acessos apresenta estados claros para sem acessos, erro de
  carregamento e evidencias disponiveis.
- AC8: A navegacao por teclado permite acessar botoes, links, campos e acordeoes
  com foco visivel.
- AC9: `npm run build` passa.
- AC10: Regras Firebase nao sao ampliadas por causa da refatoracao visual.

## Plano De Acao

1. Inventariar a UI atual.
    - Mapear estilos inline, classes Bootstrap usadas, estados existentes e
      componentes candidatos a extracao.
    - Confirmar dependencias visuais carregadas por CDN em `index.html`.

2. Definir a estrategia de CSS.
    - Decidir se Bootstrap sera mantido temporariamente ou removido.
    - Registrar a decisao nesta spec e em `docs/DESIGN.md` se houver impacto.
    - Reativar ou substituir `src/style.css` como entrada global de estilos.

3. Criar a fundacao de tema.
    - Adicionar tokens CSS para dark e light.
    - Definir `data-theme` no app shell.
    - Criar controle de alternancia de tema.
    - Persistir preferencia em armazenamento local do navegador.

4. Refatorar o app shell.
    - Padronizar layout base, loading global, largura de conteudo e navegacao.
    - Garantir que o tema nao quebre componentes de comprovante.

5. Refatorar `_gerar`.
    - Reorganizar formulario em blocos mobile first.
    - Padronizar labels, ajuda, botoes e mensagens.
    - Remover estilos inline desnecessarios.

6. Refatorar `acessos`.
    - Melhorar resumo do comprovante, link publico e lista de acessos.
    - Criar estados vazios e de erro consistentes.
    - Ajustar fotos, mapa e detalhes tecnicos para mobile.

7. Refatorar `transacao`.
    - Preservar o comprovante publico.
    - Melhorar estado de erro e acao de registrar evidencias.
    - Garantir que permissoes de camera/localizacao continuem opcionais e
      explicitas.

8. Consolidar componentes reutilizaveis.
    - Extrair apenas componentes que reduzam duplicacao real, como shell,
      alerta, botao, campo, card de secao ou toggle de tema.
    - Manter nomes em PascalCase e `<script setup>`.

9. Atualizar documentacao e verificacao.
    - Atualizar README se comandos, dependencias ou comportamento visual mudarem.
    - Atualizar `docs/security.md` se textos de privacidade ou evidencias
      mudarem.
    - Atualizar esta spec com decisoes finais e checks executados.

## Inventario Da UI Atual

Etapa 1 executada em 2026-07-08. Nenhuma alteracao de frontend foi feita nesta
etapa.

### Dependencias Visuais

- `index.html` carrega Bootstrap CSS `5.2.3` via CDN.
- `index.html` carrega Bootstrap Icons `1.11.1` via CDN.
- `index.html` carrega Bootstrap Bundle JS `5.2.3` via CDN, necessario hoje para
  componentes como accordion/collapse.
- `src/style.css` existe, mas esta vazio.
- `src/main.js` mantem `import './style.css'` comentado.
- `package.json` nao possui dependencia local de Bootstrap, Bootstrap Icons,
  Sass, biblioteca de componentes ou framework de CSS.

### Telas E Componentes Atuais

- `src/App.vue`: shell minimo com `RouterView` e `Loading`.
- `src/views/GerarView.vue`: tela de geracao com formulario longo, cards,
  alertas, inputs, selects e botoes Bootstrap.
- `src/views/AcessosView.vue`: painel de acompanhamento com navbar local,
  alerta de sucesso, contador de expiracao, accordion de acessos, mapa via
  iframe e grade de fotos.
- `src/views/ComprovanteFakeView.vue`: tela publica de comprovante, registro de
  acesso e fluxo de evidencias.
- `src/components/ComprovanteBradesco.vue`: componente visual especifico do
  comprovante Bradesco.
- `src/components/ComprovanteNext.vue`: componente visual especifico do
  comprovante Next.
- `src/components/Loading.vue`: overlay global de loading com spinner Bootstrap
  e CSS scoped proprio.

### Classes Bootstrap Mais Usadas

- Layout: `container`, `container-fluid`, `row`, `col-12`, `col-md-6`,
  `d-flex`, `justify-content-around`.
- Superficies: `card`, `card-body`, `card-footer`, `card-title`, `card-text`.
- Formularios: `form-label`, `form-control`, `form-select`.
- Acoes: `btn`, `btn-primary`, `btn-warning`, `btn-danger`, `btn-info`,
  `btn-lg`, `btn-close`.
- Feedback: `alert`, `alert-warning`, `alert-info`, `alert-success`,
  `alert-dismissible`, `fade`, `show`, `badge`, `text-bg-warning`.
- Dados expansivos: `accordion`, `accordion-item`, `accordion-header`,
  `accordion-button`, `accordion-collapse`, `collapse`, `accordion-body`.
- Utilitarios: `mb-*`, `mt-*`, `my-*`, `mx-auto`, `text-center`, `text-muted`,
  `small`, `img-fluid`, `rounded`, `w-25`, `d-block`, `visually-hidden`.

### Estilos Inline E CSS Local

- `AcessosView.vue` usa `style="background-color: lightgray"` na navbar.
- `AcessosView.vue` usa `style="font-weight: bold"` no titulo de sucesso.
- `AcessosView.vue` usa `style="color: red"` no contador de expiracao.
- `AcessosView.vue` usa `style="width: 100%; height: 300px"` no iframe do mapa.
- `Loading.vue` usa `style="width: 80px; height: 80px"` no spinner.
- `ComprovanteBradesco.vue` e `ComprovanteNext.vue` possuem CSS scoped para o
  botao de evidencias.
- `ComprovanteFakeView.vue` possui CSS scoped para esconder `video` e `canvas`.

### Estados Existentes

- Loading global controlado por `appStore.loadingToggle()`.
- `GerarView.vue` usa `window.alert` para erro de autenticacao e erro ao gerar
  comprovante.
- `AcessosView.vue` usa `data.alert` para erros e avisos no painel.
- `AcessosView.vue` possui estado `expirado` e contador textual de expiracao.
- `AcessosView.vue` nao possui estado vazio explicito para lista sem acessos.
- `AcessosView.vue` registra erro de fotos apenas no console.
- `ComprovanteFakeView.vue` usa `data.erro`, `evidenciasEnviadas` e
  `enviandoEvidencias`.
- `ComprovanteFakeView.vue` usa `window.confirm` antes de solicitar evidencias.
- Componentes de comprovante desabilitam o botao quando evidencias foram
  enviadas ou estao sendo enviadas.

### Candidatos A Extracao

- `AppShell`: layout base, navegacao simples, largura de conteudo, loading e
  futuro toggle de tema.
- `ThemeToggle`: controle acessivel para alternar dark/light.
- `AppAlert`: alerta padronizado para warning, info, success e danger.
- `AppButton`: botoes primario, secundario, aviso e acao sensivel.
- `FormField` ou padrao de campo: label, ajuda, erro e input/select.
- `SectionPanel`: bloco visual para formularios e grupos de dados.
- `EvidenceConsentButton`: acao de registrar evidencias compartilhada pelos
  comprovantes.
- `AccessCard`: item de acesso com resumo, evidencias, mapa e fotos.
- `EmptyState`: estado sem acessos ou sem evidencias.

### Observacoes Para A Etapa 2

- Bootstrap e usado de forma ampla. Remocao imediata exigiria substituir layout,
  formularios, accordion, alerts, botoes, grid, navbar e spinner.
- Uma convivencia temporaria com Bootstrap reduz risco, mas exige tokens CSS
  fortes para evitar conflito com o tema dark/light.
- Se Bootstrap for mantido, sera preciso definir como seus componentes recebem
  tokens de tema sem depender de classes hardcoded como `btn-primary` e
  `alert-success`.
- Se Bootstrap for removido, a etapa deve incluir substituto para accordion e
  para o comportamento de collapse que hoje depende do bundle JS via CDN.

## Estrategia CSS

Etapa 2 executada em 2026-07-08. Nenhuma alteracao de frontend foi feita nesta
etapa.

### Decisao

Manter Bootstrap temporariamente durante a refatoracao e migrar gradualmente
para CSS proprio baseado em tokens.

### Justificativa

- O inventario mostrou uso amplo de Bootstrap em layout, cards, formularios,
  botoes, alerts, accordion, grid, navbar, spinner e utilitarios.
- Remover Bootstrap antes da fundacao de tema aumentaria o risco de regressao em
  muitas telas ao mesmo tempo.
- O bundle JS do Bootstrap ainda sustenta o comportamento de accordion/collapse
  em `AcessosView.vue`.
- A convivencia permite introduzir `src/style.css`, tokens dark/light e
  componentes proprios sem bloquear a continuidade do fluxo atual.

### Diretrizes Para Implementacao

- Reativar `import './style.css'` em `src/main.js` na etapa de fundacao de tema.
- Usar `src/style.css` como entrada global para tokens, temas, reset leve,
  tipografia, foco visivel e utilitarios do design system.
- Evitar novas dependencias de classes Bootstrap em componentes novos.
- Componentes novos devem usar classes proprias e variaveis CSS.
- Componentes antigos podem manter Bootstrap ate serem refatorados.
- Substituir classes hardcoded como `btn-primary`, `alert-success` e `card`
  quando o componente entrar no escopo da refatoracao.
- Manter Bootstrap via CDN inicialmente para reduzir mudanca operacional.
- Remover Bootstrap do `index.html` apenas quando accordion/collapse, grid,
  forms, alerts, botoes, navbar e spinner tiverem substitutos proprios ou nativos
  validados.

### Impacto No Design System

- `docs/DESIGN.md` foi atualizado para refletir a convivencia temporaria com
  Bootstrap.
- A etapa 3 deve criar a base de tokens antes de refatorar views.
- A etapa 4 deve definir o shell e o controle de tema antes de reescrever
  formularios e listas.

## Fundacao De Tema

Etapa 3 executada em 2026-07-08.

### Implementado

- `src/style.css` voltou a ser importado por `src/main.js`.
- `src/style.css` recebeu tokens globais para tema dark e light alinhados a
  `docs/DESIGN.md`.
- O tema dark passou a ser o padrao quando nao ha preferencia salva.
- `src/App.vue` define `data-theme` no `document.documentElement`.
- `src/App.vue` recebeu controle visivel para alternar entre tema escuro e tema
  claro.
- A preferencia de tema e persistida em `localStorage` com a chave
  `pega-ladrao-theme`.
- Foco visivel global foi definido para links, botoes, campos e elementos com
  `tabindex`.
- `.firebaserc` foi alinhado aos sites de Hosting usados pelo roteamento do
  frontend: `pega-ladrao` para o gerador e `comprovante` para o comprovante
  publico.

### Limites Da Etapa

- As views ainda nao foram refatoradas para substituir classes Bootstrap por
  componentes proprios.
- Cards, alerts, formularios e accordions ainda dependem majoritariamente de
  Bootstrap.
- A etapa 4 deve reorganizar o app shell antes da refatoracao detalhada das
  telas.

## App Shell

Etapa 4 executada em 2026-07-08.

### Implementado

- `src/App.vue` recebeu cabecalho global com marca do app.
- O cabecalho global oferece link para gerar comprovante.
- Em `localhost` e `127.0.0.1`, o link do gerador aponta para `/`.
- Em ambientes publicados, o link do gerador aponta para
  `https://pegaladrao.app.br/`.
- O controle de tema foi mantido no shell e agrupado com a navegacao principal.
- `src/style.css` recebeu estilos globais para `app-header`, `app-brand`,
  `app-nav`, `app-nav__link` e `app-main`.
- A area principal passou a ter largura maxima controlada em `1120px` e padding
  responsivo.

### Limites Da Etapa

- As views ainda mantem containers Bootstrap internos, entao pode haver padding
  duplicado ate a refatoracao das telas.
- O shell ainda nao substitui a navbar local de `AcessosView.vue`; isso fica
  para a etapa de refatoracao da tela de acessos.
- O comprovante publico continua renderizado dentro dos componentes bancarios
  existentes, sem reescrita visual nesta etapa.

## Tela De Geracao

Etapa 5 executada em 2026-07-08.

### Implementado

- `src/views/GerarView.vue` foi reorganizada em blocos mobile first:
  apresentacao, aviso de uso, contexto, dados do pagador, dados do recebedor,
  validade e acoes.
- A tela deixou de depender de `container`, `card`, `alert`, `form-control`,
  `form-select`, `btn` e utilitarios Bootstrap para sua estrutura principal.
- Labels foram mantidos sempre visiveis e campos opcionais ficaram descritos no
  proprio texto do label.
- O campo de valor foi normalizado para manter altura e alinhamento consistentes
  em relacao aos demais inputs da grade.
- O campo monetario ganhou classe dedicada para manter largura e alinhamento
  visuais mais estaveis no desktop.
- A ajuda do CPF foi aproximada do campo e virou texto auxiliar.
- Erros de autenticacao e de geracao deixaram de usar `window.alert` e passaram
  a aparecer como feedback inline.
- O contrato de dados enviado ao Firestore foi preservado.
- O payload do comprovante continua compatível com as rules; campos de estado da
  UI nao seguem para o documento salvo.
- A navegacao apos criar comprovante continua apontando para `acessos` com
  `id` na query.
- `src/style.css` recebeu classes reutilizaveis iniciais: `page-heading`,
  `section-panel`, `form-grid`, `form-field`, `field-help`, `form-actions`,
  `app-button` e `app-alert`.

### Limites Da Etapa

- Validacao visual de erro por campo ainda depende das validacoes nativas do
  navegador.
- Componentes reutilizaveis ainda estao como classes CSS globais; a extracao
  para componentes Vue fica para a etapa 8, se a duplicacao justificar.

## Tela De Acessos

Etapa 6 executada em 2026-07-09.

### Implementado

- `src/views/AcessosView.vue` deixou de depender de `navbar`, `alert`,
  `accordion`, `badge`, `row`, `col-*`, `btn-close`, `iframe` inline e demais
  classes Bootstrap.
- A tela ganhou topo proprio, resumo do comprovante, bloco dedicado para o link
  publico e contador de expiracao mais consistente com o shell do app.
- A lista de acessos passou a usar `details/summary`, eliminando a dependencia
  do collapse do Bootstrap.
- Foi criado estado vazio explicito para comprovantes sem acessos registrados.
- As evidencias foram reorganizadas em cards de resumo, rede, dispositivo,
  localizacao e fotos, com grid responsivo para mobile e desktop.
- `src/style.css` recebeu estilos dedicados para `access-page`,
  `access-summary-*`, `access-item-*`, `access-map` e `access-photo-*`.

### Limites Da Etapa

- O helper `copyToClipboard` ainda usa `alert()` do navegador como retorno de
  sucesso.
- O mapa continua baseado em `iframe` do Google Maps e depende da disponibilidade
  das coordenadas registradas.

## Tela De Transacao

Etapa 7 executada em 2026-07-08.

### Implementado

- `src/views/ComprovanteFakeView.vue` recebeu um topo proprio para a tela de
  transacao, com titulo, contexto e alerta inline para erros.
- O fluxo do comprovante publico foi mantido, mas agora ele vive dentro de uma
  superficie responsiva alinhada ao design system.
- A rota `/transacao` passou a usar uma apresentacao publica propria, sem o
  header do gerador, mas ainda herdando o tema e os tokens globais.
- A tela de comprovante passou a usar classes de layout proprias
  (`transaction-*`) para nao herdar a composicao do gerador.
- O CSS global do gerador e o Bootstrap deixaram de ser carregados na rota
  `/transacao`; o comprovante publico passou a declarar fundo, fonte e estilos
  essenciais localmente.
- Os estilos publicos do comprovante ficaram presos ao modo
  `public-receipt-mode`, evitando vazamento de fundo e tipografia para o
  gerador.
- `src/components/ComprovanteBradesco.vue` e
  `src/components/ComprovanteNext.vue` foram simplificados para usar
  estrutura e botoes proprios da nova linguagem visual.
- A acao de registrar evidencias continuou explicita e permanece condicionada a
  confirmacao do usuario.
- `src/style.css` recebeu estilos compartilhados para a superficie do
  comprovante, blocos de dados e rodape de acoes.
- Os arquivos de imagem do comprovante foram movidos para `public/assets/bancos`
  para ficarem disponiveis como `/assets/...` no build.

### Limites Da Etapa

- Os comprovantes bancarios ainda sao componentes especificos; a extracao de
  partes compartilhadas pode ficar para a etapa 8 se houver duplicacao
  relevante.
- A coleta de evidencias continua dependente de permissao do navegador e da
  disponibilidade do dispositivo, como antes.

## Componentes Reutilizaveis

Etapa 8 executada em 2026-07-09.

### Implementado

- `src/components/AppAlert.vue` foi extraido para padronizar alertas do shell do
  gerador.
- `src/components/AppButton.vue` foi extraido para padronizar os botoes
  principais e secundarios do frontend refatorado.
- `src/components/EvidenceConsentButton.vue` foi extraido para remover a
  duplicacao entre `ComprovanteBradesco.vue` e `ComprovanteNext.vue`.
- `src/views/GerarView.vue` passou a usar `AppAlert` e `AppButton`.
- Os comprovantes bancarios passaram a compartilhar a mesma acao de registro de
  evidencias, preservando apenas a variacao visual necessaria por banco.

### Limites Da Etapa

- `SectionPanel` e `FormField` seguem como padrao de classes CSS; a extracao
  para componentes Vue ainda nao se justificou sem ampliar demais o escopo.

## Fechamento

Etapa 9 executada em 2026-07-09.

### Implementado

- `README.md` e `docs/DESIGN.md` foram alinhados com a retirada da dependencia
  visual de Bootstrap.
- `src/App.vue` deixou de carregar Bootstrap dinamicamente; o shell do gerador
  passa a depender apenas do CSS proprio do projeto.
- A spec foi atualizada com as etapas concluidas e os checks finais executados.

## Plano De Verificacao

- Check para R1: revisar diff contra `docs/DESIGN.md`.
- Check para R2: testar manualmente viewports `360px`, `390px`, `768px` e
  `1280px`.
- Check para R3, R4 e R5: abrir app sem preferencia salva, alternar tema,
  recarregar e confirmar persistencia.
- Check para R6: executar fluxo gerar -> acessos -> transacao em ambiente
  Firebase configurado ou em validacao manual documentada.
- Check para R7: simular lista vazia, erro de carregamento e acessos com
  evidencias.
- Check para R8: navegar por teclado nas telas principais.
- Check para R9 e R10: conferir diff de `firestore.rules`, `storage.rules`,
  README, docs e testes.
- Verificacoes gerais: `npm run build`, `npm run format:check`, `npm audit`,
  `npm run test:rules`.

## Riscos

- Risco: Remover Bootstrap de uma vez pode aumentar o escopo e quebrar layouts.
- Mitigacao: decidir explicitamente entre remocao completa ou convivencia
  temporaria antes de editar as views.

- Risco: Tema escuro pode prejudicar a aparencia dos comprovantes bancarios.
- Mitigacao: isolar comprovantes em componentes com superficie propria e testar
  em ambos os temas.

- Risco: Refatoracao visual pode alterar sem querer o fluxo de evidencias.
- Mitigacao: manter contratos de dados, permissoes e Firebase Rules inalterados.

- Risco: Falta de testes visuais automatizados.
- Mitigacao: documentar verificacao manual por breakpoint e considerar adicionar
  teste de pagina com Playwright em etapa separada.

## Notas

- Esta spec e apenas planejamento. Nenhuma alteracao de frontend deve ser feita
  ate aprovacao explicita da implementacao.
- O design system de referencia esta em `docs/DESIGN.md`.
- Tema padrao decidido: dark.
- Tema alternativo obrigatorio: light.
