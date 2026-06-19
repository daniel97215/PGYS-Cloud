# PGYS — Architecture

## Objectif

L’architecture PGYS doit rester simple, maintenable et évolutive.

Le projet doit éviter les architectures prématurément complexes. Un monorepo TypeScript, Docker, PostgreSQL et Nextcloud suffisent pour démarrer.

## Vue générale

```text
Internet
  |
  v
Nginx Proxy Manager
  |
  +-- pgys.fr              -> Site vitrine
  +-- cloud.pgys.fr        -> Nextcloud / PGYS Cloud
  +-- admin.pgys.fr        -> Administration PGYS
  +-- api.pgys.fr          -> API PGYS
  +-- status.pgys.fr       -> Monitoring
```

## Monorepo

Structure recommandée :

```text
apps/
  website/
  admin/
  api/

packages/
  ui/
  config/
  types/

infra/
  compose/
  scripts/
  backup/

docs/
.ai/
```

## Applications

### apps/website

Site public PGYS.

Rôle :

- présenter l’entreprise ;
- présenter PGYS Cloud ;
- présenter les applications métier ;
- présenter l’hébergement ;
- générer des leads.

Technologie :

- Next.js ;
- TypeScript ;
- Tailwind CSS.

### apps/admin

Interface d’administration interne.

Rôle :

- gérer les clients ;
- gérer les offres ;
- créer les comptes ;
- suivre les quotas ;
- consulter les services ;
- déclencher certaines actions Nextcloud.

### apps/api

API métier PGYS.

Rôle :

- centraliser la logique métier ;
- gérer les clients ;
- gérer les abonnements ;
- piloter Nextcloud ;
- gérer les emails ;
- exposer les données aux interfaces.

Technologie :

- NestJS ;
- TypeScript ;
- Prisma ;
- PostgreSQL.

## Base de données

PostgreSQL est utilisée pour les données PGYS :

- clients ;
- contrats ;
- offres ;
- services ;
- factures ;
- utilisateurs PGYS ;
- logs métier.

MariaDB reste utilisée uniquement par Nextcloud.

## Nextcloud

Nextcloud est le moteur de PGYS Cloud.

PGYS ne modifie pas profondément le cœur Nextcloud. PGYS utilise :

- l’interface web Nextcloud ;
- les commandes `occ` ;
- les API disponibles ;
- la configuration de branding.

## Communication entre services

L’API PGYS doit contrôler les opérations sensibles.

Exemples :

- création d’un compte cloud ;
- modification d’un quota ;
- suspension d’un client ;
- envoi d’un email de bienvenue.

## Principes

- Pas de secrets dans Git.
- Configuration via `.env`.
- Docker pour tous les services.
- Logs accessibles.
- Sauvegardes documentées.
- Déploiement reproductible.
- Pas de microservices inutiles.
- Pas de Kubernetes au démarrage.

## Décisions techniques

### Pourquoi Next.js

- SEO ;
- bon écosystème ;
- adapté aux sites publics et dashboards ;
- TypeScript natif.

### Pourquoi NestJS

- structure claire ;
- adapté aux API maintenables ;
- injection de dépendances ;
- modules propres.

### Pourquoi PostgreSQL

- robuste ;
- adapté aux données métier ;
- standard professionnel.

### Pourquoi Docker

- reproductibilité ;
- portabilité ;
- isolation ;
- facilité de déploiement.

## Évolution future

Quand PGYS grandira, l’architecture pourra évoluer vers :

- plusieurs serveurs applicatifs ;
- stockage objet ;
- sauvegardes multi-sites ;
- CI/CD plus avancé ;
- SSO ;
- monitoring centralisé ;
- séparation stricte des environnements.
