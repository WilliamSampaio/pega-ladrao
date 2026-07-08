# Diagnostico Inicial - 2026-07-07

## Objetivo

Registrar o estado atual do projeto antes das correcoes de seguranca, funcionamento e documentacao. Este arquivo e um ponto de partida para as specs em `docs/sdd/`.

## Escopo Avaliado

- Aplicacao Vue/Vite em `src/`.
- Configuracao Firebase em `firebase.json`, `firestore.rules`, `storage.rules` e `firestore.indexes.json`.
- Configuracao de ambiente em `.env.example`.
- Scripts e dependencias em `package.json` e `package-lock.json`.
- Documentacao principal em `README.md`.

## Estado Do Projeto

- Stack principal: Vue 3, Vite, Firebase, Pinia, Vue Router, Capacitor.
- Scripts disponiveis:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`
- Nao ha scripts de lint ou testes automatizados configurados.
- Nao havia estrutura SDD dedicada antes desta etapa.

## Resultado Dos Checks

### `npm install`

Resultado: concluido com sucesso.

Observacoes:
- 230 pacotes instalados.
- `npm audit` continua apontando vulnerabilidades.

### `npm audit`

Resultado: falhou por vulnerabilidades conhecidas.

Resumo:
- 12 vulnerabilidades no total.
- 3 moderadas.
- 8 altas.
- 1 critica.

Pacotes destacados pelo audit:
- `protobufjs`: vulnerabilidade critica.
- `vite`: vulnerabilidades altas.
- `@capacitor/cli` via `tar`: vulnerabilidades altas.
- `rollup`, `glob`, `minimatch`, `@grpc/grpc-js`, `@xmldom/xmldom`, `postcss`, `brace-expansion`.

Acao recomendada:
- Tratar na spec `docs/sdd/0001-hardening-seguranca.md`.
- Rodar `npm audit fix` somente depois de revisar impacto em `package-lock.json` e build.

### `npm run build`

Resultado: concluido com sucesso apos `npm install`.

Observacoes:
- Build gerou `dist/`.
- Vite emitiu aviso: `%VITE_DEFAULT_COMPROVANTE_URL%` nao esta definido para substituicao em `index.html`.
- Vite emitiu aviso de chunk maior que 500 kB.

Acao recomendada:
- Tratar variavel de ambiente e warning de build na spec `docs/sdd/0002-restaurar-funcionamento.md`.

## Riscos Encontrados

### Firestore bloqueado por regra expirada

Arquivo: `firestore.rules`

Estado atual:
- Todas as leituras e escritas dependem de `request.time < timestamp.date(2025, 4, 12)`.
- Como a data ja passou, as operacoes do app tendem a ser negadas em ambiente Firebase.

Impacto:
- Geracao de comprovantes pode falhar.
- Consulta de comprovantes pode falhar.
- Registro e listagem de acessos podem falhar.

### Regras permissivas antes da expiracao

Arquivo: `firestore.rules`

Estado atual:
- A regra antiga permitia `read, write` em todos os documentos ate a data de expiracao.

Impacto:
- O modelo anterior nao valida colecoes, campos, tipos, criacao, leitura, update ou delete.

### Storage com leitura publica ampla

Arquivo: `storage.rules`

Estado atual:
- Upload em `capturas/{comprovanteId}/{acessoId}/{imgId}` e limitado por tamanho e `image/jpeg`.
- `allow read: if true` permite leitura publica de capturas.
- `match /{allPaths=**}` tambem permite leitura publica geral.

Impacto:
- Arquivos enviados ao Storage podem ficar publicamente acessiveis.

### Dados sensiveis no fluxo

Arquivos principais:
- `src/views/ComprovanteFakeView.vue`
- `src/views/AcessosView.vue`

Dados envolvidos:
- IP publico.
- Informacoes de dispositivo.
- Geolocalizacao, quando permitida.
- Imagens, quando capturadas e enviadas.

Impacto:
- Exige revisao de privacidade, consentimento, retencao, acesso e linguagem de uso.

### Falta de testes e lint

Estado atual:
- Nao ha script `test`.
- Nao ha script `lint`.

Impacto:
- Correcoes futuras dependem de build e verificacao manual ate que checks sejam adicionados.

## Contratos De Dados Observados

### Colecao `comprovantes`

Criada em `src/views/GerarView.vue`.

Campos observados:
- `instituicao`
- `nomePagador`
- `cpfPagador`
- `valor`
- `descricao`
- `dataHora`
- `nomePilantra`
- `cpfPilantra`
- `cnpjPilantra`
- `chavePixPilantra`
- `tipoChavePixPilantra`
- `expiracao`

### Colecao `acessos`

Criada em `src/views/ComprovanteFakeView.vue`.

Campos observados:
- `comprovanteId`
- `at`
- `publicIp`
- dados retornados por `Device.getInfo()`
- `deviceId`
- dados de geolocalizacao, quando permitidos

Consulta observada:
- Colecao `acessos`.
- Filtro `where("comprovanteId", "==", comprovanteId)`.
- Ordenacao `orderBy("at", "desc")`.

### Storage `capturas`

Caminho observado:
- `/capturas/{comprovanteId}/{acessoId}/{timestamp}`

## Proximas Specs

- `docs/sdd/0001-hardening-seguranca.md`: corrigir seguranca, privacidade, rules e dependencias vulneraveis.
- `docs/sdd/0002-restaurar-funcionamento.md`: restaurar fluxo funcional do app e tratar erros de runtime/build.
- `docs/sdd/0003-documentacao-simples.md`: simplificar README e separar documentacao tecnica.

