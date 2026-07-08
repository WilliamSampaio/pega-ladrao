# Seguranca E Privacidade

## Estado Atual

O projeto usa Firebase diretamente no cliente. Por isso, a seguranca depende principalmente de Firebase Authentication anonimo, Firestore Rules, Storage Rules e validacao dos dados enviados pelo cliente.

## Decisoes Implementadas

- A pagina de acessos exige usuario anonimo autenticado.
- Cada comprovante recebe ownerUid no momento da criacao.
- Apenas o mesmo ownerUid pode ler os acessos e capturas associados ao comprovante.
- A rota publica /transacao?id=... pode ler somente comprovantes validos e nao expirados.
- Todo acesso cria um registro minimo com data, comprovanteId e informacoes basicas de navegador.
- Evidencias sensiveis, como IP publico, dispositivo, localizacao e foto, sao registradas somente quando o visitante aciona explicitamente o botao Registrar evidencias.
- Fotos sao gravadas em capturas/{ownerUid}/{comprovanteId}/{acessoId}/{imgId}; a leitura fica restrita ao ownerUid autenticado.
- Leitura publica ampla do Storage foi removida.
- Updates e deletes pelo cliente foram bloqueados para comprovantes, acessos e capturas.

## Limitacoes

- Autenticacao anonima depende do armazenamento local do navegador. Se o usuario abrir /acessos em outro navegador ou dispositivo, o painel nao tera o mesmo ownerUid.
- Sem backend proprio, o link publico ainda precisa conseguir ler um comprovante valido para renderizar /transacao.
- O registro de evidencias sensiveis depende das permissoes do navegador e da acao explicita do visitante.
- Regras do Firebase devem ser publicadas junto com a aplicacao; mudar apenas o codigo local nao protege um ambiente ja publicado.

## Verificacao Recomendada

- npm audit
- npm run build
- npm run test:rules
- Testar criacao de comprovante.
- Testar leitura de /acessos?id=... no mesmo navegador.
- Testar bloqueio de /acessos?id=... em navegador anonimo diferente.
- Testar abertura de /transacao?id=... antes e depois da expiracao.
- Testar Registro de evidencias com permissoes concedidas e negadas.
