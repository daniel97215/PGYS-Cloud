# Exploration Mobile POS

## 1. Objet

PGYS-077 evalue la possibilite d'un parcours de caisse tactile compose a partir
des contrats PGYS existants. Cette exploration ne livre ni caisse, ni nouveau
moteur Sales, ni integration de paiement ou de peripherique.

La decision porte sur un parcours web mobile ou PWA. Une application native,
un fonctionnement hors ligne et toute integration materielle restent soumis a
un besoin pilote mesure.

## 2. Recommandation

La recommandation est **`ADAPTER`**.

Les fondations Catalog, Sales, Inventory et SalesPayment sont suffisamment
coherentes pour rester les sources de verite d'une future caisse. Elles ne
forment cependant pas encore un contrat de vente comptoir atomique, rapide et
idempotent. Une interface POS ne doit donc pas orchestrer seule plusieurs
ecritures metier ni recalculer prix, taxes, totaux ou stock.

Le passage a `GO` necessite d'abord un parcours pilote observe et un contrat
d'adaptation serveur dedie. `STOP` n'est pas justifie : les produits, variantes,
codes-barres, taxes, commandes, factures, paiements et stocks existants sont
reutilisables sans creer un domaine concurrent.

## 3. Compatibilite avec les contrats existants

### 3.1. Fondations reutilisables

- Catalog fournit Product, ProductVariant, ProductBarcode, Tax et PriceList,
  tous isoles par Workspace ;
- Sales conserve les lignes et les montants de commande et de facture sous
  forme de snapshots, avec des transitions metier explicites ;
- Inventory conserve le stock par entrepot et emplacement, les reservations et
  les mouvements immuables ;
- SalesPayment couvre les moyens `CASH`, `BANK_TRANSFER`, `CARD`, `CHECK`,
  `DIRECT_DEBIT` et `OTHER`, puis alloue un paiement confirme a une facture ;
- les contrats publics `/api/v1` et les autorisations Workspace demeurent la
  seule voie d'acces pour un futur client POS.

### 3.2. Ecarts a traiter avant une caisse

- Product et PriceList ne fournissent pas encore une resolution de prix de
  vente par produit ou variante ; une ligne Sales attend actuellement le prix
  et le taux de taxe fournis par l'appelant ;
- la creation d'une commande, l'ajout de ses lignes et ses transitions sont des
  operations separees ; il n'existe pas de finalisation atomique d'un panier ;
- les numeros de commande, facture et paiement sont fournis par l'appelant,
  alors qu'un parcours POS exige une attribution serveur coherente par
  Workspace ;
- une vente requiert un BusinessPartner, sans politique documentee pour un
  client comptoir ou anonyme ;
- Inventory expose les positions de stock par produit ou emplacement, mais pas
  un catalogue POS agregant produit, variante, code-barres, prix, taxe et
  disponibilite ;
- SalesPayment enregistre un paiement metier, mais ne pilote ni terminal, ni
  acquisition carte, ni ticket, ni reprise apres echec ;
- aucun contrat unique ne garantit aujourd'hui la coherence entre commande,
  facture, paiement et mouvement de stock lors d'une interruption ou d'un
  nouvel essai.

## 4. Evaluation du parcours terrain

### 4.1. Vitesse de saisie tactile

Le socle mobile permet une interface a partir de 360 pixels et des cibles
tactiles d'au moins 44 pixels. La vitesse de caisse n'est toutefois pas
demontree. Un pilote doit mesurer :

- le temps median pour rechercher ou scanner puis ajouter un article ;
- le temps total d'une vente selon le nombre de lignes ;
- le nombre de corrections de quantite, de variante et de suppression ;
- la frequence des recherches sans resultat et des codes-barres inconnus ;
- la lisibilite du total, des taxes, des remises et du moyen de paiement.

Le prototype devra privilegier la recherche, la saisie code-barres, un panier
toujours lisible et des actions principales accessibles a une main. Ces choix
d'interface ne remplacent pas les mesures pilotes.

### 4.2. Paiements et peripheriques

Avant toute integration, le pilote doit inventorier les moyens de paiement,
terminaux, scanners, imprimantes et tiroirs-caisses reellement utilises, ainsi
que leurs modes de connexion et leur compatibilite navigateur.

Les paiements fractionnes, remboursements, annulations, justificatifs et
ecarts de caisse ne sont pas definis par PGYS-077. Les exigences fiscales,
comptables et de justificatif applicables au pilote doivent egalement etre
cadrees avant une mise en production.

### 4.3. Hors ligne

Le besoin hors ligne n'est pas etabli. Le pilote doit relever la frequence et
la duree des coupures, ainsi que l'obligation ou non de continuer a vendre
pendant une indisponibilite.

La premiere experimentation reste donc **en ligne uniquement**. Si la vente
hors ligne devient necessaire, un ticket distinct devra definir file locale,
idempotence, resolution de conflits, validite des prix, disponibilite du stock,
securite des donnees et reprise des paiements. Un cache PWA de ressources
statiques ne constitue pas une caisse hors ligne.

## 5. Adaptation serveur requise

Un futur ticket, fonde sur les observations pilotes, devra definir un contrat
POS applicatif qui compose les modules existants sans les dupliquer. Ce contrat
devra au minimum couvrir :

1. une lecture Workspace-scoped agregant produit, variante, code-barres, prix,
   taxe et stock vendable ;
2. une resolution serveur du prix, de la taxe, des remises autorisees et des
   snapshots de ligne ;
3. une politique de BusinessPartner comptoir ;
4. une numerotation serveur par Workspace ;
5. une finalisation atomique et idempotente de la vente, avec comportement
   explicite si facture, paiement ou stock echoue ;
6. une politique de sortie de stock pour la vente immediate ;
7. une frontiere d'integration des terminaux et peripheriques, sans confondre
   paiement confirme et autorisation du fournisseur ;
8. les annulations, remboursements et reprises autorises.

Cette adaptation appartient a la couche Application. Les invariants de Sales,
Inventory et SalesPayment restent dans leurs services metier et Prisma reste
limite a leurs repositories.

## 6. Prototype recommande

Apres validation des prerequis, le premier prototype devrait rester une PWA
en ligne, limitee a un Workspace, un emplacement de stock, une devise et une
liste de prix. Il peut tester recherche, saisie code-barres, grille tactile et
panier, mais ne doit produire aucune ecriture reelle tant que la finalisation
atomique n'existe pas.

Aucun SDK de terminal, stockage metier hors ligne, synchronisation, moteur de
prix local ou mouvement de stock direct ne doit etre introduit par ce
prototype.

## 7. Risques principaux

- divergence des prix, taxes ou totaux si le client les calcule ;
- commande, facture, paiement ou stock partiellement enregistres ;
- double vente lors d'un nouvel essai sans cle d'idempotence ;
- prix ou stock obsoletes entre lecture et finalisation ;
- acces au mauvais Workspace ou emplacement ;
- divergence entre paiement PGYS et resultat du terminal ;
- comportement variable des peripheriques selon appareil et navigateur ;
- ajout premature d'un mode hors ligne sans resolution de conflits.

## 8. Criteres de passage de `ADAPTER` a `GO`

La decision pourra devenir `GO` lorsque :

- un pilote documente les temps de saisie, erreurs, appareils, paiements et
  contraintes de connectivite ;
- la politique client comptoir, prix, taxe, stock, annulation et justificatif
  est acceptee ;
- le contrat d'adaptation serveur et sa cle d'idempotence sont valides ;
- un test de bout en bout prouve une vente en ligne coherente, y compris apres
  interruption et nouvel essai ;
- les objectifs de performance, accessibilite et observabilite sont fixes ;
- le besoin hors ligne est soit ecarte, soit traite par un ticket dedie.

Tant que ces criteres ne sont pas reunis, PGYS ne lance ni caisse de production,
ni application native, ni moteur POS concurrent.
