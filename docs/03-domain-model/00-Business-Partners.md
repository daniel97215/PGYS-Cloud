# Business Partners

## Vision

Le domaine Business Partners represente le referentiel commun des tiers de PGYS.

Il permet a la plateforme de decrire tout acteur interne ou externe pouvant interagir avec un Workspace : client, prospect, fournisseur, producteur, partenaire, revendeur, transporteur, employe ou sous-traitant.

Un Business Partner est donc une fiche metier unique qui porte l'identite d'un tiers, independamment des roles qu'il exerce dans les differents processus de l'entreprise.

Ce domaine doit servir de langage commun entre ERP, CRM, Marketing, SAV, Achats, Facturation et futurs produits PGYS.

## Objectifs

Les objectifs metier du domaine Business Partners sont :

- centraliser les tiers dans une representation commune ;
- eviter les doublons entre clients, prospects, fournisseurs et partenaires ;
- permettre a un meme tiers de posseder plusieurs roles simultanement ;
- partager les informations utiles entre ERP, CRM, Marketing, SAV et futurs produits ;
- conserver une identite stable lorsqu'un tiers change de role ;
- faciliter la segmentation, la relation commerciale et le suivi operationnel ;
- rendre les futurs domaines metier interoperables autour d'un referentiel de tiers commun.

## Ubiquitous Language

### Business Partner

Un Business Partner est toute personne, organisation ou entite avec laquelle un Workspace entretient ou peut entretenir une relation metier.

Il porte l'identite commune du tiers : nom, denomination, roles, informations de contact, adresses, categories, notes, documents et tags.

Un Business Partner ne se limite pas au role de client.

### Role

Un Role decrit la fonction exercee par un Business Partner dans un contexte metier.

Un role ne cree pas une nouvelle identite.

Le meme Business Partner peut avoir plusieurs roles en meme temps.

### Category

Une Category permet de classer les Business Partners selon des criteres propres au Workspace.

Elle sert a organiser, filtrer et segmenter les tiers.

Elle ne porte pas de logique metier automatique.

### Address

Une Address represente un lieu associe a un Business Partner.

Elle peut servir a decrire un siege, une adresse de livraison, une adresse de facturation, un site de production ou tout autre lieu utile a la relation metier.

### Contact

Un Contact represente une personne ou un point de contact associe a un Business Partner.

Il permet d'identifier qui contacter pour une relation commerciale, administrative, operationnelle ou support.

### Note

Une Note est une information libre ajoutee a un Business Partner pour contextualiser la relation.

Elle peut concerner un suivi commercial, une preference, un risque, une observation ou un historique informel.

### Document

Un Document est une piece rattachee a un Business Partner.

Il peut representer un justificatif, un contrat, un document administratif, un mandat, une certification ou tout autre fichier utile a la relation.

### Tag

Un Tag est un marqueur souple permettant de qualifier rapidement un Business Partner.

Il sert a la recherche, a la segmentation ou a l'organisation quotidienne.

Un tag reste volontairement plus libre qu'une categorie.

## Agregat

L'agregat Business Partner regroupe l'identite du tiers et les elements qui decrivent sa relation avec le Workspace.

```text
Business Partner
+-- Roles
+-- Addresses
+-- Contacts
+-- Categories
+-- Notes
+-- Documents
+-- Tags
```

### Business Partner

Le Business Partner porte l'identite principale du tiers.

Il est responsable de la coherence globale de la fiche : un tiers doit rester identifiable, stable et non duplique.

### Roles

Les Roles indiquent les fonctions exercees par le Business Partner.

Ils permettent de savoir si le tiers est client, prospect, fournisseur, partenaire ou exerce plusieurs fonctions simultanement.

### Addresses

Les Addresses decrivent les lieux associes au Business Partner.

Elles appartiennent au Business Partner et ne doivent pas creer une identite separee.

### Contacts

Les Contacts regroupent les personnes ou points de contact lies au Business Partner.

Ils permettent de suivre les interlocuteurs utiles a la relation metier.

### Categories

Les Categories classent les Business Partners selon la logique propre au Workspace.

Elles aident a organiser les tiers sans modifier leur identite.

### Notes

Les Notes enrichissent la fiche avec des informations contextuelles.

Elles aident les equipes a comprendre la relation et son historique.

### Documents

Les Documents rassemblent les pieces utiles a la relation avec le Business Partner.

Ils permettent de conserver les elements justificatifs ou contractuels associes au tiers.

### Tags

Les Tags apportent une qualification souple et rapide.

Ils servent principalement a la recherche, au tri et a la segmentation.

## Roles

Les roles initiaux sont :

- Customer ;
- Prospect ;
- Supplier ;
- Producer ;
- Partner ;
- Reseller ;
- Carrier ;
- Employee ;
- Subcontractor.

Un Business Partner peut posseder plusieurs roles simultanement.

Exemples :

- une meme entreprise peut etre Customer et Supplier ;
- un Prospect peut devenir Customer sans creation d'une nouvelle identite ;
- un Partner peut aussi devenir Reseller ;
- un Carrier peut aussi etre Subcontractor.

La liste des roles est extensible.

Tout nouveau role doit representer une fonction metier generique et reutilisable.

## Invariants metier

Les invariants metier du domaine sont :

- un Business Partner possede une identite unique dans un Workspace ;
- un role ne cree jamais une nouvelle identite ;
- plusieurs roles peuvent coexister sur un meme Business Partner ;
- les adresses appartiennent au Business Partner ;
- les contacts appartiennent au Business Partner ;
- les categories qualifient le Business Partner sans changer son identite ;
- les notes appartiennent au Business Partner ;
- les documents appartiennent au Business Partner ;
- les tags qualifient le Business Partner sans porter de regle metier lourde ;
- un changement de role ne doit pas dupliquer la fiche du tiers ;
- un tiers connu sous plusieurs roles doit rester consolidable dans une seule fiche ;
- une information commune au tiers doit etre rattachee au Business Partner, pas au role.

## Evenements metier

Les principaux evenements metier pressentis sont :

- Business Partner Created ;
- Business Partner Updated ;
- Business Partner Archived ;
- Role Assigned ;
- Role Removed ;
- Address Added ;
- Address Updated ;
- Contact Added ;
- Contact Updated ;
- Category Assigned ;
- Category Removed ;
- Note Added ;
- Document Attached ;
- Tag Added ;
- Tag Removed.

Ces evenements representent des faits metier passes.

Ils ne decrivent pas leur mise en oeuvre.

## Cas d'usage

### Une entreprise est Customer et Supplier

Une entreprise achete des services au Workspace et fournit egalement des prestations.

Elle doit etre representee par un seul Business Partner portant les roles Customer et Supplier.

Ses contacts, adresses, documents et notes restent centralises.

### Un prospect devient Customer

Une organisation commence comme Prospect dans une demarche commerciale.

Lorsqu'elle signe ou commence une relation commerciale, le role Customer est ajoute.

La fiche existante reste la meme.

### Un producteur devient egalement Client

Un producteur reference dans un contexte operationnel peut ensuite acheter des services.

Le role Customer est ajoute au Business Partner existant.

Son identite n'est pas dupliquee.

### Un partenaire devient Revendeur

Un partenaire commercial peut progressivement exercer une activite de revente.

Le role Reseller est ajoute au Business Partner.

La relation partenaire et la relation revendeur partagent la meme fiche de tiers.

## Bounded Context

### Catalog

Catalog peut utiliser Business Partners pour identifier les producteurs, fournisseurs ou partenaires associes a des produits ou services.

Le domaine Business Partners reste responsable de l'identite du tiers.

### Inventory

Inventory peut utiliser Business Partners pour qualifier les fournisseurs, transporteurs, producteurs ou sous-traitants intervenant dans les flux physiques.

Les informations de tiers restent centralisees dans Business Partners.

### Sales

Sales utilise Business Partners pour identifier les prospects, clients et revendeurs impliques dans les opportunites, devis, commandes et relations commerciales.

Les roles permettent de distinguer la fonction exercee sans dupliquer la fiche.

### Billing

Billing utilise Business Partners pour identifier les tiers factures, payeurs ou destinataires de documents commerciaux.

Les informations partagees du tiers restent portees par Business Partners.

### CRM

CRM utilise Business Partners pour suivre les prospects, clients, partenaires et contacts commerciaux.

Les activites CRM enrichissent la relation sans redefinir l'identite du tiers.

### Marketing

Marketing utilise Business Partners pour segmenter les audiences, cibler des campagnes et suivre des populations de prospects, clients ou partenaires.

Les categories, tags et roles permettent d'organiser la segmentation.

## Evolutions possibles

Les evolutions futures du domaine peuvent inclure :

- scoring CRM ;
- segmentation marketing avancee ;
- portail partenaire ;
- portail fournisseur ;
- gestion documentaire avancee ;
- synchronisation avec des annuaires externes ;
- qualification de risque ;
- historique relationnel consolide ;
- preferences de communication ;
- gestion fine des consentements.

Ces extensions devront conserver le principe central : un Business Partner represente une identite unique pouvant exercer plusieurs roles.
