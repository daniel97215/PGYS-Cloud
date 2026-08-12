# ADR-005 - Billing Architecture

## Statut

Accepted - PGYS-035

## Contexte

PGYS doit facturer les abonnements SaaS sans confondre cette responsabilite
avec le Pricing, les Subscriptions, le Checkout ou la facturation commerciale
ERP. Le modele `Invoice` historique ne conservait qu'un total et un objet de
coordonnees. Il ne permettait pas d'auditer le prix, la taxe ou la remise ayant
produit ce total.

Le modele `SalesInvoice` reste la facture de vente du domaine ERP. Le modele
`Invoice`, expose par le module Billing, represente exclusivement la facture
d'abonnement SaaS d'un Workspace.

## Decision

- Billing depend des references publiques Workspace, Subscription, Offer,
  Price et Tax, mais reste proprietaire de ses factures.
- Une facture est creee en `DRAFT` a la demande depuis une Subscription et le
  Price qui lui est rattache.
- Les periodicites V1 sont `MONTHLY` et `ANNUAL`. Les valeurs historiques
  `monthly`, `annual` et `yearly` des Price sont normalisees par Billing.
- Le numero suit le format `INV-000001` et une sequence independante est
  maintenue par Workspace.
- Une meme Subscription ne peut avoir qu'une facture pour une meme periode.
- La ligne de facture fige la description, la quantite, le prix unitaire, le
  code, le nom et le taux de taxe, le taux de remise et tous les montants.
- Tax reste le referentiel workspace-scoped. Une facture ne depend jamais de
  ses valeurs courantes apres creation, car elle conserve leur snapshot.
- Le taux de remise est compris entre 0 et 100 pour cent.
- Les montants sont calcules dans cet ordre : sous-total, remise, base taxable,
  taxe, total. Les montants monetaires sont arrondis a deux decimales.
- Les coordonnees de facturation du Workspace sont egalement figees lors de la
  creation.
- Les paiements fournisseurs, le prelevement, le PDF, l'envoi email, la
  planification automatique et les ecritures comptables sont hors PGYS-035.

## Cycle de vie

| Statut | Libelle anglais | Libelle francais | Transitions autorisees |
| --- | --- | --- | --- |
| `DRAFT` | Draft | Brouillon | `OPEN`, `VOID` |
| `OPEN` | Open | Emise | `PAID`, `OVERDUE`, `VOID` |
| `OVERDUE` | Overdue | En retard | `PAID`, `VOID` |
| `PAID` | Paid | Payee | Aucune |
| `VOID` | Void | Annulee | Aucune |

Les factures `PAID` et `VOID` sont terminales. Une transition est appliquee
avec l'ancien statut dans la condition d'ecriture afin d'eviter qu'une course
concurrente contourne cette immutabilite.

## Consequences

Billing peut evoluer vers Checkout et les fournisseurs de paiement sans faire
entrer leur logique dans Subscription ou Pricing. Les factures historiques
restent auditables meme si un Price, une Tax ou les coordonnees du Workspace
changent ensuite.
