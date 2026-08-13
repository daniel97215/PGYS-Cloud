# Subscription Lifecycle

## Responsabilite

PGYS-038 verrouille le cycle de vie des abonnements et sa couverture de tests.
Les transitions sont appliquees avec le statut courant dans la condition
d'ecriture afin qu'une course concurrente ne puisse pas contourner les etats
terminaux.

## Etats et transitions

| Statut | Libelle anglais | Libelle francais | Transitions autorisees |
| --- | --- | --- | --- |
| `pending` | Pending | En attente | `active`, `cancelled` |
| `active` | Active | Actif | `suspended`, `cancelled`, `expired` |
| `suspended` | Suspended | Suspendu | `active`, `cancelled`, `expired` |
| `cancelled` | Cancelled | Annule | Aucune |
| `expired` | Expired | Expire | Aucune |

Une Subscription peut etre creee en `pending` ou directement en `active`. Les
autres statuts ne sont jamais des etats de creation publics.

## Idempotence

Repeter une operation deja appliquee retourne l'abonnement courant sans
nouvelle ecriture :

- suspendre un abonnement deja suspendu ;
- reactiver ou activer un abonnement deja actif ;
- annuler un abonnement deja annule ;
- expirer un abonnement deja expire.

Cette repetition ne modifie notamment ni `startedAt`, ni `endsAt`, ni
`cancelledAt`, ni `renewalDate`.

## Regles complementaires

- la route de reactivation active un abonnement `pending` ou reactive un
  abonnement `suspended` ;
- l'expiration explicite renseigne `endsAt` a la date de transition ;
- `cancelled` et `expired` sont terminaux et mutuellement exclusifs ;
- une offre ne peut etre changee que pour un abonnement `pending`, `active` ou
  `suspended` ;
- une activation ou reactivation conserve la contrainte d'unicite d'un
  abonnement actif par Workspace et Offer ;
- les factures Billing existantes ne sont ni modifiees ni annulees par une
  transition Subscription.

## Contrats publics

Les contrats existants de suspension, reactivation et annulation sont
conserves. PGYS-038 ajoute :

- `PATCH /subscriptions/:subscriptionId/expire`.

La protection de concurrence reste centralisee dans le repository. Les tests
service couvrent la matrice des transitions, l'idempotence et les conflits ;
les tests repository couvrent la condition sur le statut courant.

## Exclusions PGYS-038

- worker d'expiration planifiee ;
- renouvellement ou facturation automatique ;
- proratisation ;
- migration automatique vers une autre offre ;
- modification des factures Billing lors d'une transition.
