# 0004 - Cloud Functions Agendada

## Status

Planejada

## Problema

Comprovantes, acessos e capturas possuem dados sensiveis e hoje dependem apenas da expiracao de leitura definida no cliente e nas Firebase Rules. Depois da expiracao, os dados deixam de ser publicamente acessiveis, mas continuam armazenados no Firestore e no Storage. O projeto precisa de uma rotina de backend agendada para remover dados expirados e reduzir retencao desnecessaria.

## Escopo

- Adicionar Firebase Cloud Functions ao projeto.
- Criar uma Cloud Function agendada para limpeza periodica.
- Remover comprovantes expirados no Firestore.
- Remover acessos associados aos comprovantes expirados.
- Remover capturas no Storage associadas aos comprovantes expirados.
- Definir configuracao de runtime, regiao, agenda e timezone.
- Registrar logs operacionais da execucao.
- Atualizar configuracao Firebase necessaria para deploy da function.
- Atualizar documentacao de seguranca e operacao.
- Adicionar verificacao automatizada ou script de apoio para validar a limpeza.

## Fora De Escopo

- Implementar a function nesta etapa de planejamento.
- Alterar o fluxo visual do app.
- Alterar o tempo de expiracao de comprovantes criado pelo cliente.
- Criar painel administrativo.
- Fazer deploy em producao sem validacao local.
- Migrar dados historicos manualmente fora da rotina agendada.
- Substituir Firebase por backend proprio.

## Requisitos

- R1: O projeto deve ter estrutura `functions/` compativel com Firebase Cloud Functions.
- R2: A function agendada deve executar em intervalo previsivel e documentado.
- R3: A limpeza deve considerar como expirado todo comprovante com `expiracao <= now`.
- R4: A rotina deve excluir o documento de `comprovantes/{comprovanteId}` expirado.
- R5: A rotina deve excluir todos os documentos de `acessos` vinculados ao `comprovanteId` expirado.
- R6: A rotina deve excluir objetos de Storage em `capturas/{ownerUid}/{comprovanteId}/**`.
- R7: A rotina deve usar Firebase Admin SDK, sem depender de permissoes do cliente ou relaxar Firebase Rules.
- R8: A rotina deve processar dados em lotes para evitar timeout e limites de escrita.
- R9: A rotina deve ser idempotente; reexecucoes nao devem falhar se algum documento ou arquivo ja tiver sido removido.
- R10: A rotina deve registrar logs com contagem de comprovantes, acessos e arquivos removidos, alem de erros por item quando houver falha parcial.
- R11: A configuracao deve permitir emulacao local da function quando viavel.
- R12: A documentacao deve informar pre-requisitos de deploy, custo operacional esperado e servicos Firebase necessarios.

## Criterios De Aceite

- AC1: Existe diretorio `functions/` com package proprio, codigo-fonte da function e scripts de build/teste quando aplicavel.
- AC2: `firebase.json` declara a configuracao de Cloud Functions sem remover Firestore, Storage ou Hosting existentes.
- AC3: A function agendada usa uma agenda documentada, por exemplo diaria, com timezone explicito.
- AC4: Dado um comprovante expirado, a rotina remove o comprovante, seus acessos e suas capturas associadas.
- AC5: Dado um comprovante nao expirado, a rotina nao remove o comprovante, seus acessos nem suas capturas.
- AC6: A rotina consegue continuar processando outros itens quando um arquivo ou acesso ja nao existe.
- AC7: Nenhuma regra de Firestore ou Storage e ampliada para permitir a limpeza pelo cliente.
- AC8: Ha verificacao automatizada ou script local que monta dados expirados e nao expirados e valida o resultado da limpeza.
- AC9: `docs/security.md` ou README documenta a politica de retencao e a limpeza agendada.
- AC10: O plano de deploy informa que Cloud Scheduler/Cloud Functions podem gerar custos e precisam estar habilitados no projeto Firebase.

## Plano De Acao

1. Inspecionar o modelo atual de `comprovantes`, `acessos` e `capturas` no frontend, Firebase Rules e testes de rules.
2. Definir parametros operacionais da limpeza: regiao, timezone, frequencia, tamanho de lote e limite maximo por execucao.
3. Inicializar estrutura `functions/` com Firebase Functions v2 e Admin SDK, mantendo o app Vue inalterado.
4. Extrair a logica de limpeza para uma funcao testavel que receba referencias de Firestore e Storage.
5. Implementar a Cloud Function agendada chamando a logica de limpeza em lotes.
6. Atualizar `firebase.json` para incluir Cloud Functions.
7. Criar teste ou script de verificacao local para dados expirados, dados validos e capturas ausentes.
8. Atualizar `docs/security.md`, README e, se necessario, `.env.example` com retencao, deploy e custos.
9. Rodar verificacoes locais.
10. Preparar comando de deploy apenas para functions quando a validacao estiver concluida.

## Plano De Verificacao

- Check para R1 e R2: Conferir `functions/package.json`, codigo da function e configuracao em `firebase.json`.
- Check para R3, R4 e R5: Testar limpeza de comprovante expirado com acessos associados.
- Check para R6: Testar exclusao de objetos em `capturas/{ownerUid}/{comprovanteId}/`.
- Check para R7: Conferir que `firestore.rules` e `storage.rules` nao receberam permissoes extras para limpeza.
- Check para R8 e R9: Testar lotes pequenos e reexecucao sobre os mesmos dados.
- Check para R10: Conferir logs de execucao em sucesso e falha parcial.
- Check para R11: Rodar emulador ou script local equivalente quando suportado.
- Check para R12: Conferir documentacao atualizada.
- Verificacoes gerais: `npm run build`, `npm audit`, `npm run test:rules` e testes/scripts do diretorio `functions/`.

## Riscos

- Risco: Cloud Scheduler e Cloud Functions exigem plano/projeto Firebase com servicos habilitados e podem gerar custo.
- Mitigacao: Documentar pre-requisitos e manter frequencia conservadora.

- Risco: Excluir comprovante antes de acessos e capturas pode deixar dados orfaos em caso de falha parcial.
- Mitigacao: Excluir dependencias antes do comprovante e tornar a rotina idempotente para reprocessar pendencias.

- Risco: Consultar muitos comprovantes expirados em uma unica execucao pode exceder limites de tempo ou escrita.
- Mitigacao: Processar por lotes, limitar a quantidade por execucao e registrar progresso por logs.

- Risco: Falhas no Storage podem impedir limpeza completa de capturas.
- Mitigacao: Tratar `not found` como sucesso e registrar falhas recuperaveis para a proxima execucao.

## Notas

- A rotina deve usar credenciais de servidor via Admin SDK; ela nao deve depender de usuario anonimo.
- A ordem preferida de limpeza e: capturas, acessos e, por ultimo, comprovante.
- Frequencia inicial sugerida: diaria, em timezone `America/Manaus`, salvo decisao diferente antes da implementacao.
- Limite inicial sugerido: ate 100 comprovantes expirados por execucao, ajustavel apos testes.
