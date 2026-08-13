# ERP Domain Map

## Statut

Cartographie de reference du domaine ERP pour le ticket PGYS-039.

Ce document decrit les responsabilites, frontieres et flux du domaine deja
present dans le depot. PGYS-039 ne cree aucun modele Prisma, endpoint, DTO ou
module applicatif et ne modifie aucun comportement metier.

## Objectif

Le domaine ERP gere les referentiels et documents operationnels d'un Workspace :

- les tiers clients et fournisseurs ;
- le catalogue de produits et services ;
- les entrepots et le stock ;
- le cycle de vente ;
- le cycle d'achat.

Chaque sous-domaine reste proprietaire de ses donnees et expose ses operations
aux applications PGYS. Les liens entre documents representent un flux metier ;
ils ne fusionnent pas les responsabilites des modules.

## Position dans l'architecture

ERP est un ensemble de Business Modules composables dans le monolithe modulaire.

```text
Applications ERP / POS / Administration
                 |
                 v
          ERP Business Modules
                 |
      +----------+----------+-----------+-----------+
      |          |          |           |           |
 Business    Catalog    Inventory     Sales     Purchasing
 Partners
      |
      +--------------------> Workspace / Platform
```

Les operations persistent uniquement dans les repositories. Chaque lecture et
mutation d'une donnee client est bornee par `workspaceId`, y compris lors de la
validation des references entre modules.

## Sous-domaines et responsabilites

### Business Partners

`BusinessPartner` est l'identite partagee de tout tiers. Un client ou un
fournisseur n'est pas un modele ERP distinct : son role qualifie le meme tiers.

Business Partners reste proprietaire :

- de l'identite et du statut du tiers ;
- de ses roles, categories et tags ;
- de ses adresses, contacts, documents et notes ;
- de son historique transversal.

Sales reference un Business Partner client. Purchasing reference un Business
Partner fournisseur. Un tiers peut cumuler ces roles sans duplication.

### Catalog

Catalog est proprietaire des articles vendus ou achetes et de leurs
referentiels :

- `Product` de type produit ou service ;
- `ProductVariant` ;
- `ProductBarcode` et `ProductMedia` ;
- `ProductAttribute` et ses valeurs ;
- `ProductCategory`, `Brand`, `Manufacturer` et `Unit` ;
- `PriceList` ;
- `Tax` comme referentiel fiscal workspace-scoped.

Les lignes de documents Sales et Purchasing conservent leur description,
quantite, prix ou cout, taux de taxe et montants. Elles constituent le snapshot
commercial du document et ne doivent pas etre recalculees retroactivement
lorsqu'un Product ou un referentiel change.

`PriceList` appartient au catalogue ERP. Il ne doit pas etre confondu avec
`Price`, qui tarifie les Offer et Subscription du Commercial Core.

### Inventory

Inventory est proprietaire de la localisation et de la quantite physique :

- `Warehouse` et `StorageLocation` structurent le stockage ;
- `InventoryItem` porte le stock d'un Product et de sa variante dans un
  emplacement ;
- `StockMovement` est le journal immutable des entrees et sorties ;
- `StockReservation` isole la quantite reservee de la quantite disponible ;
- `InventoryCount` et ses lignes comparent quantites attendues et comptees ;
- les ajustements et transferts orchestrent des mouvements sans introduire une
  seconde source de verite du stock.

Une livraison client diminue le stock par mouvement. Une reception fournisseur
l'augmente. Un retour fournisseur le diminue. Toute reference de produit,
variante, entrepot, emplacement et article de stock doit appartenir au meme
Workspace.

### Sales

Sales est proprietaire des documents du cycle de vente :

```text
Business Partner client
          |
          v
Sales Quote -> Sales Order -> Sales Delivery
                    |
                    +-------> Sales Invoice -> Sales Payment allocations
```

- `SalesQuote` prepare une proposition et peut produire une commande ;
- `SalesOrder` engage le traitement de la vente ;
- `SalesDelivery` execute la sortie physique des articles ;
- `SalesInvoice` porte la creance commerciale ERP ;
- `SalesPayment` et ses allocations reglent une ou plusieurs factures.

Les documents ont un numero unique dans le Workspace. Leurs lignes et totaux
restent sous la responsabilite de Sales, tandis qu'Inventory reste proprietaire
des mouvements physiques.

### Purchasing

Purchasing est proprietaire des documents du cycle d'achat :

```text
Business Partner fournisseur
             |
             v
Purchase Order -> Purchase Receipt -> Purchase Return
       |
       +----------> Purchase Invoice -> Purchase Payment
```

- `PurchaseOrder` porte la commande fournisseur et l'entrepot cible ;
- `PurchaseReceipt` enregistre les quantites effectivement recues ;
- `PurchaseReturn` renvoie des quantites deja receptionnees ;
- `PurchaseInvoice` porte la dette fournisseur ;
- `PurchasePayment` regle une facture fournisseur.

Les quantites recues ou retournees sont bornees par leurs lignes sources. Les
receptions et retours finalises produisent les mouvements de stock correspondants.

## Ubiquitous Language

| Terme | Definition ERP |
| --- | --- |
| Business Partner | Identite partagee d'un client, fournisseur ou autre tiers |
| Product | Article ou service de reference utilise dans les documents ERP |
| Variant | Declinaison identifiable d'un Product |
| Inventory Item | Stock d'un Product/Variant dans un emplacement determine |
| Stock Movement | Fait immutable augmentant ou diminuant une quantite physique |
| Reservation | Quantite temporairement indisponible pour d'autres usages |
| Quote | Proposition commerciale non encore transformee en commande |
| Order | Engagement operationnel client ou fournisseur |
| Delivery | Execution d'une sortie de stock pour une commande client |
| Receipt | Execution d'une entree de stock pour une commande fournisseur |
| Return | Sortie de stock renvoyee apres une reception fournisseur |
| Sales Invoice | Facture commerciale adressee a un client ERP |
| Purchase Invoice | Facture recue d'un fournisseur ERP |
| Payment Allocation | Affectation d'un paiement client a une facture de vente |

## Carte des proprietaires

| Concept | Module proprietaire | Consommateurs principaux |
| --- | --- | --- |
| Workspace | Platform | Tous les modules ERP pour l'isolation |
| Business Partner | Business Partners | Sales, Purchasing, CRM, Marketing |
| Product et referentiels | Catalog | Inventory, Sales, Purchasing |
| Tax | Catalog ERP | Lignes Sales/Purchasing et, par snapshot, Billing |
| Inventory Item et Movement | Inventory | Sales Delivery, Purchase Receipt et Return |
| Sales Quote, Order, Delivery | Sales | Applications ERP et Reporting |
| Sales Invoice et Payment | Sales | Applications ERP et Reporting |
| Purchase Order, Receipt, Return | Purchasing | Inventory et Reporting |
| Purchase Invoice et Payment | Purchasing | Applications ERP et Reporting |
| Invoice SaaS | Billing | Commercial Core ; hors facture commerciale ERP |

## Frontiere avec Billing et Commercial Core

Deux familles de factures coexistent volontairement :

- `Invoice` appartient a Billing et facture une Subscription SaaS PGYS ;
- `SalesInvoice` appartient a Sales et facture une vente ERP a un Business
  Partner client.

Elles ont des cycles, numeros, lignes et proprietaires distincts. Aucun module
ne doit convertir implicitement l'une en l'autre.

De meme :

- `Offer`, `Price`, `CheckoutSession` et `Subscription` appartiennent au
  Commercial Core ;
- `Product`, `PriceList` et les documents commerciaux appartiennent a l'ERP.

Une future passerelle exige un ticket et un contrat public explicites.

## Frontiere avec CRM et Marketing

CRM suit la relation, les opportunites et activites. Il peut referencer
l'existence d'un document Sales au travers d'un contrat public, mais ne modifie
pas sa persistance.

Marketing constitue des audiences et prepare des campagnes. Il ne cree ni
devis, commande, livraison, facture, achat ou mouvement de stock.

Business Partners demeure la source de verite commune aux trois domaines.

## Invariants structurants

- toute donnee ERP client est rattachee a un `workspaceId` explicite ;
- aucune relation ne traverse les limites d'un Workspace ;
- les codes et numeros sont uniques dans leur perimetre documente ;
- les tiers ne sont jamais dupliques entre Sales et Purchasing ;
- les mouvements sont la trace des variations de stock, pas un total recalcule
  depuis les documents ;
- les lignes de documents figent leurs valeurs commerciales ;
- les documents finalises ne sont pas reecrits pour suivre un referentiel ;
- Prisma reste limite aux repositories ;
- les effets croises, notamment sur le stock, doivent rester transactionnels ;
- un module consomme un autre module par contrat public, jamais par son
  repository prive.

## Sequence des tickets ERP

La cartographie definit les frontieres des tickets suivants sans changer leur
etat de suivi :

1. PGYS-040 - Catalog Foundation ;
2. PGYS-041 - Customers Foundation, satisfaite architecturalement par Business
   Partners lorsque le ticket le confirme ;
3. PGYS-042 - Products Foundation ;
4. PGYS-043 - Inventory Foundation ;
5. PGYS-044 - Sales Foundation ;
6. PGYS-045 - Purchases Foundation.

Le depot contient deja des modules correspondant a plusieurs de ces capacites.
Leur presence ne suffit pas a les marquer termines : chaque ticket doit etre
audite individuellement contre son perimetre, ses tests et ses validations.

## Decision PGYS-040 - Catalog Foundation

PGYS-040 est satisfait par les fondations Catalog deja presentes et auditees
dans le depot. Aucun second module Catalog et aucune migration supplementaire
ne sont necessaires.

Le socle confirme :

- les racines `Product` et `ProductVariant` ;
- les identifiants complementaires `ProductBarcode` et `ProductMedia` ;
- les caracteristiques configurables `ProductAttribute` et leurs valeurs ;
- les referentiels workspace-scoped `ProductCategory`, `Brand`,
  `Manufacturer`, `Unit`, `Tax` et `PriceList` ;
- des codes uniques dans chaque Workspace et des cycles actif/inactif ou
  actif/archive selon le referentiel ;
- des DTO valides et des operations publiques de creation, consultation,
  modification et desactivation/archivage ;
- un acces aux donnees centralise dans les repositories et des gardes de
  coherence `workspaceId` pour les references ;
- des migrations additives distinctes et une couverture repository/service
  pour chacun des modules.

L'audit PGYS-040 a execute 22 suites Catalog, soit 135 tests reussis. Le ticket
ne cree pas d'association implicite entre Product et tous les referentiels :
toute relation supplementaire devra repondre a un besoin metier explicite et
faire l'objet d'un ticket dedie.

## Decision PGYS-041 - Customers Foundation

PGYS-041 est satisfait par la reutilisation de `BusinessPartner` comme identite
client de reference. Le domaine ERP ne cree ni modele `Customer`, ni copie de
l'identite ou des coordonnees d'un tiers.

Cette decision implique que :

- un client est un Business Partner qualifie par le role `CUSTOMER` ;
- le meme Business Partner peut aussi etre prospect, fournisseur, partenaire
  ou exercer tout autre role du referentiel ;
- son code reste unique dans le Workspace et son identite ne change pas lors
  de l'ajout ou du retrait d'un role ;
- ses adresses, contacts, categories, tags, notes et documents restent portes
  par Business Partners ;
- Sales reference le `businessPartnerId` sans recopier la fiche client ;
- toutes les operations publiques existantes restent filtrees par
  `workspaceId` et les acces Prisma restent dans les repositories ;
- les routes historiques nommees `customers` sont un contrat d'API existant et
  ne justifient pas une seconde racine de domaine ;
- toute donnee exclusivement propre au contexte Sales devra etre ajoutee par
  un concept et un ticket explicites, pas sur une copie de Customer.

L'audit PGYS-041 a execute les 20 suites Business Partners, soit 117 tests
reussis. Il n'introduit aucune migration, aucun modele et aucun endpoint.

## Decision PGYS-042 - Products Foundation

PGYS-042 est satisfait par l'agregat Product deja implemente et audite. Le
ticket reutilise les referentiels Catalog de PGYS-040 et ne cree aucun modele
concurrent.

Le perimetre confirme :

- `Product` comme racine workspace-scoped, avec code unique, nom, description,
  type produit/service et cycle actif/inactif ;
- `ProductVariant` pour les declinaisons, avec code unique dans le Workspace,
  SKU optionnel, variante par defaut et cycle actif/inactif ;
- `ProductBarcode` rattache exactement a un Product ou une Variant et unique
  dans le Workspace ;
- `ProductMedia` rattache exactement a un Product ou une Variant, avec ordre et
  media principal ;
- `ProductAttribute` et `ProductAttributeValue` pour des valeurs typees et les
  axes de variantes ;
- la verification du Workspace commun pour toutes les references ;
- des DTO fermes, des operations publiques et un acces Prisma limite aux
  repositories ;
- des migrations additives distinctes et des tests repository/service.

L'audit PGYS-042 a execute 10 suites ciblees, soit 62 tests reussis. Les
categories, marques, fabricants, unites, taxes et listes de prix restent des
referentiels de PGYS-040 ; aucune association non requise n'est inventee ici.

## Decision PGYS-043 - Inventory Foundation

PGYS-043 est satisfait par les modules Inventory deja implementes et audites.
Le stock physique reste une responsabilite unique, sans total concurrent dans
Sales ou Purchasing.

Le perimetre confirme :

- `Warehouse` et `StorageLocation` comme referentiels workspace-scoped ;
- `InventoryItem` unique pour une combinaison emplacement, Product et Variant,
  avec quantites en stock et reservees ;
- `StockMovement` comme journal des entrees et sorties avec quantites avant et
  apres mouvement ;
- les ajustements comme corrections tracees du stock ;
- les transferts atomiques entre deux articles de stock coherents ;
- `InventoryCount` et ses lignes pour le comptage, l'ecart et la finalisation ;
- `StockReservation` et les transitions de reservation, liberation,
  consommation et annulation ;
- la validation du Workspace commun, des quantites positives et de la
  disponibilite avant toute sortie ou reservation ;
- un acces Prisma limite aux repositories, y compris pour les transactions et
  les verrous necessaires aux mutations de quantite ;
- des migrations additives et une couverture des repositories et services.

L'audit PGYS-043 a execute 14 suites Inventory, soit 118 tests reussis. Il
n'ajoute ni valorisation de stock, ni lot, ni numero de serie, ni planification
MRP, qui restent hors du perimetre confirme.

## Decisions differees

PGYS-039 ne decide pas :

- la comptabilite generale ou analytique ;
- les ecritures comptables et journaux legaux ;
- les avoirs clients ou fournisseurs ;
- la valorisation de stock et le cout moyen ;
- les lots, numeros de serie et dates de peremption ;
- la planification MRP, la production ou la nomenclature ;
- la tarification avancee, promotions ou conditions clients ;
- le transport, la preparation de colis ou les fournisseurs logistiques ;
- les exports fiscaux, PDF, emails ou integrations de paiement ;
- les dashboards et indicateurs consolides ;
- les interfaces ERP, POS ou mobiles.

Ces sujets exigent des tickets dedies et ne doivent pas etre deduits de cette
cartographie.

## Non-objectifs

PGYS-039 ne cree :

- aucun module applicatif ;
- aucune migration ou modification Prisma ;
- aucun controller, service, repository ou DTO ;
- aucun nouveau workflow executable ;
- aucune integration externe ;
- aucune interface utilisateur.
