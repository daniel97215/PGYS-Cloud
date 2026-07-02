# Platform Map PGYS v1

## Objectif

Ce document définit la cartographie d'architecture globale de PGYS.

Il sert de référence aux futurs ADR, tickets Codex et développements afin de garder une séparation claire entre le coeur plateforme, les modules métier, les applications et les extensions.

## Vue d'ensemble

PGYS est organisé en quatre niveaux d'architecture :

1. Platform
2. Business Modules
3. Applications
4. Extensions

Les dépendances internes autorisées suivent le sens suivant :

```text
Applications
    ↓
Business Modules
    ↓
Platform
```

Les extensions sont connectées au système par des contrats explicites. Elles ne doivent jamais imposer de dépendance au coeur PGYS.

## Niveau 1 - Platform

La Platform regroupe les capacités transverses nécessaires à tous les produits PGYS.

Elle fournit les fondations techniques et fonctionnelles communes, sans porter de logique métier spécifique à une verticale ou à une offre commerciale.

Rôle de la Platform :

- gérer l'identité, l'authentification et les accès ;
- porter le modèle Workspace ;
- fournir les services transverses de notifications, files, audit et événements ;
- exposer les contrats techniques stables consommés par les modules métier ;
- isoler les intégrations techniques communes ;
- garantir la cohérence, la sécurité et l'observabilité du socle PGYS.

Modules indicatifs Platform :

- Auth
- Workspace
- Identity
- Permissions
- Notifications
- Event Bus
- Queue
- Scheduler
- Files
- Audit
- AI
- Provisioning

## Niveau 2 - Business Modules

Les Business Modules portent la logique métier générique de PGYS.

Ils représentent des domaines fonctionnels réutilisables par plusieurs applications, sans dépendre directement d'une interface utilisateur ou d'un canal de distribution.

Rôle des Business Modules :

- modéliser les concepts métier ;
- exposer des cas d'usage métier cohérents ;
- s'appuyer sur la Platform pour les capacités transverses ;
- fournir des contrats consommables par les applications ;
- rester indépendants des choix d'interface et des extensions techniques.

Modules indicatifs Business :

- Catalog
- Customers
- Products
- Inventory
- Sales
- Purchases
- Payments
- Pricing
- Subscription
- CRM
- Marketing
- Reports

## Niveau 3 - Applications

Les Applications assemblent les modules métier et les capacités plateforme pour proposer une expérience utilisateur ou un produit final.

Une application peut orchestrer plusieurs modules, mais elle ne doit pas contenir de logique métier lourde. Cette logique doit rester dans les Business Modules.

Rôle des Applications :

- exposer une expérience adaptée à un usage ou à une verticale ;
- composer les modules métier nécessaires ;
- gérer les écrans, parcours, commandes et vues ;
- adapter la présentation sans dupliquer les règles métier ;
- rester remplaçables sans remettre en cause le coeur PGYS.

Applications indicatives :

- ERP
- CRM SaaS
- Marketing SaaS
- POS
- Production
- Association

## Niveau 4 - Extensions

Les Extensions connectent PGYS à des services externes, fournisseurs, outils tiers ou capacités optionnelles.

Une extension ne fait pas partie du coeur PGYS. Elle doit être remplaçable, désactivable et isolée derrière un contrat explicite.

Rôle des Extensions :

- intégrer des fournisseurs externes ;
- adapter des API tierces aux contrats PGYS ;
- isoler les dépendances techniques ou commerciales ;
- permettre l'ajout futur de connecteurs sans modifier le coeur ;
- éviter que les choix de fournisseur dictent l'architecture interne.

Extensions indicatives :

- Stripe
- OVH
- OpenAI
- Mistral
- Email
- SMS
- WhatsApp
- Accounting tools

## Règles de dépendance

### Dépendances autorisées

Les dépendances internes suivent ce sens :

```text
Applications
    ↓
Business Modules
    ↓
Platform
```

Une Application peut dépendre de Business Modules et de contrats Platform.

Un Business Module peut dépendre de la Platform.

La Platform ne dépend pas des Business Modules, des Applications ou des Extensions.

Les Extensions sont appelées via des contrats explicites depuis la Platform ou depuis un Business Module lorsque le besoin métier le justifie.

### Dépendances interdites

La Platform ne dépend jamais du Business.

Un Business Module ne dépend pas directement d'un autre Business Module sans contrat explicite.

Une Application ne contient pas de logique métier lourde.

Une Extension ne doit jamais imposer de dépendance au coeur PGYS.

Une Extension ne doit pas devenir la source de vérité d'un concept central PGYS.

Une Application ne doit pas contourner les Business Modules pour accéder directement aux détails techniques d'une Extension.

## Principes architecturaux non négociables

Le Workspace est le point d'ancrage principal des usages PGYS.

La Platform reste stable, générique et indépendante des verticales métier.

Les Business Modules portent la logique métier et exposent des contrats clairs.

Les Applications composent, présentent et orchestrent, mais ne deviennent pas le coeur métier.

Les Extensions restent optionnelles, isolées et remplaçables.

Les dépendances doivent aller du spécifique vers le générique, jamais l'inverse.

Toute dépendance transversale durable doit être documentée par un ADR.

Tout nouveau module doit être classé explicitement dans l'un des quatre niveaux avant implémentation.

## Impact pour les futurs tickets Codex

Chaque ticket Codex créant un module doit préciser son niveau d'architecture : Platform, Business Module, Application ou Extension.

Un ticket Platform ne doit pas introduire de dépendance vers un module Business, une Application ou une Extension spécifique.

Un ticket Business doit décrire les contrats Platform utilisés et éviter les dépendances implicites vers d'autres modules Business.

Un ticket Application doit limiter la logique métier au strict minimum et déléguer les règles métier aux Business Modules.

Un ticket Extension doit rester isolé derrière une interface ou un contrat explicite, sans modifier le coeur PGYS pour satisfaire un fournisseur spécifique.

Lorsqu'un ticket nécessite une dépendance qui ne respecte pas cette carte, un ADR doit être créé ou mis à jour avant l'implémentation.

Cette carte doit être utilisée comme référence de cadrage avant toute évolution structurante du monorepo PGYS.
