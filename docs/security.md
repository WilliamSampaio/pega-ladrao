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
- Uma Cloud Function agendada remove dados expirados pelo backend usando Firebase Admin SDK, sem depender de permissoes do cliente.

## Retencao E Limpeza Agendada

- Comprovantes continuam sendo criados com o tempo de expiracao definido no cliente.
- A limpeza considera expirado todo comprovante com expiracao menor ou igual ao horario da execucao.
- A function `limparDadosExpirados` roda diariamente as 03:00 no timezone `America/Manaus`.
- A ordem de remocao e: capturas em `capturas/{ownerUid}/{comprovanteId}/`, acessos vinculados ao `comprovanteId` e, por ultimo, o comprovante.
- A execucao inicial processa ate 100 comprovantes expirados por vez. Reexecucoes sao idempotentes para tolerar arquivos ou documentos ja removidos.
- Os logs registram quantos comprovantes, acessos e arquivos foram removidos, alem de erros por item quando houver falha parcial.

## Limitacoes

- Autenticacao anonima depende do armazenamento local do navegador. Se o usuario abrir /acessos em outro navegador ou dispositivo, o painel nao tera o mesmo ownerUid.
- Sem backend proprio, o link publico ainda precisa conseguir ler um comprovante valido para renderizar /transacao.
- O registro de evidencias sensiveis depende das permissoes do navegador e da acao explicita do visitante.
- Regras do Firebase devem ser publicadas junto com a aplicacao; mudar apenas o codigo local nao protege um ambiente ja publicado.
- Cloud Functions e Cloud Scheduler podem exigir servicos habilitados no projeto Firebase e podem gerar custo operacional conforme o plano e a quantidade de execucoes.

## Verificacao Recomendada

- npm audit
- npm run build
- npm run test:rules
- npm --prefix functions test
- npm --prefix functions run check
- Testar criacao de comprovante.
- Testar leitura de /acessos?id=... no mesmo navegador.
- Testar bloqueio de /acessos?id=... em navegador anonimo diferente.
- Testar abertura de /transacao?id=... antes e depois da expiracao.
- Testar Registro de evidencias com permissoes concedidas e negadas.
