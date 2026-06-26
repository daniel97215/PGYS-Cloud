# API PGYS

API métier PGYS construite avec NestJS, Prisma et PostgreSQL.

## Prérequis

- Node.js 20 ou version ultérieure ;
- pnpm 10.25 ;
- Docker avec Docker Compose.

## Installation

Depuis la racine du monorepo :

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
pnpm --filter api prisma validate
pnpm --filter api prisma:generate
```

Sous PowerShell, utiliser la commande suivante pour créer la configuration
locale :

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Prisma charge automatiquement `apps/api/.env`. La variable `DATABASE_URL`
doit pointer vers l'instance PostgreSQL locale décrite dans
`docker-compose.yml`. Les valeurs de `.env.example` sont réservées au
développement et doivent être adaptées si nécessaire.

Les variables `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` doivent contenir deux
valeurs aléatoires distinctes d'au moins 32 caractères. Les durées de vie sont
configurées avec `JWT_ACCESS_EXPIRES_IN` et `JWT_REFRESH_EXPIRES_IN`.

Le fichier `apps/api/.env` contient une configuration locale potentiellement
sensible : il est ignoré par Git et ne doit jamais être versionné. Seul
`apps/api/.env.example`, qui ne contient aucun secret réel, sert de modèle.

## PostgreSQL local

```bash
cd apps/api
docker compose up -d
cd ../..
pnpm --filter api prisma:migrate
```

Pour arrêter la base :

```bash
docker compose -f apps/api/docker-compose.yml down
```

Le volume PostgreSQL est conservé entre les redémarrages. Utiliser `down -v`
uniquement lorsqu’une suppression complète des données locales est souhaitée.

## Développement

```bash
pnpm --filter api start:dev
```

L’API écoute par défaut sur `http://localhost:3001`.

## Commandes

```bash
pnpm --filter api build
pnpm --filter api lint
pnpm --filter api typecheck
pnpm --filter api prisma:validate
pnpm --filter api prisma:generate
pnpm --filter api prisma:studio
```

## Endpoints

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Vérifie que l’API répond |
| `GET` | `/workspaces` | Liste les espaces clients |
| `GET` | `/workspaces/:id` | Retourne un espace client |
| `POST` | `/workspaces` | Crée un espace client |
| `GET` | `/workspace/profile` | Retourne le profil de l'organisation du workspace courant |
| `PUT` | `/workspace/profile` | Met à jour partiellement le profil de l'organisation |
| `POST` | `/auth/register` | Crée un utilisateur et une session |
| `POST` | `/auth/login` | Ouvre une session |
| `POST` | `/auth/refresh` | Renouvelle l'access token |
| `POST` | `/auth/logout` | Révoque la session |
| `GET` | `/auth/me` | Retourne l'utilisateur authentifié |

Exemple de création :

```bash
curl -X POST http://localhost:3001/workspaces \
  -H "Content-Type: application/json" \
  -d '{"name":"Entreprise Démo","slug":"entreprise-demo","billingEmail":"contact@example.test"}'
```

Le module Workspaces utilise PostgreSQL. Le healthcheck reste disponible même si
la base de données n’est pas démarrée.
