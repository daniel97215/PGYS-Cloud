# Commercial Offer Lifecycle

## Responsabilite

PGYS-037 definit quand une Offer commerciale peut etre configuree, publiee et
retiree du catalogue. L'objectif est de proteger les contrats historiques :
une offre deja utilisee ne doit jamais changer de sens pour un Checkout, un
abonnement ou une facture existante.

## Cycle de vie

| Statut | Libelle anglais | Libelle francais | Transitions autorisees |
| --- | --- | --- | --- |
| `draft` | Draft | Brouillon | `active` |
| `active` | Active | Active | `archived` |
| `archived` | Archived | Archivee | Aucune |

Une offre est creee en brouillon. Son activation exige au moins un Price actif
et applicable a la date de la transition. Une offre archivee est terminale et
ne peut pas etre reactivee.

## Immutabilite apres utilisation

Une offre devient utilisee des qu'elle est referencee par au moins un Checkout
ou une Subscription, quel que soit leur statut. A partir de ce moment :

- son nom, sa description, sa visibilite et son statut ne peuvent plus etre
  modifies, sauf la transition `active` vers `archived` ;
- ses associations OfferFeature ne peuvent plus etre ajoutees ou retirees ;
- ses Price ne peuvent plus etre crees, modifies ou archives.

Pour proposer une variante identique ou proche, il faut creer une nouvelle
Offer avec une nouvelle cle, puis lui associer ses propres features et prix.
Il n'existe aucune operation de duplication automatique dans PGYS-037.

## Effet de l'archivage

L'archivage retire l'offre des nouveaux usages. Checkout refuse deja toute
offre non active. La creation d'une Subscription et le changement d'offre
refusent egalement une offre non active et verifient que son Price est actif,
applicable et rattache a cette offre.

Les Checkout, Subscriptions et factures Billing existants restent intacts. Les
snapshots de facturation ne sont pas recalcules et aucune souscription n'est
annulee ou suspendue automatiquement.

## Contrats publics

- `POST /offers/:key/activate` active une offre brouillon eligible ;
- `DELETE /offers/:key` archive une offre active ;
- `PATCH /offers/:key` respecte les memes transitions si un statut est fourni,
  mais une transition ne peut pas etre combinee a une modification de contenu.

Les courses concurrentes de statut sont protegees par une condition portant
sur l'ancien statut.

## Exclusions PGYS-037

- duplication ou versionnement automatique d'une offre ;
- migration des abonnements vers une nouvelle offre ;
- modification retroactive des factures ;
- suppression physique ;
- planification d'une activation ou d'un archivage.
