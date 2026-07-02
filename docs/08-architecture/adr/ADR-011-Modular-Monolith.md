ADR-011 - Modular Monolith

## Statut

Accepte.

## Contexte

PGYS doit rester simple a developper, deployer et maintenir tout en permettant l'ajout progressif de modules.

La Platform Map definit quatre niveaux d'architecture : Platform, Business Modules, Applications et Extensions. Cette carte sert de reference pour organiser les frontieres internes du monorepo PGYS.

Les ADR precedents posent deja deux principes structurants :

- les actions importantes peuvent produire des evenements metier ;
- les donnees PGYS sont rattachees a un Workspace.

PGYS a donc besoin d'une architecture qui permette des frontieres strictes sans introduire trop tot la complexite operationnelle de microservices.

## Decision

PGYS est construit comme un monolithe modulaire API-first.

Le systeme reste deploye comme une API principale, mais son code est organise en modules clairement separes. Chaque module expose des contrats publics et garde ses details internes prives.

Les niveaux d'architecture sont ceux de la Platform Map :

- Platform : capacites transverses comme Auth, Workspace, Identity, Permissions, Notifications, Event Bus, Queue, Scheduler, Files, Audit, AI et Provisioning.
- Business Modules : domaines metier comme Catalog, Customers, Products, Inventory, Sales, Purchases, Payments, Pricing, Subscription, CRM, Marketing et Reports.
- Applications : experiences ou produits assemblant les modules, comme ERP, CRM SaaS, Marketing SaaS, POS, Production et Association.
- Extensions : connecteurs externes comme Stripe, OVH, OpenAI, Mistral, Email, SMS, WhatsApp et outils comptables.

## Pourquoi pas des microservices maintenant

Les microservices ne sont pas retenus comme architecture initiale.

Ils introduiraient trop tot :

- de la complexite reseau ;
- de la synchronisation distribuee ;
- de l'observabilite distribuee ;
- de la gestion de versions entre services ;
- des deploiements coordonnes ;
- des risques de duplication des modeles metier ;
- une charge d'exploitation inutile au demarrage.

PGYS doit d'abord valider ses domaines, ses modules et ses contrats internes avant d'extraire des services autonomes.

## Regles de dependance

Les dependances autorisees suivent le sens defini par la Platform Map :

```text
Applications
    ↓
Business Modules
    ↓
Platform
```

La Platform ne depend jamais d'un Business Module, d'une Application ou d'une Extension.

Un Business Module peut dependre de la Platform.

Une Application peut dependre de Business Modules et de contrats Platform.

Une Extension reste isolee derriere un contrat explicite. Elle ne doit pas imposer de dependance au coeur PGYS.

Un Business Module ne depend pas directement d'un autre Business Module sans contrat public explicite.

## Frontieres entre modules

Chaque module possede ses propres responsabilites, services, repositories, DTO et contrats publics.

Un module ne doit pas acceder directement aux donnees internes d'un autre module.

Sont interdits :

- l'acces direct aux tables internes d'un autre module ;
- l'import de repositories internes d'un autre module ;
- la modification d'un etat metier appartenant a un autre module sans passer par son contrat public ;
- les dependances circulaires entre modules ;
- les raccourcis applicatifs qui contournent une regle metier.

Les communications entre modules passent par :

- des services publics explicitement exportes ;
- des DTO ou types de contrat stables ;
- des evenements metier lorsqu'un couplage direct n'est pas necessaire ;
- l'Event Bus pour diffuser les changements importants.

## API-first

L'API PGYS est la surface principale d'orchestration et d'exposition des capacites.

Les Applications consomment l'API ou ses contrats applicatifs. Elles ne doivent pas embarquer de logique metier lourde.

Les regles metier restent dans les Business Modules ou dans la Platform lorsque la capacite est transverse.

## Extraction future

Un module pourra etre extrait vers un microservice uniquement si cela devient necessaire.

Les criteres possibles sont :

- besoins de scalabilite independante ;
- cycle de deploiement reellement autonome ;
- dependances techniques incompatibles avec l'API principale ;
- isolation de securite ou de conformite ;
- charge d'exploitation justifiee par la maturite du domaine.

L'extraction doit etre precedee d'un ADR dedie.

Elle ne doit pas changer les contrats publics consommes par les autres modules sans migration explicite.

## Consequences

PGYS garde une base simple et maintenable.

Les frontieres de modules doivent etre respectees des les premiers developpements.

Les futurs tickets Codex doivent indiquer le niveau d'architecture concerne et eviter les dependances hors carte.

Les modules peuvent evoluer vers des services autonomes plus tard, mais seulement lorsque le besoin est demontre.
