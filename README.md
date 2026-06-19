# PGYS

PGYS est une plateforme francaise de solutions numeriques destinee aux
independants, TPE, PME et associations. Elle regroupe PGYS Cloud, des
applications metier sur mesure, de l'hebergement, de la maintenance et des
sauvegardes.

## Etat du projet

Le projet est en cours de construction. Le depot contient actuellement le site
public et les fondations du monorepo. Les espaces d'administration, l'API et les
packages partages seront ajoutes selon la [feuille de route](docs/06-ROADMAP.md).

## Architecture

PGYS est un monorepo TypeScript gere avec pnpm et Turborepo.

```text
apps/
  website/   Site public Next.js
  admin/     Administration interne (prevue)
  api/       API metier NestJS (prevue)
packages/
  ui/        Composants partages (prevus)
  config/    Configuration partagee (prevue)
  types/     Types partages (prevus)
infra/       Infrastructure et scripts d'exploitation
docs/        Documentation produit et technique
.ai/         Contexte et regles pour les agents IA
```

Les decisions structurantes sont detaillees dans
[la documentation d'architecture](docs/02-ARCHITECTURE.md).

## Prerequis

- Node.js 20 ou version ulterieure ;
- pnpm 11.

## Installation

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Le site est ensuite accessible par defaut sur `http://localhost:3000`.

## Commandes

```bash
pnpm dev        # lance les applications en developpement
pnpm build      # construit les applications et packages
pnpm lint       # execute les controles ESLint
pnpm typecheck  # verifie les types TypeScript
```

## Documentation

Le point d'entree de la documentation se trouve dans [docs/README.md](docs/README.md).
Avant toute contribution, consulter en particulier la vision, le produit,
l'architecture et les conventions de developpement.

## Contribution

Les contributions doivent suivre [CONTRIBUTING.md](CONTRIBUTING.md) et le
[code de conduite](CODE_OF_CONDUCT.md). Les changements sont proposes au moyen
d'une issue et d'une pull request ciblee.

## Securite

Ne publiez jamais de secret ou de donnee client dans une issue ou dans Git.
Les principes de securite du projet sont documentes dans
[docs/09-SECURITE.md](docs/09-SECURITE.md).

## Licence

Ce projet est distribue sous licence ISC. Voir [LICENSE](LICENSE).
