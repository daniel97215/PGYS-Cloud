# Contexte PGYS pour agents IA

## Produit

PGYS est une plateforme française de solutions numériques pour indépendants,
TPE, PME et associations. Elle couvre quatre offres complémentaires :

- PGYS Cloud pour le stockage et le partage de fichiers ;
- PGYS Apps pour les applications métier personnalisées ;
- PGYS Hosting pour l’hébergement et la maintenance ;
- PGYS Backup pour les sauvegardes externalisées.

Les solutions doivent rester simples, fiables, transparentes et adaptées aux
petites structures. Le cloud est une brique du produit, pas son unique finalité.

## Architecture

Le dépôt est un monorepo TypeScript géré avec pnpm et Turborepo. L’architecture
cible comprend :

- `apps/website` : site public Next.js ;
- `apps/admin` : administration interne Next.js ;
- `apps/api` : API métier NestJS ;
- `packages/` : UI, configuration et types partagés ;
- `infra/` : Docker Compose, scripts et sauvegardes ;
- `docs/` : décisions produit, techniques et opérationnelles.

PostgreSQL stocke les données métier PGYS. Nextcloud reste le moteur de PGYS
Cloud et conserve MariaDB pour ses propres données. L’API contrôle les
opérations sensibles et les secrets sont fournis exclusivement par
l’environnement.

## Principes de travail

- lire les documents obligatoires indiqués dans `.ai/RULES.md` ;
- implémenter uniquement le ticket demandé ;
- respecter l’architecture et les conventions existantes ;
- privilégier une solution TypeScript simple et maintenable ;
- ne pas ajouter de dépendance sans nécessité démontrée ;
- ne jamais versionner de secret ni de donnée client ;
- vérifier le build, le lint et les types après modification ;
- documenter brièvement les changements et les décisions importantes.

En cas de divergence, les documents détaillés de `docs/` et le ticket courant
priment sur ce résumé.
