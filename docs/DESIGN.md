# Design System

Este documento e a referencia visual e funcional do frontend do Pega Ladrao.
Toda refatoracao de interface deve seguir estes principios antes de alterar
views, componentes, CSS ou dependencias visuais.

## Objetivos

- Criar uma interface responsiva com abordagem mobile first.
- Usar tema escuro como padrao.
- Permitir alternancia para tema claro.
- Manter legibilidade alta para formularios, comprovantes, acessos e evidencias.
- Reduzir estilos inline e classes soltas em favor de tokens e componentes
  reutilizaveis.
- Preservar o fluxo atual: gerar comprovante, copiar link, abrir transacao e
  acompanhar acessos.

## Principios

- **Privacidade primeiro:** textos, alertas e estados devem deixar claro quando
  dados sensiveis podem ser coletados.
- **Operacao direta:** o usuario deve entender rapidamente o proximo passo em
  cada tela.
- **Mobile first:** telas pequenas definem a experiencia base; desktop amplia
  densidade e distribuicao, sem criar outro produto.
- **Contraste real:** componentes devem passar contraste AA no tema escuro e no
  tema claro.
- **Tema por tokens:** nenhuma cor de produto deve ser aplicada diretamente em
  componentes fora dos tokens.
- **Sem dependencia de hover:** estados essenciais tambem precisam funcionar em
  toque, teclado e leitores de tela.

## Temas

O tema padrao deve ser escuro. O tema claro deve estar disponivel por controle
visivel no app e persistir a escolha do usuario quando possivel.

### Tokens Base

| Token                      | Dark      | Light     | Uso                          |
| -------------------------- | --------- | --------- | ---------------------------- |
| `--color-bg`               | `#090d14` | `#f6f8fb` | Fundo global                 |
| `--color-surface`          | `#111827` | `#ffffff` | Paineis, cards e formularios |
| `--color-surface-muted`    | `#182234` | `#edf2f7` | Secoes secundarias           |
| `--color-border`           | `#263348` | `#d8e0ea` | Bordas discretas             |
| `--color-text`             | `#f8fafc` | `#172033` | Texto principal              |
| `--color-text-muted`       | `#aab6c8` | `#566579` | Texto auxiliar               |
| `--color-primary`          | `#38bdf8` | `#0369a1` | Acoes primarias e links      |
| `--color-primary-contrast` | `#03131f` | `#ffffff` | Texto sobre acao primaria    |
| `--color-danger`           | `#fb7185` | `#be123c` | Erro, alerta critico         |
| `--color-warning`          | `#fbbf24` | `#b45309` | Avisos e atencao             |
| `--color-success`          | `#34d399` | `#047857` | Sucesso e estados validos    |

### Aplicacao Do Tema

- O `html` ou `body` deve receber `data-theme="dark"` por padrao.
- O tema claro deve usar `data-theme="light"`.
- O sistema deve respeitar `prefers-color-scheme` apenas como entrada inicial
  opcional; a escolha explicita do usuario prevalece.
- Componentes devem consumir variaveis CSS, nao hexadecimais locais.
- Imagens de comprovantes e evidencias nao devem ser invertidas ou filtradas
  pelo tema.

## Tipografia

- Fonte base: `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Tamanho base mobile: `16px`.
- Tamanho base desktop: `17px`.
- Altura de linha padrao: `1.5`.
- Titulos devem ser curtos e informativos, sem texto promocional.
- Textos operacionais devem priorizar clareza em portugues.

### Escala

| Token            | Mobile     | Desktop     | Uso                     |
| ---------------- | ---------- | ----------- | ----------------------- |
| `--font-size-xs` | `0.75rem`  | `0.75rem`   | Metadados e ajuda curta |
| `--font-size-sm` | `0.875rem` | `0.875rem`  | Labels, badges          |
| `--font-size-md` | `1rem`     | `1.0625rem` | Corpo e campos          |
| `--font-size-lg` | `1.25rem`  | `1.375rem`  | Subtitulos              |
| `--font-size-xl` | `1.75rem`  | `2.25rem`   | Titulo de tela          |

## Layout

- Base mobile: uma coluna, largura fluida, padding lateral de `16px`.
- Desktop: container maximo entre `960px` e `1120px`, conforme a tela.
- Espacamento deve seguir escala de `4px`: `4`, `8`, `12`, `16`, `24`, `32`,
  `48`.
- Cards e paineis devem ter raio maximo de `12px`.
- Evitar cards aninhados; quando houver agrupamento, usar divisores, headings e
  espaco.
- Conteudo sensivel em `Acessos` deve ser escaneavel em blocos: rede,
  dispositivo, localizacao e fotos.

### Breakpoints

| Nome | Largura  | Regra                                        |
| ---- | -------- | -------------------------------------------- |
| `sm` | `480px`  | Ajustes finos para celulares maiores         |
| `md` | `768px`  | Duas colunas apenas quando melhora a leitura |
| `lg` | `1024px` | Formularios e listas podem ganhar densidade  |
| `xl` | `1280px` | Limitar largura, nao esticar conteudo        |

## Componentes

### App Shell

- Deve conter area principal, loading global e controle de tema.
- Navegacao deve ser simples e sempre permitir voltar para gerar comprovante.
- O controle de tema precisa ter nome acessivel.

### Botoes

- Altura minima: `44px`.
- Botao primario: acao principal da tela.
- Botao secundario: acao auxiliar, como limpar ou copiar.
- Botao destrutivo ou critico: reservado para risco real.
- Estados obrigatorios: default, foco visivel, disabled e loading quando a acao
  for assincrona.

### Formularios

- Labels sempre visiveis.
- Ajuda e erros devem ficar proximos ao campo.
- Inputs devem ocupar a largura total no mobile.
- Mascara de CPF/CNPJ nao substitui validacao visual de erro.
- Campos opcionais devem ser indicados no label, nao apenas no placeholder.

### Alertas

- Alertas devem ter titulo curto e mensagem objetiva.
- Avisos de privacidade devem usar `warning`, nao `danger`.
- Erros tecnicos devem oferecer acao ou proximo passo quando possivel.

### Listas De Acessos

- Cada acesso deve funcionar bem como bloco independente no mobile.
- Evidencias sensiveis devem ficar agrupadas e rotuladas.
- Mapas e fotos precisam manter proporcao estavel para evitar salto de layout.
- Estados vazios e de erro devem ser visiveis.

### Comprovante Publico

- O comprovante deve preservar a aparencia bancaria necessaria para o fluxo.
- A refatoracao do app shell nao deve quebrar o layout especifico dos
  componentes de comprovante.
- O botao de registrar evidencias deve explicar o que sera solicitado antes de
  pedir permissoes.

## Acessibilidade

- Todo controle interativo deve ser acessivel por teclado.
- Foco visivel e obrigatorio em links, botoes, campos e acordeoes.
- Textos em imagens precisam ter alternativa textual quando forem conteudo.
- Usar `aria-live` para mensagens de loading, sucesso ou erro quando alterarem
  o estado da tela sem navegacao.
- Nao usar apenas cor para comunicar estado.

## Imagens E Midia

- Fotos de evidencia devem usar `alt` claro, sem expor mais dado sensivel que o
  necessario.
- Mapas incorporados devem ter titulo acessivel.
- Imagens estaticas devem ter dimensoes ou proporcao definida.

## Bootstrap

O projeto nao depende mais de Bootstrap para a interface principal. A
refatoracao consolidou tokens, componentes e layouts proprios em `src/style.css`
e nos componentes Vue compartilhados.

- Novos componentes devem preferir classes do design system e variaveis CSS.
- Nao reintroduzir Bootstrap CDN ou dependencia visual equivalente sem atualizar
  este documento e a spec correspondente.
- Fluxos publicos, como `/transacao`, podem manter estilos locais proprios
  quando precisarem ficar isolados do shell do gerador.

Nao introduzir nova biblioteca visual sem atualizar este documento e a spec da
mudanca.

## Verificacao Visual

Antes de concluir uma mudanca de frontend, verificar:

- mobile estreito em `360px`;
- mobile comum em `390px`;
- tablet em `768px`;
- desktop em `1280px`;
- tema escuro;
- tema claro;
- navegacao por teclado;
- fluxo gerar -> acessos -> transacao -> registro de acesso.

## Relacao Com Specs

Specs de frontend devem citar este documento nos requisitos e criterios de
aceite. Se a implementacao precisar divergir deste design system, a spec e este
documento devem ser atualizados juntos.
