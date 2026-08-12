# Billing Domain

## Responsabilite

Le domaine Billing transforme une Subscription et son Price en facture SaaS
auditable. Il ne vend pas des produits ERP : cette responsabilite appartient a
Sales et a `SalesInvoice`.

## Concepts V1

### Billing Invoice

Une Billing Invoice appartient a un seul Workspace et reference une
Subscription du meme Workspace. Elle porte une periode mensuelle ou annuelle,
une echeance, une devise, des montants consolides et un snapshot des
coordonnees de facturation.

### Invoice Line

PGYS-035 produit une ligne d'abonnement a partir du Price reference par la
Subscription. La ligne conserve les valeurs appliquees au moment de la
creation :

- description de l'Offer ;
- quantite et prix unitaire ;
- remise de 0 a 100 pour cent ;
- identite et taux de la Tax optionnelle ;
- sous-total, remise, taxe et total.

Modifier ensuite l'Offer, le Price ou la Tax ne modifie pas la facture.

### Invoice Number Sequence

Chaque Workspace possede sa propre sequence. Les numeros sont uniques dans le
Workspace et suivent le format `INV-000001`.

## Contrats publics

Le module expose les operations suivantes sous
`/workspaces/:workspaceId/billing/invoices` :

- creer une facture brouillon depuis une Subscription ;
- lister et consulter les factures du Workspace ;
- emettre (`open`) une facture ;
- la marquer payee ou en retard ;
- l'annuler (`void`) selon son etat courant.

Toutes les lectures et mutations filtrent explicitement `workspaceId`.

## Exclusions PGYS-035

- generation planifiee par worker ;
- encaissement ou remboursement ;
- fournisseur de paiement ;
- Checkout ;
- PDF et envoi email ;
- ecritures comptables ;
- factures multi-lignes saisies librement ;
- proratisation et changement de periodicite en cours de periode.
