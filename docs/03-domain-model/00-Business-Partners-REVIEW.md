# Business Partners Blueprint Review

## Objectif de la revue

Cette revue audite le Blueprint Business Partners avant le refactoring du domaine Customers vers Business Partners.

Elle verifie la solidite du langage metier, la coherence de l'agregat et la capacite du document a servir de reference fonctionnelle pour les prochains developpements.

## Synthese

Le Blueprint est globalement coherent et suffisamment mature pour servir de base au refactoring.

Le domaine Business Partners est clairement positionne comme referentiel commun des tiers, et la distinction entre identite unique et roles multiples est bien exprimee.

Quelques points restent a preciser dans de futurs documents ou tickets fonctionnels, notamment les regles d'unicite, la gestion du cycle de vie et les criteres d'affectation des roles.

## Coherence du langage metier

✅ Conforme

Le vocabulaire central est clair : Business Partner, Role, Category, Address, Contact, Note, Document et Tag sont definis sans dependance technique.

Le document evite de reduire le domaine au seul concept Customer et aligne le langage avec ADR-017.

Point de vigilance : les termes anglais doivent rester stables dans les futurs documents pour eviter une coexistence confuse avec des traductions comme client, fournisseur ou partenaire.

## Completude des concepts

✅ Conforme

Les concepts principaux attendus sont presents :

- identite du tiers ;
- roles ;
- adresses ;
- contacts ;
- categories ;
- notes ;
- documents ;
- tags.

Le Blueprint couvre aussi les objectifs, invariants, evenements, cas d'usage, bounded contexts et evolutions possibles.

Les futurs details pourront etre ajoutes dans des Blueprints specialises, par exemple pour Contacts, Addresses ou Documents.

## Coherence de l'agregat

✅ Conforme

L'agregat Business Partner est coherent avec la decision ADR-017.

Le document exprime clairement que Roles, Addresses, Contacts, Categories, Notes, Documents et Tags sont rattaches au Business Partner.

Cette structure limite le risque de creer des identites concurrentes pour un meme tiers.

## Pertinence des roles

✅ Conforme

Les roles initiaux couvrent les besoins previsibles des modules ERP, CRM, Marketing, Achats et Facturation :

- Customer ;
- Prospect ;
- Supplier ;
- Producer ;
- Partner ;
- Reseller ;
- Carrier ;
- Employee ;
- Subcontractor.

Le document precise correctement que la liste est extensible et qu'un Business Partner peut posseder plusieurs roles simultanement.

## Separation des responsabilites

✅ Conforme

Le Blueprint se concentre sur la responsabilite metier du domaine Business Partners : representer une identite de tiers commune.

Les interactions avec Catalog, Inventory, Sales, Billing, CRM et Marketing sont decrites sans absorber leurs responsabilites.

Le domaine Business Partners reste responsable de l'identite et des informations communes du tiers, pas des processus propres a chaque module.

## Invariants metier

⚠️ À préciser

Les invariants principaux sont bien identifies :

- identite unique dans un Workspace ;
- un role ne cree pas une nouvelle identite ;
- plusieurs roles peuvent coexister ;
- les informations communes appartiennent au Business Partner.

Points restant a preciser avant implementation :

- quels criteres permettent de detecter un doublon ;
- quelles informations composent l'identite minimale ;
- comment gerer l'archivage d'un Business Partner ayant encore des relations actives ;
- si certains roles peuvent etre incompatibles dans des cas rares.

Ces precisions ne bloquent pas le demarrage, mais devront etre traitees avant les workflows sensibles.

## Bounded Context

✅ Conforme

Les interactions avec Catalog, Inventory, Sales, Billing, CRM et Marketing sont pertinentes.

Le document garde une bonne frontiere : Business Partners fournit le referentiel des tiers, tandis que les autres domaines utilisent ce referentiel dans leurs propres processus.

Les dependances fonctionnelles sont suffisamment claires pour cadrer les futurs modules.

## Evolutivite

✅ Conforme

Le Blueprint anticipe correctement les extensions futures :

- scoring CRM ;
- segmentation marketing ;
- portail partenaire ;
- portail fournisseur ;
- gestion documentaire avancee ;
- synchronisation avec des annuaires externes.

La regle centrale reste stable : une identite unique peut porter plusieurs roles.

Cette approche est extensible sans multiplier les modules de tiers.

## Risques de duplication

✅ Conforme

Le document traite explicitement le risque majeur : dupliquer les fiches entre Customer, Supplier, Prospect, Partner ou Reseller.

La solution proposee est claire : les roles qualifient une meme identite et ne creent pas de nouvelles entites racines.

Cette regle devra rester visible dans les futurs tickets pour eviter le retour de modules specialises par role.

## Points restant a preciser

⚠️ À préciser

Les points suivants devront etre clarifies dans des travaux futurs :

- regles de detection et fusion des doublons ;
- cycle de vie complet du Business Partner ;
- difference entre Category et Tag dans les usages limites ;
- roles systeme obligatoires ou optionnels ;
- regles de confidentialite autour des contacts, notes et documents ;
- criteres metier pour l'archivage ;
- gouvernance de la liste des roles ;
- regles de consentement pour les usages Marketing.

Ces points sont normaux a ce stade du Blueprint et peuvent etre traites progressivement.

## Recommandation

READY FOR IMPLEMENTATION

Le Blueprint est suffisamment clair, coherent et complet pour lancer les prochains travaux de cadrage et de refactoring progressif vers Business Partners.

La mise en oeuvre devra toutefois prevoir des tickets dedies pour les regles de cycle de vie, la detection des doublons, la gouvernance des roles et les frontieres entre Categories et Tags.
