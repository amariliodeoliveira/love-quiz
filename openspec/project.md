# Love Quiz — Project Context

## Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4
- `@vercel/postgres` for data access
- Vitest for tests

## Conventions
- Este repositório roda uma versão do Next.js com breaking changes em relação ao que os LLMs conhecem por padrão. Antes de implementar qualquer coisa que toque em rotas, APIs de servidor ou convenções do framework, consulte `node_modules/next/dist/docs/` (ver [AGENTS.md](../AGENTS.md)).
- Componentes de UI ficam em pastas `_components/` próximas da rota que os usa (ex.: `src/app/_components/`, `src/app/profile/_components/`).
- Lógica compartilhada fica em `src/lib/`.

## Estrutura do OpenSpec
- `openspec/project.md` — este arquivo, contexto geral do projeto.
- `openspec/specs/` — especificações "as-built": o que já existe e como se comporta hoje.
- `openspec/changes/<nome-da-mudanca>/` — propostas de mudança em andamento (proposal + spec delta) antes de implementar. Depois de aplicada, a mudança correspondente deve ser refletida em `openspec/specs/` e a pasta em `changes/` pode ser arquivada ou removida.

Não há dependência de nenhuma ferramenta/pacote externo — esta é uma estrutura de arquivos markdown mantida manualmente.
