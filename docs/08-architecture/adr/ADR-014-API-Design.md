ADR-014 - API Design

## Statut

Accepte.

## Contexte

ADR-011 definit PGYS comme un monolithe modulaire API-first avec des frontieres strictes entre modules.

ADR-013 definit la strategie de persistance et interdit notamment l'acces Prisma depuis les controllers, le partage direct des modeles Prisma entre modules et la logique metier dans les repositories.

La Platform Map organise PGYS en niveaux Platform, Business Modules, Applications et Extensions. Les API doivent respecter cette organisation afin d'etre coherentes, stables, versionnables et reutilisables.

## Decision

PGYS adopte une convention REST API-first commune a tous les modules.

Les API sont exposees en JSON, documentees par OpenAPI/Swagger et versionnees des la premiere version publique.

Les routes, erreurs, validations, paginations et conventions de filtrage doivent rester uniformes entre modules.

## Principes generaux

L'API PGYS est REST et API-first.

Toute route publique doit etre versionnee.

Le prefixe de version obligatoire est :

```text
/api/v1
```

JSON est le format d'echange officiel.

OpenAPI/Swagger est la documentation officielle des contrats API.

Les contrats API doivent etre stables, explicites et compatibles avec les frontieres de modules definies par ADR-011.

## Organisation des routes

Les routes sont organisees par module ou domaine fonctionnel.

Exemples :

```text
/api/v1/workspaces
/api/v1/users
/api/v1/catalog/products
/api/v1/billing/subscriptions
```

Les routes Platform peuvent etre exposees directement au premier niveau fonctionnel lorsque le module est transversal.

Les routes Business doivent etre groupees par module metier lorsque cela clarifie la responsabilite.

Une route ne doit pas exposer l'organisation interne du code, les noms de tables ou les details Prisma.

## Verbes HTTP

Les verbes HTTP sont utilises selon leur sens standard.

`GET` recupere une ressource ou une collection.

`POST` cree une ressource ou declenche une commande de creation.

`PUT` remplace une ressource ou applique une mise a jour complete lorsque le contrat le precise.

`PATCH` applique une mise a jour partielle.

`DELETE` supprime ou desactive une ressource selon le contrat documente.

Les verbes detournes sont interdits.

Exemples interdits :

- `GET` qui modifie un etat ;
- `POST /delete` pour supprimer une ressource ;
- `POST /update` pour remplacer `PUT` ou `PATCH` ;
- action cachee dans un parametre de query.

## Pagination

Les collections qui peuvent croitre doivent etre paginees.

La convention unique est :

```json
{
  "page": 1,
  "pageSize": 20,
  "total": 125,
  "items": []
}
```

`page` commence a 1.

`pageSize` doit etre borne par l'API.

`total` represente le nombre total d'elements correspondant a la requete.

`items` contient les elements de la page courante.

## Filtrage, tri et recherche

Les conventions de query parameters sont :

- `filter` pour les filtres structures ;
- `sort` pour le tri ;
- `search` pour la recherche textuelle.

`filter` doit rester explicite et documente par endpoint.

`sort` utilise les champs autorises par le contrat API.

`search` ne doit pas remplacer des filtres metier precis.

Les parametres non documentes ne doivent pas produire de comportement implicite.

## Gestion des erreurs

Les erreurs API utilisent un format uniforme.

Format attendu :

```json
{
  "code": "WORKSPACE_NOT_FOUND",
  "message": "Workspace not found",
  "details": {},
  "correlationId": "..."
}
```

`code` est un identifiant stable exploitable par les clients.

`message` est lisible par un developpeur.

`details` contient des informations complementaires lorsque cela est utile, par exemple les erreurs de validation.

`correlationId` permet de relier une erreur aux logs et traces serveur.

Les erreurs ne doivent pas exposer de details internes sensibles.

## Validation

La validation cote API est obligatoire.

Chaque payload entrant doit etre valide par un DTO dedie ou un contrat equivalent.

Les DTO sont separes des modeles de persistance.

Les modeles Prisma ne doivent jamais etre exposes directement dans les contrats API.

Les reponses API doivent etre controlees par des entites, vues ou serializers adaptes au contrat public.

## Securite

L'authentification standard repose sur JWT.

L'autorisation est basee sur des permissions ou roles explicites selon le module concerne.

Le controle du Workspace est systematique pour toute ressource rattachee a un Workspace.

Une API ne doit jamais se fier uniquement a un identifiant fourni par le client sans verifier le droit d'acces correspondant.

Les donnees sensibles ne doivent pas etre retournees par defaut.

## Principes interdits

Les pratiques suivantes sont interdites :

- logique metier dans les controllers ;
- acces Prisma depuis les controllers ;
- exposition des entites internes ;
- exposition directe des modeles Prisma ;
- endpoints specifiques a un client ;
- routes non versionnees ;
- verbes HTTP detournes ;
- contrats implicites non documentes ;
- contournement des services publics d'un module.

## Consequences

Tous les modules PGYS partagent une convention API unique.

Les Applications peuvent consommer les API de maniere previsible.

OpenAPI/Swagger devient la reference officielle pour les contrats REST.

Les controllers restent minces et deleguent la logique aux services.

Les modules conservent leurs frontieres internes tout en exposant des contrats publics stables.
