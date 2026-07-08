# Business Modeling Guidelines PGYS

## Objectif

Ce document definit les regles de modelisation metier PGYS avant le developpement des modules ERP.

Il sert de reference pour transformer les besoins fonctionnels en concepts generiques, coherents, multi-tenant et reutilisables par plusieurs modules.

## Quand creer une entite

Une entite doit etre creee lorsqu'un concept metier possede une identite propre et un cycle de vie.

Une entite est appropriee lorsque :

- le concept doit etre retrouve, modifie ou historise dans le temps ;
- plusieurs attributs changent sans changer l'identite du concept ;
- le concept porte des regles metier importantes ;
- le concept est reference par d'autres objets metier ;
- le concept appartient a un workspace ou a la plateforme.

Exemples :

- Customer ;
- Product ;
- Invoice ;
- Order ;
- Payment ;
- Warehouse.

Une entite ne doit pas etre creee pour un simple groupe de champs sans identite propre.

## Quand creer un Value Object

Un Value Object doit etre cree lorsqu'un concept est defini par ses valeurs et non par une identite.

Un Value Object est approprie lorsque :

- deux instances ayant les memes valeurs sont equivalentes ;
- le concept represente une mesure, une adresse, une periode, un montant ou un code structure ;
- le concept encapsule une validation locale ;
- le concept n'a pas de cycle de vie independant.

Exemples :

- Money ;
- EmailAddress ;
- PhoneNumber ;
- DateRange ;
- TaxRate ;
- CustomerCode ;
- InvoiceNumber.

Un Value Object ne doit pas acceder a Prisma, a un repository ou a un module applicatif.

## Quand creer un module

Un module doit representer une responsabilite metier claire et autonome.

Un module est approprie lorsque :

- il porte un vocabulaire metier identifiable ;
- il possede ses propres entites ou cas d'usage ;
- il peut evoluer sans modifier directement les autres modules ;
- il expose des contrats publics pour les autres modules ;
- il peut etre teste independamment.

Exemples :

- Customers ;
- Products ;
- Inventory ;
- Sales ;
- Invoices ;
- Payments ;
- Subscriptions.

Un module ne doit pas etre cree pour un seul endpoint, un seul client pilote ou une variante trop specifique d'un processus existant.

## Regles de nommage metier

Les noms doivent utiliser le vocabulaire metier generique de PGYS.

Regles :

- utiliser des noms explicites et stables ;
- preferer les noms metier aux noms techniques ;
- eviter les abreviations non standard ;
- utiliser l'anglais pour les noms de modules, entites, DTO, champs et API ;
- utiliser le singulier pour les entites ;
- utiliser le pluriel pour les collections et routes REST ;
- eviter les noms lies a un client, un projet pilote ou une integration specifique.

Exemples recommandes :

- Customer ;
- Invoice ;
- Product ;
- Subscription ;
- WorkspaceService.

Exemples a eviter :

- CustomerForPilotClient ;
- SpecialInvoiceMode ;
- ERPClientAProduct ;
- TemporaryBillingObject.

## Gestion des codes metier

Les codes metier sont des identifiants lisibles par les utilisateurs ou par les processus metier.

Ils ne remplacent pas les identifiants techniques.

Regles generales :

- l'identifiant technique reste un UUID ;
- le code metier doit etre unique dans le perimetre fonctionnel pertinent ;
- pour les donnees client, l'unicite est generalement limitee au workspace ;
- le format doit etre documente par le module proprietaire ;
- la generation automatique doit rester dans le service applicatif du module concerne ;
- un code metier ne doit pas encoder une logique fragile ou trop specifique.

Exemples :

- customer code : unique par workspace ;
- invoice number : unique par workspace et par sequence de facturation ;
- product code : unique par workspace ;
- order number : unique par workspace.

Un code metier peut etre expose dans l'API. Un ID technique reste necessaire pour les relations internes et les operations de persistance.

## Entite metier, DTO, modele Prisma et vue API

Ces quatre notions doivent rester separees.

### Entite metier

L'entite metier represente le concept du domaine.

Elle porte :

- l'identite metier ;
- les invariants ;
- les transitions autorisees ;
- le vocabulaire du domaine.

Elle ne doit pas dependre de Prisma, d'un controller ou d'un format HTTP.

### DTO

Le DTO represente les donnees acceptees ou exposees par une operation applicative.

Il sert a :

- valider l'entree API ;
- documenter le contrat public ;
- proteger le domaine des formats externes ;
- eviter d'exposer directement les modeles de persistance.

Un DTO ne doit pas porter de logique metier lourde.

### Modele Prisma

Le modele Prisma represente la structure de persistance.

Il sert a :

- definir les tables ;
- definir les relations ;
- definir les index et contraintes ;
- supporter les migrations.

Un modele Prisma ne doit pas etre expose directement par les controllers.

### Vue API

La vue API represente la forme retournee au consommateur.

Elle peut differer de l'entite metier et du modele Prisma pour :

- masquer des champs internes ;
- presenter des champs agreges ;
- stabiliser le contrat public ;
- preparer le versionnement de l'API.

## Eviter les modules trop specifiques a un client pilote

PGYS doit rester une plateforme generique.

Toute demande issue d'un client pilote doit etre analysee avant implementation.

Regles :

- identifier le besoin metier sous-jacent ;
- separer le besoin generique de la preference locale ;
- nommer le concept avec un vocabulaire reutilisable ;
- refuser les champs, statuts ou endpoints nommes d'apres un client ;
- privilegier la configuration lorsque le comportement varie sans changer le modele metier ;
- documenter les arbitrages lorsqu'un besoin est volontairement exclu.

Une demande specifique client doit etre transformee en concept generique ou refusee.

## Regles multi-tenant

Toute entite metier appartenant a un client doit etre rattachee a un workspace.

Regles :

- une donnee client doit contenir un `workspaceId` ;
- les contraintes d'unicite metier doivent inclure `workspaceId` lorsque la donnee est propre a un workspace ;
- les repositories doivent filtrer par workspace pour les donnees tenant ;
- un module ne doit jamais supposer un workspace implicite sans contexte explicite ;
- les donnees plateforme partagees peuvent exister sans `workspaceId` uniquement si elles sont globales par nature.

Exemples de donnees rattachees a un workspace :

- Customer ;
- Product ;
- Invoice ;
- Order ;
- Payment ;
- WorkspaceService.

Exemples de donnees plateforme globales :

- ServiceCatalogItem ;
- Feature ;
- Offer publique ;
- configuration systeme globale.

## Dependances entre modules

Aucun module metier ne doit dependre directement d'un autre module sans contrat public.

Regles :

- un module expose ses operations via un service public ou un contrat explicite ;
- un module ne doit pas acceder au repository interne d'un autre module ;
- un module ne doit pas manipuler directement les modeles Prisma d'un autre module ;
- les communications asynchrones doivent passer par des evenements de domaine ;
- les dependances doivent rester orientees selon l'architecture PGYS.

Lorsqu'un besoin traverse plusieurs modules, il doit etre exprime par :

- un contrat public ;
- un evenement de domaine ;
- un service applicatif d'orchestration ;
- ou un workflow documente.

## Regles de decision

Avant de creer un nouveau concept metier, verifier :

- est-ce une entite, un Value Object, un DTO ou une vue API ?
- le concept a-t-il une identite et un cycle de vie ?
- le concept appartient-il a un workspace ?
- le nom est-il generique et reutilisable ?
- le besoin vient-il d'un seul client pilote ?
- le module proprietaire est-il clair ?
- existe-t-il un contrat public si un autre module doit l'utiliser ?
- le modele evite-t-il de melanger domaine, API et persistance ?

Si une demande ne peut pas etre transformee en concept generique, elle doit etre refusee ou reportee jusqu'a clarification produit.

## Principes non negociables

- Une entite metier client est rattachee a un workspace.
- Un module metier possede ses propres responsabilites.
- Aucun acces direct aux repositories d'un autre module.
- Aucun modele Prisma expose directement par l'API.
- Aucun concept nomme d'apres un client pilote.
- Aucun module cree uniquement pour une exception locale.
- Toute demande specifique client est transformee en concept generique ou refusee.
