# 0002 - Restaurar Funcionamento

## Status

Planejada

## Problema

O projeto compila apos reinstalar dependencias, mas o funcionamento em Firebase tende a falhar porque as regras do Firestore expiraram em `2025-04-12`. Tambem ha avisos de build relacionados a variaveis de ambiente e tamanho de chunk.

## Escopo

- Restaurar build local.
- Corrigir bloqueios de runtime causados por Firebase Rules.
- Validar configuracao de `.env`.
- Garantir fluxo minimo do app.
- Melhorar mensagens de erro para falhas esperadas.
- Revisar indices do Firestore necessarios para consultas.

## Fora De Escopo

- Corrigir todo o visual.
- Adicionar novas funcionalidades.
- Fazer deploy automatico.
- Reescrever arquitetura.

## Requisitos

- R1: `npm install` deve restaurar dependencias.
- R2: `npm run build` deve concluir sem erro.
- R3: O app deve conseguir criar um comprovante valido.
- R4: O app deve conseguir abrir `/acessos?id=...`.
- R5: O app deve conseguir abrir `/transacao?id=...` para comprovante valido e nao expirado.
- R6: O app deve conseguir registrar um acesso.
- R7: Falhas de permissao, documento inexistente, comprovante expirado e configuracao ausente devem ter tratamento visivel ou rastreavel.
- R8: Variaveis de ambiente necessarias devem estar documentadas e ser verificaveis.

## Criterios De Aceite

- AC1: `npm run build` passa.
- AC2: O aviso de `%VITE_DEFAULT_COMPROVANTE_URL%` em `index.html` e resolvido ou documentado.
- AC3: O fluxo gerar -> acessos -> transacao -> acesso registrado funciona em ambiente configurado.
- AC4: Consultas de `acessos` possuem indice necessario, se o Firebase exigir.
- AC5: O usuario recebe feedback quando Firebase ou permissoes falham.

## Plano De Execucao

1. Confirmar build local apos `npm install`.
2. Revisar uso de variaveis `VITE_*` no app e no `index.html`.
3. Revisar fluxo `GerarView`, `AcessosView` e `ComprovanteFakeView`.
4. Corrigir tratamento de erro dos fluxos principais.
5. Ajustar indices do Firestore se necessario.
6. Validar manualmente os principais caminhos.

## Plano De Verificacao

- `npm install`.
- `npm run build`.
- Teste manual em `npm run dev`.
- Teste com Firebase configurado via `.env.local`.
- Revisao de console do navegador durante os fluxos principais.

## Riscos

- Risco: Sem projeto Firebase configurado localmente, parte da verificacao sera manual ou pendente.
- Mitigacao: Documentar exatamente quais variaveis e servicos sao necessarios.

- Risco: Correcoes de seguranca podem exigir mudancas no fluxo funcional.
- Mitigacao: Executar esta spec junto ou logo apos `0001-hardening-seguranca.md`.
