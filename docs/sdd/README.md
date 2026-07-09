# SDD

Este diretorio organiza o desenvolvimento por specs pequenas e verificaveis.

## Como Usar

1. Crie uma spec em `docs/sdd/NNNN-nome-da-mudanca.md`.
2. Descreva problema, escopo, requisitos e criterios de aceite.
3. Implemente apenas o que estiver coberto pela spec.
4. Atualize testes, checks e documentacao relacionados.
5. Registre a verificacao executada antes de concluir.

Toda mudanca de codigo, seja feature, bugfix, hotfix, refatoracao ou
configuracao, deve atualizar junto as docs, README, AGENTS, specs e testes ou
checks relacionados quando houver impacto em comportamento, comandos,
configuracao, seguranca ou fluxo de desenvolvimento.

## Estado Das Specs

| Spec                               | Status    | Objetivo                                                                 |
| ---------------------------------- | --------- | ------------------------------------------------------------------------ |
| `0001-hardening-seguranca.md`      | Planejada | Corrigir seguranca, privacidade, Firebase Rules e vulnerabilidades.      |
| `0002-restaurar-funcionamento.md`  | Planejada | Tornar o projeto funcional novamente.                                    |
| `0003-documentacao-simples.md`     | Planejada | Simplificar documentacao para usuarios e mantenedores.                   |
| `0004-cloud-functions-agendada.md` | Planejada | Remover comprovantes expirados, acessos e capturas por rotina agendada.  |
| `0005-refatoracao-frontend.md`     | Planejada | Refatorar o frontend com design system, mobile first e temas dark/light. |

## Padrao Minimo

Cada spec deve conter:

- Problema.
- Escopo.
- Fora de escopo.
- Requisitos.
- Criterios de aceite.
- Plano de execucao.
- Plano de verificacao.
- Riscos.

Use `template.md` como base.
