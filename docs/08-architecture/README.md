# PGYS — Architecture

## Rôle de la section Architecture

Cette section regroupe les documents techniques structurants de PGYS.

Les décisions techniques durables sont consignées dans les ADR. Le dossier [adr/](adr/) conserve l'historique logique des décisions existantes sans en modifier le fond.

## ADR existants

- [ADR-001-Workspace-First.md](adr/ADR-001-Workspace-First.md)
- [ADR-002-Product-Catalog.md](adr/ADR-002-Product-Catalog.md)
- [ADR-003-Authentication.md](adr/ADR-003-Authentication.md)
- [ADR-004-Provisioning-Providers.md](adr/ADR-004-Provisioning-Providers.md)
- [ADR-005-Billing-Architecture.md](adr/ADR-005-Billing-Architecture.md)
- [ADR-006-Identity-Permissions.md](adr/ADR-006-Identity-Permissions.md)
- [ADR-007-Pricing-Engine.md](adr/ADR-007-Pricing-Engine.md)
- [ADR-008-Partner-Model.md](adr/ADR-008-Partner-Model.md)
- [ADR-009-Even-Bus.md](adr/ADR-009-Even-Bus.md)
- [ADR-010-Multi-Tenacy.md](adr/ADR-010-Multi-Tenacy.md)

Les ADR contiennent les décisions techniques structurantes et ne doivent pas être réécrits lors d'une réorganisation documentaire.

## Document d'architecture initial
## Objectif

Lâ€™architecture PGYS doit rester simple, maintenable et Ã©volutive.

Le projet doit Ã©viter les architectures prÃ©maturÃ©ment complexes. Un monorepo TypeScript, Docker, PostgreSQL et Nextcloud suffisent pour dÃ©marrer.

## Vue gÃ©nÃ©rale

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

Structure recommandÃ©e :

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

RÃ´le :

- prÃ©senter lâ€™entreprise ;
- prÃ©senter PGYS Cloud ;
- prÃ©senter les applications mÃ©tier ;
- prÃ©senter lâ€™hÃ©bergement ;
- gÃ©nÃ©rer des leads.

Technologie :

- Next.js ;
- TypeScript ;
- Tailwind CSS.

### apps/admin

Interface dâ€™administration interne.

RÃ´le :

- gÃ©rer les clients ;
- gÃ©rer les offres ;
- crÃ©er les comptes ;
- suivre les quotas ;
- consulter les services ;
- dÃ©clencher certaines actions Nextcloud.

### apps/api

API mÃ©tier PGYS.

RÃ´le :

- centraliser la logique mÃ©tier ;
- gÃ©rer les clients ;
- gÃ©rer les abonnements ;
- piloter Nextcloud ;
- gÃ©rer les emails ;
- exposer les donnÃ©es aux interfaces.

Technologie :

- NestJS ;
- TypeScript ;
- Prisma ;
- PostgreSQL.

## Base de donnÃ©es

PostgreSQL est utilisÃ©e pour les donnÃ©es PGYS :

- clients ;
- contrats ;
- offres ;
- services ;
- factures ;
- utilisateurs PGYS ;
- logs mÃ©tier.

MariaDB reste utilisÃ©e uniquement par Nextcloud.

## Nextcloud

Nextcloud est le moteur de PGYS Cloud.

PGYS ne modifie pas profondÃ©ment le cÅ“ur Nextcloud. PGYS utilise :

- lâ€™interface web Nextcloud ;
- les commandes `occ` ;
- les API disponibles ;
- la configuration de branding.

## Communication entre services

Lâ€™API PGYS doit contrÃ´ler les opÃ©rations sensibles.

Exemples :

- crÃ©ation dâ€™un compte cloud ;
- modification dâ€™un quota ;
- suspension dâ€™un client ;
- envoi dâ€™un email de bienvenue.

## Principes

- Pas de secrets dans Git.
- Configuration via `.env`.
- Docker pour tous les services.
- Logs accessibles.
- Sauvegardes documentÃ©es.
- DÃ©ploiement reproductible.
- Pas de microservices inutiles.
- Pas de Kubernetes au dÃ©marrage.

## DÃ©cisions techniques

### Pourquoi Next.js

- SEO ;
- bon Ã©cosystÃ¨me ;
- adaptÃ© aux sites publics et dashboards ;
- TypeScript natif.

### Pourquoi NestJS

- structure claire ;
- adaptÃ© aux API maintenables ;
- injection de dÃ©pendances ;
- modules propres.

### Pourquoi PostgreSQL

- robuste ;
- adaptÃ© aux donnÃ©es mÃ©tier ;
- standard professionnel.

### Pourquoi Docker

- reproductibilitÃ© ;
- portabilitÃ© ;
- isolation ;
- facilitÃ© de dÃ©ploiement.

## Ã‰volution future

Quand PGYS grandira, lâ€™architecture pourra Ã©voluer vers :

- plusieurs serveurs applicatifs ;
- stockage objet ;
- sauvegardes multi-sites ;
- CI/CD plus avancÃ© ;
- SSO ;
- monitoring centralisÃ© ;
- sÃ©paration stricte des environnements.

