ADR-015 - Domain Events

## Statut

Accepte.

## Contexte

ADR-009 etablit que les actions importantes produisent des evenements metier.

ADR-011 definit PGYS comme un monolithe modulaire API-first avec des frontieres strictes entre modules.

ADR-014 definit les conventions API REST et rappelle que les controllers restent minces et deleguent la logique aux services.

La Platform Map separe PGYS en Platform, Business Modules, Applications et Extensions. Les Domain Events doivent soutenir cette separation en reduisant les dependances directes entre modules.

## Decision

PGYS utilise des Domain Events pour representer des faits metier passes et permettre aux modules de reagir sans couplage direct inutile.

Les Domain Events completent l'Event Bus defini par ADR-009. Ils ne le remplacent pas.

Un Domain Event est un contrat public entre modules. Il doit etre stable, versionne et documente.

## Objectif des Domain Events

Les Domain Events servent a :

- decoupler les modules metier ;
- eviter les dependances directes entre modules ;
- permettre l'evolution independante des modules ;
- signaler qu'un fait metier important s'est produit ;
- declencher des reactions asynchrones lorsque le resultat immediat n'est pas requis ;
- soutenir une extraction future de module si elle devient necessaire.

## Quand publier un evenement

Un evenement est publie lorsqu'un fait metier important s'est produit.

Le nom de l'evenement doit exprimer un fait passe.

Exemples :

- `WorkspaceCreated`
- `WorkspaceActivated`
- `UserInvited`
- `SubscriptionStarted`
- `SubscriptionCancelled`
- `ProductCreated`
- `CustomerCreated`
- `InvoiceIssued`
- `InvoicePaid`
- `PaymentRegistered`

Un evenement ne doit pas exprimer une intention ou une commande.

Exemples a eviter :

- `CreateWorkspace`
- `ActivateWorkspace`
- `SendInvoice`

Ces noms representent des actions a effectuer, pas des faits deja produits.

## Quand ne pas utiliser un evenement

Un evenement ne doit pas remplacer un appel synchrone necessaire.

Un evenement ne doit pas etre utilise pour retourner une valeur.

Un evenement ne doit pas etre utilise pour executer une logique immediate indispensable au resultat de la commande en cours.

Dans ces situations, il faut privilegier une interface publique du module concerne.

Exemples :

- verifier une permission avant une action ;
- calculer un prix necessaire a une reponse immediate ;
- valider l'existence d'un Workspace ;
- recuperer une donnee necessaire a une transaction courte.

## Contrat des evenements

Chaque evenement doit contenir au minimum :

- `eventId`
- `eventType`
- `occurredAt`
- `workspaceId`
- `aggregateId`
- `payload`
- `version`

`eventId` identifie de maniere unique l'evenement.

`eventType` identifie le type fonctionnel de l'evenement.

`occurredAt` indique la date de production du fait metier.

`workspaceId` rattache l'evenement au Workspace lorsque le domaine est tenant-aware.

`aggregateId` identifie l'entite metier principale concernee.

`payload` contient les donnees strictement necessaires aux consommateurs.

`version` identifie la version du contrat de l'evenement.

Le payload ne doit pas exposer inutilement les details internes du module producteur.

## Versionnement

Les evenements sont versionnes.

Une evolution d'evenement doit preserver la compatibilite autant que possible.

Les ajouts de champs optionnels sont preferables aux changements de signification.

Les suppressions ou changements incompatibles doivent introduire une nouvelle version.

Un consommateur ne doit pas supposer la presence de champs non declares dans le contrat.

## Idempotence

Les consommateurs doivent pouvoir traiter plusieurs fois le meme evenement sans effet secondaire indesirable.

Chaque handler doit utiliser `eventId` ou une cle metier equivalente pour detecter les traitements deja effectues lorsque cela est necessaire.

Un traitement d'evenement ne doit pas supposer une livraison exactement une fois.

## Fiabilite

Les evenements ne doivent jamais etre perdus.

La publication doit pouvoir etre rejouee si necessaire.

Lorsqu'un evenement accompagne un changement d'etat persistant, la strategie de publication doit garantir que le changement d'etat et l'evenement restent coherents.

Un echec de consommation ne doit pas rendre le module producteur incoherent.

Les erreurs de traitement doivent etre observables et rejouables.

## Handlers

Un handler reagit a un evenement deja produit.

Il ne possede pas la logique metier principale du module producteur.

Il peut mettre a jour une projection, declencher une notification, planifier une tache ou appeler un service public lorsque le couplage est acceptable.

Les handlers doivent rester courts, explicites et idempotents.

## Principes interdits

Les pratiques suivantes sont interdites :

- logique metier principale dans les handlers ;
- appels en cascade entre handlers ;
- dependance directe entre modules via les handlers ;
- utilisation des evenements pour contourner les interfaces publiques ;
- evenement utilise pour retourner une valeur ;
- evenement utilise comme commande deguisee ;
- payload exposant les donnees internes completes d'un module ;
- consommateur dependant d'un detail non documente du payload.

## Consequences

Les modules PGYS peuvent reagir aux faits metier importants sans dependances directes inutiles.

Les contrats d'evenements deviennent des surfaces publiques entre modules.

La conception des evenements doit etre aussi rigoureuse que celle des API.

Les modules restent libres d'evoluer tant que les contrats d'evenements publies restent compatibles ou versionnes.
