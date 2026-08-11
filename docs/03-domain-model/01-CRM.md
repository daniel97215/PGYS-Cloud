# CRM Domain Map

## Statut

Cartographie initiale du domaine CRM pour le ticket PGYS-046.

Ce document cadre le domaine avant toute implementation metier. Il ne definit ni modele Prisma, ni endpoint, ni DTO, ni interface utilisateur.

## Objectif

Le domaine CRM organise le suivi de la relation commerciale entre un Workspace et ses Business Partners.

Il doit permettre aux futurs modules CRM de partager un langage commun pour :

- identifier les interlocuteurs d'une relation commerciale ;
- suivre l'avancement d'une relation dans un pipeline ;
- conserver les activites qui contextualisent cette relation ;
- restituer un historique client coherent ;
- fournir des donnees CRM aux applications sans dupliquer l'identite des tiers.

## Position dans l'architecture

CRM est un Business Module PGYS.

Il porte des concepts metier generiques et reutilisables. Une future application CRM SaaS pourra composer ces capacites, mais elle ne devra pas porter elle-meme la logique metier du domaine.

```text
Applications CRM
       |
       v
CRM Business Module
       |
       +--> Business Partners (identite et contacts)
       +--> Platform (Workspace et contrats transverses)
```

Toute dependance vers un autre Business Module doit passer par un contrat public explicite. CRM ne doit pas acceder directement au repository ou aux modeles Prisma d'un autre module.

## Perimetre du domaine

CRM est responsable de :

- la representation CRM d'une relation commerciale ;
- l'organisation des relations dans des pipelines ;
- le suivi des activites CRM ;
- la construction d'un historique relationnel a partir de faits CRM ;
- l'exposition de contrats permettant aux applications de consulter et faire evoluer cette relation.

CRM n'est pas responsable de :

- l'identite, des roles, des adresses ou des contacts d'un tiers, qui appartiennent a Business Partners ;
- des devis, commandes, livraisons, factures ou paiements, qui appartiennent aux domaines Sales et Billing ;
- des campagnes et automatisations marketing, qui appartiennent au domaine Marketing ;
- des tableaux de bord consolides, qui appartiennent au domaine Reporting ;
- de l'authentification, des permissions ou du cycle de vie du Workspace, qui appartiennent a la Platform ;
- de la presentation des ecrans d'une application CRM.

## Ubiquitous Language

### Business Partner

Business Partner est l'identite de reference d'un prospect, client, partenaire ou autre tiers suivi par CRM.

CRM reference cette identite et ne cree pas de copie CRM du tiers.

### Contact

Contact est une personne ou un point de contact rattache a un Business Partner.

Business Partners reste proprietaire de l'identite et des coordonnees du Contact. CRM reutilise le module `BusinessPartnerContact` existant et ne cree aucun modele Contact concurrent.

### Decision PGYS-047 - Contacts Foundation

PGYS-047 est satisfait par la reutilisation de la fondation Contacts deja portee par Business Partners.

Cette decision implique que :

- `BusinessPartnerContact` reste l'unique modele de contact metier ;
- chaque Contact reste rattache a un Business Partner et a son `workspaceId` ;
- CRM consulte ou manipule les contacts au travers des contrats publics de Business Partners ;
- CRM ne duplique ni l'identite, ni les coordonnees, ni le statut actif d'un Contact ;
- toute future donnee exclusivement CRM doit etre rattachee au Contact par un concept CRM distinct et un ticket explicite ;
- PGYS-047 n'introduit aucun modele Prisma, migration, endpoint ou module applicatif supplementaire.

### CRM Account

Business Partner est l'Account de reference partage pour CRM.

CRM reference le Business Partner par son identifiant et par les contrats publics exposes par Business Partners. Il ne cree ni modele `CrmAccount`, ni seconde fiche de tiers.

### Decision PGYS-048 - Accounts Foundation

PGYS-048 est satisfait par la reutilisation de `BusinessPartner` comme Account CRM.

Cette decision implique que :

- `BusinessPartner` reste l'unique identite de l'organisation ou de la personne suivie ;
- le CRM ne copie ni son nom, ni ses coordonnees, ni ses roles, ni ses relations existantes ;
- toute operation CRM recoit un `businessPartnerId` dans le contexte explicite d'un Workspace ;
- CRM utilise uniquement les contrats publics de Business Partners pour consulter ou valider cette reference ;
- aucun modele Prisma, migration, endpoint ou module `CrmAccount` n'est introduit par PGYS-048 ;
- une eventuelle extension ou un profil propre au CRM necessitera un ticket futur fonde sur un besoin metier concret.

### Pipeline

Pipeline represente un parcours commercial configurable appartenant a un Workspace.

Un Workspace peut posseder plusieurs pipelines. Chaque pipeline possede des etapes ordonnees et configurables dont le type est `OPEN`, `WON` ou `LOST`.

### Decision PGYS-049 - Pipeline Foundation

PGYS-049 introduit uniquement les referentiels `CrmPipeline` et `CrmPipelineStage`.

Cette decision implique que :

- un code de pipeline est unique dans un Workspace ;
- un code et une position d'etape sont uniques dans un pipeline ;
- les positions commencent a 1 et determinent l'ordre de restitution ;
- les pipelines et leurs etapes peuvent etre desactives sans suppression physique ;
- chaque etape est qualifiee par un type `OPEN`, `WON` ou `LOST` ;
- un pipeline suivra des opportunites, jamais directement un Business Partner ;
- aucune opportunite ni entree de pipeline n'est creee par PGYS-049 ;
- les futures opportunites appartiennent a PGYS-050.

### CRM Activity

CRM Activity represente un fait ou une action utile au suivi de la relation commerciale.

Une activite est planifiable et distincte de `BusinessPartnerTimelineEntry`, qui reste un historique. Elle appartient a un Business Partner et peut aussi referencer une opportunite, un contact et un membre responsable du meme Workspace.

### Opportunity

Opportunity represente une possibilite commerciale suivie dans un pipeline.

Elle reference un Business Partner, un pipeline et une etape. Son statut `OPEN`, `WON` ou `LOST` est derive du type de son etape courante.

### Decision PGYS-050 - Opportunities & Activities

PGYS-050 introduit `CrmOpportunity` et `CrmActivity`.

Une opportunite :

- possede un code unique dans son Workspace ;
- reference obligatoirement un Business Partner, un pipeline et une etape ;
- peut referencer un Contact et un membre responsable du meme Workspace ;
- peut porter un montant, une devise et une echeance ;
- ne peut changer d'etape qu'au sein de son pipeline ;
- devient immutable lorsque son etape lui donne le statut `WON` ou `LOST` ;
- empeche le changement de type d'une etape deja referencee afin de conserver la coherence de son statut ;
- ne peut ni changer de pipeline, ni etre reouverte dans la V1.

Une activite CRM :

- est de type `CALL`, `EMAIL`, `MEETING`, `TASK` ou `NOTE` ;
- suit le cycle `PLANNED`, `COMPLETED` ou `CANCELLED` ;
- reference obligatoirement un Business Partner ;
- peut referencer une opportunite, un Contact et un membre responsable ;
- conserve une date de planification optionnelle ;
- recoit une date d'achevement uniquement lors de la transition vers `COMPLETED` ;
- devient immutable lorsqu'elle est terminee ou annulee.

### Relationship History

Relationship History est la restitution chronologique des faits CRM rattaches a une relation commerciale.

Il s'appuie sur les donnees des modules qui en sont proprietaires. Il ne doit pas copier leurs donnees metier pour creer une nouvelle source de verite.

## Carte des responsabilites

| Concept | Module proprietaire | Utilisation par CRM |
| --- | --- | --- |
| Workspace | Platform | Perimetre d'isolation de toutes les donnees CRM |
| Business Partner | Business Partners | Identite du tiers suivi |
| Role | Business Partners | Qualification generique, notamment Prospect ou Customer |
| Contact | Business Partners | Interlocuteur de la relation commerciale |
| CRM Account | Business Partners | Account CRM de reference porte par `BusinessPartner` |
| Pipeline | CRM | Referentiel workspace-scoped des parcours commerciaux |
| Pipeline Stage | CRM | Etape ordonnee et configurable de type `OPEN`, `WON` ou `LOST` |
| Opportunity | CRM | Possibilite commerciale suivie dans un pipeline |
| CRM Activity | CRM | Action relationnelle planifiable et suivie par statut |
| Quote et Sales Order | Sales | Documents commerciaux references par contrat public si necessaire |
| Campaign | Marketing | Action marketing consommant des contrats CRM explicites |
| CRM Report | Reporting | Vue consolidee construite sans devenir source de verite CRM |

## Vue du domaine

```text
Workspace
   |
   +-- Business Partner
   |      +-- Roles
   |      +-- Contacts
   |      +-- Addresses
   |      +-- Categories
   |      +-- Tags
   |
   +-- CRM
          +-- Business Partner reference (Account CRM, PGYS-048)
          +-- Pipelines (PGYS-049)
          |      +-- Pipeline Stages
          +-- Opportunities (PGYS-050)
          +-- CRM Activities (PGYS-050)
          +-- Relationship History
```

Les lignes de cette carte indiquent des responsabilites et des references metier. Elles ne prescrivent pas les relations de persistance.

## Frontieres avec Business Partners

Business Partners est la source de verite pour l'identite commune du tiers.

CRM doit respecter les regles suivantes :

- un Prospect et un Customer restent des roles d'un Business Partner ;
- un changement de role ne cree pas une nouvelle identite ;
- un Contact reste rattache au Business Partner ;
- les informations communes au tiers ne sont pas copiees dans CRM ;
- une information propre au suivi commercial appartient a CRM ;
- toute interaction entre les deux modules passe par un contrat public explicite.

## Frontieres avec Sales

CRM suit la relation et son avancement commercial. Sales reste proprietaire des documents et workflows de vente.

CRM peut, par contrat public :

- referencer l'existence d'un devis ou d'une commande ;
- exposer le contexte relationnel necessaire a un workflow de vente ;
- recevoir un fait metier indiquant une evolution de la relation.

CRM ne modifie pas directement un devis, une commande, une livraison, une facture ou un paiement.

## Frontieres avec Marketing

Marketing peut utiliser des contrats CRM pour selectionner ou qualifier une population, lorsque les futurs tickets le definissent.

CRM ne porte pas :

- les campagnes ;
- les templates ;
- l'envoi de messages ;
- les automatisations marketing ;
- les statistiques de campagne.

Les preferences de communication et consentements ne sont pas attribues a CRM par ce ticket. Leur module proprietaire devra etre decide avant implementation.

## Frontieres avec Reporting

CRM expose les donnees et faits dont il est proprietaire. Reporting construit les indicateurs et vues consolidees.

Un rapport ne doit pas devenir la source de verite d'un pipeline, d'une activite ou d'une relation CRM.

## Invariants structurants

- toute donnee CRM propre a un client appartient a un Workspace explicite ;
- aucune operation CRM ne peut traverser les limites d'un Workspace ;
- CRM ne duplique pas l'identite d'un Business Partner ou d'un Contact ;
- un role Prospect ou Customer ne cree pas une entite racine distincte ;
- chaque concept CRM a un module proprietaire unique ;
- les autres modules sont utilises uniquement par des contrats publics explicites ;
- les modeles Prisma d'un autre module ne sont jamais manipules directement ;
- les faits historiques ne sont pas reecrits pour representer un etat courant ;
- une application CRM compose le domaine, mais ne devient pas proprietaire de ses regles metier.

## Parcours metier cibles

Les parcours suivants bornent les futurs tickets sans en definir les details techniques.

### Suivre un prospect existant

1. Le Business Partner existe dans le Workspace avec le role Prospect.
2. CRM reference ce Business Partner dans son contexte relationnel.
3. Les activites et l'avancement commercial sont suivis dans CRM.
4. Si le prospect devient client, Business Partners fait evoluer ses roles sans creer une nouvelle identite.

### Conserver l'historique d'une relation

1. Une activite CRM est rattachee au contexte de la relation.
2. L'activite conserve son Workspace et ses references metier.
3. L'historique restitue les faits CRM dans l'ordre chronologique.
4. Les donnees appartenant a Sales, Marketing ou Business Partners restent dans leur module d'origine.

### Relier la relation commerciale a une vente

1. CRM suit la relation commerciale.
2. Sales cree et gere ses propres documents.
3. Le lien entre les contextes utilise un contrat public ou un evenement documente.
4. Aucun module n'accede directement a la persistance de l'autre.

## Evenements metier pressentis

Les evenements suivants expriment des faits possibles du domaine. Leur contrat exact n'est pas defini par PGYS-046 :

- CRM Opportunity Created ;
- Pipeline Stage Changed ;
- CRM Activity Recorded ;
- CRM Activity Completed.

Les tickets proprietaires devront confirmer les noms, donnees, producteurs et consommateurs avant implementation.

Les evenements Business Partner Created, Role Assigned, Contact Added et Contact Updated restent produits par Business Partners.

## Sequence des tickets CRM

La cartographie prepare les tickets suivants sans les implementer :

1. PGYS-047 - Contacts Foundation - complete par reutilisation de `BusinessPartnerContact` ;
2. PGYS-048 - Accounts Foundation - complete par reutilisation de `BusinessPartner` ;
3. PGYS-049 - Pipeline Foundation - referentiels Pipeline et PipelineStage ;
4. PGYS-050 - CRM Opportunities & Activities Foundation ;
5. PGYS-051 - CRM Reporting Foundation.

Chaque ticket doit definir son agregat, ses invariants, son cycle de vie, ses contrats publics et ses exclusions avant d'introduire du code ou de la persistance.

## Decisions differees

PGYS-046 ne decide pas :

- le modele de persistance CRM ;
- les endpoints ou DTO ;
- le contenu d'une eventuelle extension ou d'un profil CRM futur ;
- le changement de pipeline et la reouverture des opportunites ;
- les automatisations, le scoring et les integrations externes des activites ;
- les regles d'affectation aux membres d'un Workspace ;
- les politiques de confidentialite ou de visibilite ;
- le scoring commercial ;
- les consentements et preferences de communication ;
- les indicateurs et tableaux de bord ;
- les integrations email, SMS, agenda ou telephonie ;
- l'interface d'une application CRM.

Ces decisions appartiennent a des tickets dedies et ne doivent pas etre deduites de cette cartographie.

## Non-objectifs

Ce ticket ne cree :

- aucun module applicatif ;
- aucune migration ;
- aucun modele Prisma ;
- aucun controller, service ou repository ;
- aucun contrat API ;
- aucun workflow CRM executable ;
- aucune integration externe ;
- aucune interface utilisateur.

## Criteres pour les futurs tickets

Avant toute implementation CRM, le ticket concerne doit confirmer :

- le concept metier proprietaire ;
- son rattachement explicite a `workspaceId` ;
- ses relations avec Business Partner et Contact ;
- ses invariants et transitions ;
- ses contrats publics avec les autres modules ;
- les faits historiques qui doivent rester immuables ;
- les exclusions necessaires pour eviter d'absorber Sales, Marketing ou Reporting.
