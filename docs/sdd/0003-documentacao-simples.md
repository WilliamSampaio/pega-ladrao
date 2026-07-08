# 0003 - Documentacao Simples

## Status

Implementada

## Problema

O README atual explica o contexto do projeto, mas nao e suficiente como guia simples para configurar, rodar, verificar e manter o app. A documentacao tambem precisa refletir seguranca, privacidade, SDD e limitacoes do projeto.

## Escopo

- Reescrever `README.md` com foco em uso simples.
- Separar detalhes tecnicos em `docs/`.
- Documentar configuracao Firebase.
- Documentar variaveis de ambiente.
- Documentar comandos locais.
- Documentar verificacao basica.
- Documentar fluxo SDD.

## Fora De Escopo

- Criar site de documentacao.
- Criar tutorial longo.
- Documentar internals que nao ajudem usuario ou mantenedor.

## Requisitos

- R1: README deve explicar o que e o projeto em poucas linhas.
- R2: README deve informar requisitos para rodar localmente.
- R3: README deve explicar `.env.local` usando `.env.example`.
- R4: README deve listar comandos principais.
- R5: README deve explicar Firebase Rules e deploy em alto nivel.
- R6: README deve apontar para `docs/sdd/`.
- R7: README deve conter aviso claro de uso responsavel.

## Criterios De Aceite

- AC1: Uma pessoa nova consegue instalar, configurar e rodar o projeto seguindo o README.
- AC2: O README nao depende de narrativa longa para explicar o uso.
- AC3: Os comandos documentados existem em `package.json`.
- AC4: A documentacao aponta para specs SDD ativas.
- AC5: As limitacoes de seguranca, privacidade e ambiente estao visiveis.

## Plano De Execucao

1. Revisar README atual e preservar apenas informacoes uteis.
2. Criar estrutura simples: objetivo, requisitos, configuracao, comandos, Firebase, SDD e troubleshooting.
3. Atualizar links para specs e arquivos de configuracao.
4. Revisar se os comandos documentados funcionam.
5. Remover informacoes desatualizadas.

## Plano De Verificacao

- Conferir comandos contra `package.json`.
- Conferir variaveis contra `.env.example`.
- Conferir links locais.
- Revisar README como usuario novo.

## Riscos

- Risco: Simplificar demais pode esconder detalhes importantes de seguranca.
- Mitigacao: Manter README curto e apontar para documentos tecnicos em `docs/`.

## Notas De Implementacao

- README reescrito com objetivo, requisitos, configuracao, comandos, fluxo de uso, Firebase, SDD e troubleshooting.
- Variaveis documentadas a partir de .env.example sem expor valores locais.
- Comandos conferidos contra package.json.
- Links para docs/security.md e docs/sdd/ adicionados.
