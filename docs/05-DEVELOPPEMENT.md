# PGYS — Développement

## Objectif

Définir les règles de développement du projet PGYS.

## Langage

TypeScript est utilisé pour :

- le site ;
- l’administration ;
- l’API ;
- les packages partagés.

## Package manager

Le projet utilise pnpm.

Commandes principales :

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
```

## Monorepo

Le monorepo contient :

```text
apps/
packages/
infra/
docs/
.ai/
```

## Branches Git

Branches recommandées :

- `main` : code stable ;
- `develop` : développement courant ;
- branches feature : `feature/pgys-xxx-description`.

## Commits

Format recommandé :

```text
type(scope): message
```

Exemples :

```text
docs: add product documentation
feat(website): add hero section
fix(api): validate customer email
chore: update dependencies
```

## Qualité

Avant merge :

- le build passe ;
- le lint passe ;
- les types passent ;
- le code est relu ;
- le ticket est respecté.

## Secrets

Interdit :

- mot de passe dans le code ;
- token dans Git ;
- clé API dans un commit.

Obligatoire :

- `.env`;
- `.env.example`;
- variables documentées.

## Style frontend

- composants réutilisables ;
- Tailwind CSS ;
- responsive ;
- accessibilité ;
- pas de logique métier dans les composants UI.

## Style backend

- modules NestJS séparés ;
- DTOs validés ;
- services testables ;
- Prisma pour la base ;
- erreurs explicites.

## Documentation

Chaque fonctionnalité importante doit être documentée.

## Règle principale

Le code doit être compréhensible six mois plus tard.
