ADR-013 - Persistence Strategy

## Statut

Accepte.

## Contexte

ADR-011 definit PGYS comme un monolithe modulaire API-first avec des frontieres strictes entre modules.

ADR-012 definit un Shared Kernel petit, stable et controle, sans logique metier ni acces Prisma.

La Platform Map organise PGYS en niveaux Platform, Business Modules, Applications et Extensions. La persistance doit respecter ces frontieres afin de garder la plateforme coherente, maintenable et evolutive.

PGYS doit aussi rester compatible avec l'architecture multi-tenant definie par ADR-010 : les donnees applicatives sont rattachees a un Workspace lorsque le domaine le requiert.

## Decision

PGYS utilise PostgreSQL comme base principale et Prisma comme ORM officiel.

PGYS utilise une seule base de donnees applicative.

La persistance est organisee par module. Chaque module possede ses propres repositories et controle l'acces a ses donnees.

Les autres modules passent par les services publics du module proprietaire ou par des evenements metier lorsque le couplage direct n'est pas necessaire.

## Organisation

PostgreSQL est la base de donnees principale de PGYS.

Prisma est l'ORM officiel pour acceder aux donnees applicatives.

La plateforme utilise une seule base de donnees afin de limiter la complexite operationnelle au stade actuel.

Les donnees multi-tenant respectent le principe Workspace-first : les entites qui appartiennent a un client, une organisation ou un usage metier doivent etre rattachees a un Workspace.

Les separations entre modules sont des frontieres de code et de contrat, pas des bases de donnees separees.

## Acces aux donnees

Chaque module possede ses propres repositories.

Un module ne doit pas acceder directement aux repositories d'un autre module.

Un module ne doit pas lire ou modifier directement les tables internes d'un autre module.

Les acces inter-modules passent uniquement par :

- des services publics explicitement exposes ;
- des contrats API internes stables ;
- des evenements metier lorsque la reaction peut etre asynchrone.

Les controllers ne doivent jamais acceder directement a Prisma.

## Transactions

Une transaction doit etre utilisee lorsqu'une operation doit garantir la coherence atomique de plusieurs ecritures.

Exemples d'utilisation :

- creation d'une entite principale et de ses dependances obligatoires ;
- changement d'etat qui doit rester coherent avec un journal d'audit ;
- operation courte impliquant plusieurs tables du meme module ;
- operation qui doit echouer integralement si une etape echoue.

Les transactions doivent rester courtes.

Les transactions longues sont a eviter, notamment lorsqu'elles incluent :

- des appels reseau ;
- des appels a des fournisseurs externes ;
- des operations de fichier ;
- des traitements longs ;
- des attentes utilisateur.

Lorsqu'un processus depasse le cadre d'une transaction courte, il doit etre decoupe en etapes explicites et coordonne par des evenements ou par une file de traitement.

## Identifiants

Les UUID sont les identifiants externes de reference.

Ils sont utilises dans les API, les relations publiques entre modules et les references exposees hors de la base.

Des IDs internes peuvent etre utilises uniquement pour des besoins de persistance ou d'optimisation si cela devient necessaire.

Un ID interne ne doit pas devenir un contrat public.

## Historisation

Les operations importantes doivent pouvoir etre auditees.

L'audit doit couvrir les changements structurants, les changements de statut, les actions sensibles et les operations impactant un Workspace.

Le soft delete est a privilegier lorsque la suppression logique est utile pour :

- conserver l'historique ;
- permettre une restauration ;
- proteger la coherence des references ;
- respecter des besoins d'audit.

La suppression physique reste exceptionnelle.

Elle peut etre utilisee pour des donnees techniques temporaires, des donnees sans valeur historique ou des obligations explicites de purge.

## Evolutions du schema

Toute evolution du schema de base de donnees passe par une migration Prisma.

Les migrations doivent etre versionnees dans le depot.

Une modification manuelle du schema en production est interdite.

Les changements de schema doivent etre compatibles avec les frontieres de modules et ne doivent pas introduire d'acces direct entre modules.

Lorsqu'une migration modifie un concept structurant, elle doit etre accompagnee d'une justification dans le ticket ou dans un ADR si la decision est durable.

## Performance

La pagination est obligatoire pour les listes qui peuvent croitre.

Les requetes N+1 doivent etre evitees.

L'indexation doit etre reflechie en fonction :

- des filtres frequents ;
- des tris principaux ;
- des relations critiques ;
- des contraintes d'unicite ;
- des besoins multi-tenant par Workspace.

Les optimisations doivent etre basees sur des mesures.

Une optimisation ne doit pas contourner les frontieres de modules sans decision explicite.

## Principes interdits

Les pratiques suivantes sont interdites :

- SQL disperse dans les services ;
- acces Prisma depuis les controllers ;
- partage direct des modeles Prisma entre modules ;
- logique metier dans les repositories ;
- acces direct aux repositories d'un autre module ;
- contournement d'un service public pour lire ou modifier les donnees internes d'un module ;
- modification manuelle du schema en production ;
- exposition d'IDs internes comme contrat public.

## Consequences

PGYS garde une strategie de persistance simple et compatible avec le monolithe modulaire.

Les modules restent proprietaires de leurs donnees et de leurs repositories.

Prisma centralise l'acces technique a PostgreSQL, mais ne remplace pas les contrats publics entre modules.

Les evolutions de schema restent tracables par migration.

La plateforme peut evoluer plus tard vers des extractions de services si les frontieres de persistance et les contrats publics sont respectes des maintenant.
