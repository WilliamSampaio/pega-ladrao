# 0001 - Hardening De Seguranca

## Status

Implementada

## Problema

O projeto possui riscos de seguranca e privacidade que impedem uso responsavel em producao. As regras atuais do Firestore estao expiradas desde `2025-04-12`, o Storage permite leitura publica ampla, o audit aponta vulnerabilidades em dependencias e o app manipula dados sensiveis como IP, dispositivo, localizacao e imagens.

## Escopo

- Revisar e corrigir Firebase Firestore Rules.
- Revisar e corrigir Firebase Storage Rules.
- Reduzir permissoes de leitura, escrita, update e delete.
- Validar dados gravados pelo cliente.
- Tratar vulnerabilidades reportadas por `npm audit`.
- Revisar linguagem de uso, privacidade e consentimento.
- Documentar decisoes de seguranca.

## Fora De Escopo

- Redesenhar a interface visual.
- Adicionar novos modelos de comprovante.
- Fazer deploy em producao.
- Implementar backend proprio, exceto se a revisao concluir que Firebase Rules nao sao suficientes.

## Requisitos

- R1: Firestore nao deve permitir leitura e escrita irrestritas.
- R2: Firestore deve validar colecoes, operacoes e campos esperados.
- R3: Storage nao deve permitir leitura publica ampla por padrao.
- R4: Uploads devem ter limite de caminho, tamanho e tipo.
- R5: Updates e deletes pelo cliente devem ser bloqueados quando nao forem necessarios.
- R6: O app deve lidar com dados sensiveis de forma explicita e documentada.
- R7: Vulnerabilidades conhecidas devem ser tratadas ou justificadas.
- R8: A documentacao deve deixar claro o uso responsavel e as limitacoes legais/eticas.

## Criterios De Aceite

- AC1: `firestore.rules` nao contem regra global `allow read, write`.
- AC2: `firestore.rules` nao depende de uma data de expiracao global para funcionar.
- AC3: `storage.rules` nao permite `allow read: if true` para todos os caminhos.
- AC4: Criacao de `comprovantes` e `acessos` aceita somente campos esperados e tipos compativeis.
- AC5: Update e delete de dados sensiveis pelo cliente sao bloqueados ou justificados.
- AC6: `npm audit` nao reporta vulnerabilidade critica, ou ha justificativa documentada com mitigacao.
- AC7: O README ou documento dedicado descreve privacidade, consentimento e uso responsavel.

## Plano De Execucao

1. Revisar todos os pontos onde o cliente le e grava Firestore e Storage.
2. Definir o contrato de dados de `comprovantes`, `acessos` e `capturas`.
3. Reescrever `firestore.rules` com validacoes por colecao.
4. Reescrever `storage.rules` com escopo minimo de leitura e upload.
5. Atualizar frontend para alinhar campos enviados com as rules.
6. Rodar `npm audit fix` de forma controlada e revisar mudancas.
7. Rodar build e verificacoes manuais dos fluxos principais.
8. Atualizar documentacao de seguranca.

## Plano De Verificacao

- `npm audit`.
- `npm run build`.
- Teste manual de criacao de comprovante.
- Teste manual de abertura de `/transacao?id=...`.
- Teste manual de registro de acesso.
- Teste manual de bloqueio de operacoes indevidas, quando emulator ou ambiente Firebase estiver disponivel.

## Riscos

- Risco: Regras muito restritivas podem quebrar o fluxo atual.
- Mitigacao: Implementar rules junto com testes manuais por fluxo.

- Risco: O modelo atual pode nao permitir controle de acesso adequado apenas no cliente.
- Mitigacao: Avaliar autenticacao, links com token ou backend intermediario.

## Notas De Implementacao

- Implementacao inicial registrada em docs/security.md.
- O fluxo publico foi reduzido para registrar apenas comprovanteId e at.
- A coleta automatica silenciosa foi substituida por registro minimo de acesso e registro explicito de evidencias sensiveis acionado pelo visitante.
