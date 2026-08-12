# Marketing Domain Map

## Statut

Cartographie initiale du domaine Marketing pour le ticket PGYS-052.

Ce document cadre le domaine avant toute implementation metier. Il ne definit ni modele Prisma, ni endpoint, ni DTO, ni interface utilisateur.

## Objectif

Le domaine Marketing organise la constitution d'audiences et la preparation d'actions marketing dans le perimetre d'un Workspace.

Il doit permettre aux futurs modules Marketing de partager un langage commun pour :

- definir des populations ciblables sans dupliquer l'identite des tiers ;
- preparer et suivre des campagnes ;
- reutiliser des contenus marketing ;
- orchestrer progressivement des actions automatisees ;
- exposer des faits marketing aux autres modules sans absorber leurs responsabilites.

## Position dans l'architecture

Marketing est un Business Module PGYS.

Il porte des concepts metier generiques et reutilisables. Une future application Marketing SaaS pourra composer ces capacites, mais elle ne devra pas porter elle-meme la logique metier du domaine.

```text
Applications Marketing
          |
          v
Marketing Business Module
          |
          +--> Business Partners (identites, roles, categories, tags et contacts)
          +--> CRM (contexte relationnel expose par contrat public)
          +--> Integrations (fournisseurs de diffusion)
          +--> Platform (Workspace et contrats transverses)
```

Toute dependance vers un autre Business Module doit passer par un contrat public explicite. Marketing ne doit pas acceder directement au repository ou aux modeles Prisma d'un autre module.

## Perimetre du domaine

Marketing est responsable de :

- la definition de segments marketing appartenant a un Workspace ;
- la preparation d'audiences a partir de references metier exposees par contrat public ;
- la definition et le cycle de vie des campagnes ;
- la gestion des contenus reutilisables propres aux campagnes ;
- l'orchestration des automatisations marketing lorsque leur ticket en definit les regles ;
- la conservation des faits marketing dont il est proprietaire ;
- l'exposition de contrats permettant aux applications de consulter et faire evoluer ces concepts.

Marketing n'est pas responsable de :

- l'identite, des roles, des categories, des tags ou des contacts d'un tiers, qui appartiennent a Business Partners ;
- des opportunites et activites commerciales, qui appartiennent a CRM ;
- du transport technique des emails, SMS ou autres messages, qui appartient aux Integrations ;
- des devis, commandes, factures ou paiements, qui appartiennent a Sales et Billing ;
- des tableaux de bord consolides et exports, qui appartiennent a Reporting ;
- de l'authentification, des permissions ou du cycle de vie du Workspace, qui appartiennent a la Platform ;
- de la presentation des ecrans d'une application Marketing.

## Ubiquitous Language

### Audience

Audience represente la population evaluee pour une action marketing dans un Workspace.

Elle est constituee de references vers des Business Partners et, lorsque le futur ticket l'autorise, vers leurs Contacts. Elle ne copie ni leur identite, ni leurs coordonnees, ni leurs roles.

Une audience peut provenir d'un Segment ou d'une selection explicite. Les regles exactes de materialisation, de recalcul et de gel appartiennent aux tickets qui les implementent.

### Segment

Segment represente une definition reutilisable permettant de selectionner une population selon des criteres marketing explicites.

Un Segment appartient a un Workspace. Il s'appuie sur des donnees accessibles au travers de contrats publics, notamment les roles, categories et tags de Business Partners. PGYS-052 ne definit ni le langage de criteres, ni le mode de calcul, ni le caractere dynamique ou fige d'un Segment.

### Decision PGYS-053 - Segments Foundation

PGYS-053 introduit des Segments dynamiques constitues de regles enregistrees.

Cette decision implique que :

- un code de Segment est unique dans un Workspace ;
- les seules familles de criteres V1 sont les roles, categories et tags de Business Partners, ainsi que le filtre `activeOnly` ;
- plusieurs valeurs d'une meme famille sont combinees par `OR` ;
- les familles renseignees sont combinees par `AND` ;
- les codes de criteres doivent designer des referentiels actifs du meme Workspace ;
- l'audience est evaluee a la demande et paginee par le contrat public de Business Partners ;
- aucun membre d'audience ni resultat d'evaluation n'est persiste ;
- un Segment peut etre active ou desactive sans suppression physique ;
- seuls les Business Partners sont cibles par un Segment ;
- la selection des Contacts destinataires appartient aux futures Campaigns.

### Campaign

Campaign represente une action marketing planifiee et suivie dans un Workspace.

Elle associe une intention, une audience, un contenu et, lorsque le futur ticket le definit, un ou plusieurs canaux. Son cycle de vie, ses transitions et les conditions de lancement appartiennent a PGYS-054.

### Decision PGYS-054 - Campaigns & Templates Foundation

PGYS-054 introduit les referentiels `MarketingCampaign` et `MarketingTemplate` sans diffusion executable.

Une Campaign :

- appartient a un Workspace et possede un code unique dans ce Workspace ;
- cible obligatoirement un Segment actif du meme Workspace ;
- utilise un canal `EMAIL` ou `SMS` ;
- peut rester sans Template tant qu'elle est `DRAFT` ;
- exige un Template actif et de meme canal pour passer a `READY` ;
- suit uniquement les transitions `DRAFT -> READY`, `DRAFT -> CANCELLED` et `READY -> CANCELLED` ;
- reste modifiable uniquement en `DRAFT` ;
- devient immutable en `READY`, hors annulation explicite, et terminale en `CANCELLED`.

Un Marketing Template :

- appartient a un Workspace et possede un code unique dans ce Workspace ;
- utilise le canal `EMAIL` ou `SMS` ;
- porte un sujet optionnel et un contenu obligatoire ;
- peut etre active ou desactive sans suppression physique ;
- ne porte aucun secret, identifiant fournisseur ou regle de diffusion.

### Marketing Template

Marketing Template represente un contenu reutilisable destine a une action marketing.

Il appartient au domaine Marketing tant qu'il decrit le contenu metier d'une campagne. Son format, ses variables, sa version et sa compatibilite avec un canal devront etre precises avant implementation. Les details propres a un fournisseur de diffusion restent dans une Integration.

### Marketing Automation

Marketing Automation represente une regle qui reagit a un declencheur explicite pour preparer ou executer une action marketing.

Une automatisation n'est jamais deduite d'un comportement implicite d'un autre module. Son declencheur, ses conditions, ses actions, son idempotence et ses garde-fous devront etre definis par PGYS-055.

### Delivery

Delivery represente la tentative de diffusion d'un message par un canal et un fournisseur determines.

Marketing peut demander une diffusion et conserver les faits metier necessaires au suivi d'une campagne. L'adaptation au fournisseur, les secrets, les appels externes et les retours techniques appartiennent au module Integrations.

### Consent and Communication Preference

Consent and Communication Preference decrivent l'autorisation et les choix applicables a l'utilisation d'un canal de communication.

Leur module proprietaire, leur portee, leur preuve, leur duree et leurs regles juridiques ne sont pas determines par PGYS-052. Aucun ticket Marketing ne doit envoyer de message tant que les controles applicables au canal concerne ne sont pas explicitement definis.

## Carte des responsabilites

| Concept | Module proprietaire | Utilisation par Marketing |
| --- | --- | --- |
| Workspace | Platform | Perimetre d'isolation de toutes les donnees Marketing |
| Business Partner | Business Partners | Identite du tiers pouvant appartenir a une audience |
| Role, Category et Tag | Business Partners | Criteres potentiels exposes par contrat public |
| Contact | Business Partners | Interlocuteur et coordonnees references sans duplication |
| CRM Opportunity et Activity | CRM | Contexte relationnel eventuel expose par contrat public |
| Audience | Marketing | Population evaluee pour une action marketing |
| Segment | Marketing | Definition reutilisable d'une population ciblable |
| Campaign | Marketing | Action marketing planifiee et suivie |
| Marketing Template | Marketing | Contenu reutilisable d'une campagne |
| Marketing Automation | Marketing | Orchestration explicite d'actions marketing |
| Delivery Provider | Integrations | Transport technique et adaptation aux fournisseurs |
| Marketing Report | Reporting | Vue consolidee construite sans devenir source de verite Marketing |

## Vue du domaine

```text
Workspace
   |
   +-- Business Partners
   |      +-- Roles
   |      +-- Categories
   |      +-- Tags
   |      +-- Contacts
   |
   +-- Marketing
          +-- Segments (PGYS-053)
          |      +-- Audience evaluation
          +-- Campaigns (PGYS-054)
          |      +-- Marketing Templates
          |      +-- Audience selection
          |      +-- Delivery requests -> Integrations
          +-- Marketing Automations (PGYS-055)
```

Les lignes de cette carte indiquent des responsabilites et des references metier. Elles ne prescrivent pas les relations de persistance.

## Frontieres avec Business Partners

Business Partners reste la source de verite pour l'identite et les coordonnees communes des tiers.

Marketing doit respecter les regles suivantes :

- un membre d'audience reference un Business Partner existant dans le meme Workspace ;
- un Contact reste rattache a son Business Partner et n'est pas copie dans Marketing ;
- les roles, categories et tags restent geres par Business Partners ;
- un Segment consulte ces informations au travers de contrats publics explicites ;
- une donnee exclusivement marketing appartient a Marketing et ne surcharge pas la fiche du tiers ;
- aucun acces direct au repository ou aux modeles Prisma de Business Partners n'est autorise.

## Frontieres avec CRM

CRM suit la relation commerciale, les opportunites et les activites. Marketing constitue des audiences et conduit des actions marketing.

Marketing peut, par contrat public :

- utiliser un contexte CRM explicitement expose comme critere futur de segmentation ;
- rattacher un fait marketing a un Business Partner suivi par CRM ;
- publier un fait metier susceptible d'alimenter l'historique relationnel.

Marketing ne modifie pas directement un pipeline, une opportunite ou une activite CRM. PGYS-052 ne definit aucun critere CRM de segmentation et aucun evenement partage executable.

## Frontieres avec Integrations

Marketing exprime l'intention de diffuser. Integrations realise l'echange technique avec un fournisseur externe.

Les contrats de diffusion devront garantir que :

- Marketing ne connait pas les secrets du fournisseur ;
- le fournisseur est remplaçable derriere un contrat explicite ;
- les identifiants et statuts techniques sont traduits en faits metier stables ;
- les tentatives, erreurs et reprises sont tracables ;
- l'idempotence et les limites d'envoi sont definies avant toute automatisation.

Les contrats Email et SMS appartiennent respectivement a PGYS-061 et PGYS-062. PGYS-052 ne les implemente pas.

## Frontieres avec Reporting

Marketing expose les donnees et faits dont il est proprietaire. Reporting construit les indicateurs et vues consolidees.

Un rapport ne doit pas devenir la source de verite d'un Segment, d'une Campaign, d'un Template, d'une Automation ou d'une Delivery.

## Invariants structurants

- toute donnee Marketing propre a un client appartient a un Workspace explicite ;
- aucune operation Marketing ne peut traverser les limites d'un Workspace ;
- Marketing ne duplique pas l'identite d'un Business Partner ou d'un Contact ;
- chaque concept a un module proprietaire unique ;
- les donnees d'un autre module sont utilisees uniquement par des contrats publics explicites ;
- les modeles Prisma d'un autre module ne sont jamais manipules directement ;
- une intention marketing est distincte de son transport par un fournisseur ;
- aucune diffusion ne contourne les controles de consentement et de preference qui seront definis pour son canal ;
- les faits de campagne et de diffusion ne sont pas reecrits pour representer un nouvel etat courant ;
- une application Marketing compose le domaine, mais ne devient pas proprietaire de ses regles metier.

## Parcours metier cibles

Les parcours suivants bornent les futurs tickets sans en definir les details techniques.

### Constituer une audience reutilisable

1. Les Business Partners existent dans un Workspace.
2. Un Segment decrit des criteres marketing autorises.
3. Marketing evalue ces criteres par les contrats publics des modules proprietaires.
4. Le resultat reference les tiers sans copier leurs donnees communes.

### Preparer une campagne

1. Une Campaign est creee dans un Workspace.
2. Une audience et un contenu lui sont associes.
3. Les controles metier requis sont verifies avant son lancement.
4. La diffusion eventuelle passe par un contrat public d'Integration.

### Reagir a un fait metier

1. Un module publie un evenement dont le contrat est documente.
2. Une Marketing Automation activee reconnait ce declencheur.
3. Ses conditions et garde-fous sont evalues dans le meme Workspace.
4. L'action resultante est idempotente et tracable.

## Evenements metier pressentis

Les evenements suivants expriment des faits possibles du domaine. Leur contrat exact n'est pas defini par PGYS-052 :

- Marketing Segment Created ;
- Marketing Audience Evaluated ;
- Marketing Campaign Created ;
- Marketing Campaign Launched ;
- Marketing Delivery Requested ;
- Marketing Automation Triggered.

Les tickets proprietaires devront confirmer les noms, donnees, producteurs, consommateurs, exigences d'idempotence et regles de confidentialite avant implementation.

## Sequence des tickets Marketing

La cartographie prepare les tickets suivants sans les implementer :

1. PGYS-053 - Segments Foundation - segments dynamiques evalues a la demande ;
2. PGYS-054 - Campaigns & Templates Foundation - preparation sans diffusion ;
3. PGYS-055 - Marketing Automation Foundation.

Chaque ticket doit definir son agregat, ses invariants, son cycle de vie, ses contrats publics et ses exclusions avant d'introduire du code ou de la persistance.

## Decisions differees

PGYS-052 ne decide pas :

- les volumes, limites et performances d'evaluation ;
- les variables et le versionnement des Marketing Templates ;
- le module proprietaire et les regles des consentements et preferences de communication ;
- la selection d'un Contact ou d'une coordonnee pour une diffusion ;
- la strategie de desinscription et de suppression ;
- les fournisseurs email, SMS ou autres ;
- les regles d'idempotence, de reprise et de limitation des diffusions ;
- les declencheurs, conditions et actions des Marketing Automations ;
- les indicateurs, tableaux de bord, exports ou analyses consolidees ;
- l'interface d'une application Marketing.

Ces decisions appartiennent a des tickets dedies et ne doivent pas etre deduites de cette cartographie.

## Non-objectifs

Ce ticket ne cree :

- aucun module applicatif ;
- aucune migration ;
- aucun modele Prisma ;
- aucun controller, service ou repository ;
- aucun contrat API ;
- aucun moteur de segmentation ;
- aucune campagne executable ;
- aucun template executable ;
- aucune automatisation ;
- aucune integration externe ;
- aucune interface utilisateur.

## Criteres pour les futurs tickets

Avant toute implementation Marketing, le ticket concerne doit confirmer :

- le concept metier proprietaire ;
- son rattachement explicite a `workspaceId` ;
- ses references vers Business Partner et Contact ;
- ses invariants et transitions ;
- ses contrats publics avec CRM, Business Partners, Integrations et Reporting ;
- les controles de consentement et de preference applicables ;
- les faits historiques qui doivent rester immuables ;
- les exigences d'idempotence et de tracabilite ;
- les exclusions necessaires pour eviter d'absorber CRM, Integrations ou Reporting.
