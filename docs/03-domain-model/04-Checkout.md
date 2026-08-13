# Checkout Domain

## Responsabilite

Le domaine Checkout orchestre la confirmation d'une souscription SaaS sans
dependre d'un fournisseur de paiement. Il relie un Workspace a une Offer et a
un Price, puis cree les enregistrements Subscription et Billing necessaires.

## Checkout Session

Une session appartient a un Workspace et reference une Offer ainsi qu'un Price
actifs et coherents. A sa creation, elle fige :

- le montant ;
- la devise ;
- la periodicite mensuelle ou annuelle ;
- une date d'expiration configurable.

Une cle d'idempotence est obligatoire et unique dans le Workspace. Rejouer la
meme requete avec la meme cle retourne la session existante. Reutiliser cette
cle avec une autre offre, un autre prix ou une autre expiration est refuse.

## Cycle de vie

| Statut | Libelle anglais | Libelle francais | Transitions autorisees |
| --- | --- | --- | --- |
| `OPEN` | Open | Ouvert | `COMPLETED`, `EXPIRED`, `CANCELLED` |
| `COMPLETED` | Completed | Termine | Aucune |
| `EXPIRED` | Expired | Expire | Aucune |
| `CANCELLED` | Cancelled | Annule | Aucune |

Les sessions ouvertes dont l'echeance est atteinte passent a `EXPIRED` lors
de leur prochaine lecture, liste ou tentative de mutation. Les trois statuts
finaux sont immuables.

## Finalisation atomique

La finalisation revendique la session encore ouverte et non expiree, puis cree
dans une transaction unique :

1. une Subscription `active` rattachee au Workspace, a l'Offer et au Price ;
2. une facture Billing `DRAFT` pour la premiere periode ;
3. une ligne de facture reprenant le montant et la devise figes par le Checkout.

La date de renouvellement de la Subscription et la fin de periode de la facture
sont calculees a un mois ou un an de la finalisation. Cette premiere facture
n'applique ni taxe ni remise ; ces parametres restent geres par Billing pour les
factures creees explicitement. Le numero de facture utilise la sequence du
Workspace definie par PGYS-035.

Une finalisation rejouee retourne le Checkout deja termine. Une session ne peut
pas creer une seconde souscription active pour la meme offre dans le Workspace.

## Contrats publics

Le module expose sous `/workspaces/:workspaceId/checkouts` :

- la creation idempotente d'une session ;
- la liste et la consultation des sessions du Workspace ;
- la finalisation ;
- l'annulation d'une session ouverte.

Toutes les lectures et mutations sont filtrees par `workspaceId`.

## Exclusions PGYS-036

- Stripe ou tout autre fournisseur de paiement ;
- cartes, prelevements et donnees de paiement ;
- redirections vers une page hebergee ;
- webhooks et workers ;
- interface frontend ;
- taxes, remises et proratisation dans Checkout ;
- changement d'offre ou de periodicite apres creation.
