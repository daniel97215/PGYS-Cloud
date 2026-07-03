# Core Audit Report - PGYS

## Objectif

Ce rapport audite le Core SaaS PGYS deja produit afin d'identifier les points conformes, les zones a ameliorer et les corrections necessaires avant de poursuivre vers Billing, ERP, CRM et Marketing.

Perimetre audite :

- workspace
- workspace-services
- service-catalog
- features
- offers
- offer-features
- pricing
- subscriptions
- provisioning
- customers

References principales :

- ADR-011 - Modular Monolith
- ADR-012 - Shared Kernel
- ADR-013 - Persistence Strategy
- ADR-014 - API Design
- ADR-015 - Domain Events
- ADR-016 - Module Template

Legende :

- ✅ Conforme
- ⚠️ A ameliorer
- ❌ A corriger

## Synthese globale

| Axe | Statut | Constat |
| --- | --- | --- |
| Architecture | ⚠️ A ameliorer | Les modules sont bien separes dans le code, mais plusieurs repositories lisent directement les donnees d'autres modules. |
| Prisma | ⚠️ A ameliorer | Les relations et index principaux existent, mais plusieurs statuts restent en `String` et certaines contraintes metier ne sont pas garanties en base. |
| API | ❌ A corriger | L'API n'applique pas encore le prefixe global `/api/v1` attendu par ADR-014 et plusieurs controllers sensibles ne sont pas proteges par JWT. |
| DTO | ✅ Conforme | Les DTO dedies existent pour les modules recents et la validation globale est active. |
| Tests | ⚠️ A ameliorer | Les tests unitaires sont presents et passent, mais les tests d'integration restent insuffisants pour le vertical slice Core SaaS. |
| Qualite | ⚠️ A ameliorer | Les constantes progressent, mais les conventions de statuts, guards, erreurs et pagination ne sont pas encore uniformes. |

## Verification outillage

Commandes observees lors de l'audit :

```text
pnpm --filter api prisma validate
Resultat : OK

pnpm --filter api test
Resultat : OK

pnpm --filter api build
Resultat : KO
```

Le build echoue sur `apps/api/src/workspace/workspace-services.controller.ts` a cause des options Swagger `ApiProperty` / `ApiPropertyOptional` de type `object` sans `additionalProperties`.

## Constats transverses

### Architecture et dependances

- ⚠️ A ameliorer : la structure actuelle respecte le monolithe modulaire dans l'organisation des dossiers, mais elle ne suit pas encore pleinement le template en couches d'ADR-016.
- ⚠️ A ameliorer : plusieurs modules utilisent une structure plate `controller/service/repository/dto/tests`, coherente avec les tickets de fondation, mais differente du modele cible `domain/application/infrastructure/presentation`.
- ❌ A corriger : certains repositories accedent directement aux tables d'autres modules, ce qui fragilise les frontieres ADR-011 et ADR-013.
- ⚠️ A ameliorer : les contrats publics inter-modules ne sont pas encore formalises.

### Prisma

- ✅ Conforme : les modeles principaux du Core SaaS utilisent des UUID.
- ✅ Conforme : les entites tenant-aware sont rattachees a `Workspace` lorsque necessaire.
- ⚠️ A ameliorer : plusieurs champs de statut sont des `String` sans enum Prisma ni contrainte applicative centralisee partout.
- ⚠️ A ameliorer : certaines contraintes metier sont appliquees par convention de service mais pas garanties en base.
- ⚠️ A ameliorer : la strategie de soft delete / archivage varie selon les modules.

### API

- ❌ A corriger : le prefixe `/api/v1` attendu par ADR-014 n'est pas applique globalement.
- ❌ A corriger : plusieurs controllers exposant des operations sensibles n'ont pas de `JwtAuthGuard`.
- ⚠️ A ameliorer : les endpoints ne partagent pas encore une convention uniforme de routes imbriquees par workspace.
- ⚠️ A ameliorer : les listes ne sont pas encore paginees alors qu'ADR-014 rend la pagination obligatoire pour les collections qui peuvent croitre.
- ⚠️ A ameliorer : les erreurs reposent sur les exceptions NestJS standards, sans format uniforme `code`, `message`, `details`, `correlationId`.

### Tests

- ✅ Conforme : les modules recents disposent de tests unitaires service et repository.
- ⚠️ A ameliorer : les controllers ne sont pas couverts.
- ⚠️ A ameliorer : les guards, permissions et controles de workspace ne sont pas couverts.
- ⚠️ A ameliorer : les migrations Prisma ne sont pas validees par des tests d'integration.
- ⚠️ A ameliorer : le vertical slice `Workspace -> Offer -> Subscription -> Provisioning -> Workspace Services -> Features` n'est pas encore valide de bout en bout.

## Audit par module

## 1. workspace

### Frontieres de module

- ✅ Conforme : le module porte le concept central Workspace et ses responsabilites principales.
- ✅ Conforme : le controller delegue la logique au service.
- ⚠️ A ameliorer : le module regroupe plusieurs responsabilites proches, notamment workspace, members, profile et settings.

### Acces Prisma

- ✅ Conforme : l'acces Prisma est concentre dans le repository du module.
- ⚠️ A ameliorer : le repository est volumineux et porte plusieurs sous-domaines Workspace.

### DTO

- ✅ Conforme : les DTO existent pour creation, mise a jour, invitation, roles, profile et settings.
- ✅ Conforme : les validators dedies existent pour des besoins specifiques comme le slug ou le profil.

### Controller

- ✅ Conforme : le controller principal est protege par JWT.
- ✅ Conforme : les routes Workspace principales utilisent `ParseUUIDPipe`.
- ⚠️ A ameliorer : certaines operations Workspace restent tres proches du modele applicatif interne.

### Service

- ✅ Conforme : le service centralise les controles d'acces principaux.
- ⚠️ A ameliorer : le service concentre plusieurs cas d'usage qui pourront etre separes si le module grossit.

### Repository

- ✅ Conforme : le repository encapsule Prisma.
- ⚠️ A ameliorer : la taille du repository reduit la lisibilite et rend les responsabilites moins nettes.

### Tests

- ✅ Conforme : tests unitaires presents pour service, repository, profile et settings.
- ⚠️ A ameliorer : tests d'integration absents pour les flux complets Workspace + membres + settings.

### ADR 011 a 016

- ✅ Conforme : Workspace respecte le principe Workspace-first.
- ⚠️ A ameliorer : structure en couches ADR-016 non encore appliquee completement.

## 2. workspace-services

### Frontieres de module

- ✅ Conforme : le module reste centre sur les services actives par workspace.
- ⚠️ A ameliorer : le code est place dans `workspace/` au lieu d'un module dedie `workspace-services/`, ce qui peut brouiller la frontiere a terme.

### Acces Prisma

- ✅ Conforme : acces Prisma limite au repository.
- ✅ Conforme : unicite `workspaceId + serviceKey` presente en base.

### DTO

- ⚠️ A ameliorer : les DTO sont definis dans le controller sous forme de classes locales.
- ❌ A corriger : la declaration Swagger des objets JSON de configuration casse le build TypeScript car `additionalProperties` manque.

### Controller

- ✅ Conforme : controller protege par JWT.
- ⚠️ A ameliorer : le controller ne verifie pas lui-meme les permissions workspace ; il depend du service pour tout controle.
- ⚠️ A ameliorer : les routes utilisent `configuration` alors que certains tickets precedents mentionnaient `config`, ce qui doit rester documente comme contrat API.

### Service

- ✅ Conforme : validation de la configuration JSON objet presente.
- ✅ Conforme : NotFound gere pour les services inconnus.
- ⚠️ A ameliorer : les statuts sont en constantes mais pas encore alignes avec une convention globale.

### Repository

- ✅ Conforme : repository dedie.
- ✅ Conforme : activation idempotente via upsert.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de test controller ou e2e sur les routes.

### ADR 011 a 016

- ✅ Conforme : respecte globalement Repository Pattern.
- ⚠️ A ameliorer : DTO separes et structure ADR-016 a renforcer.

## 3. service-catalog

### Frontieres de module

- ✅ Conforme : module Platform/Core Service independant du workspace et des abonnements.
- ✅ Conforme : pas de dependance metier directe vers Workspace Services ou Billing.

### Acces Prisma

- ✅ Conforme : acces Prisma limite au repository.
- ✅ Conforme : indexes sur `status`, `category`, `visibility`.

### DTO

- ✅ Conforme : DTO dedies de creation et mise a jour.
- ⚠️ A ameliorer : `configurationSchema` JSON devrait avoir une convention commune de validation OpenAPI.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT alors qu'il permet create/update/archive.
- ⚠️ A ameliorer : absence de pagination sur la liste.

### Service

- ✅ Conforme : NotFound gere pour les services inconnus.
- ✅ Conforme : normalisation de cle.

### Repository

- ✅ Conforme : repository dedie.
- ✅ Conforme : operations CRUD et archive centralisees.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de tests d'autorisation ni de contrat HTTP.

### ADR 011 a 016

- ✅ Conforme : frontiere de module claire.
- ⚠️ A ameliorer : securite et pagination ADR-014 incompletes.

## 4. features

### Frontieres de module

- ✅ Conforme : module centre sur le registre de fonctionnalites.
- ✅ Conforme : pas de relation directe vers Offer au moment de la fondation, hormis la relation inverse ajoutee pour OfferFeature.

### Acces Prisma

- ✅ Conforme : acces Prisma limite au repository.
- ✅ Conforme : indexes sur `category` et `status`.

### DTO

- ✅ Conforme : DTO dedies.
- ⚠️ A ameliorer : statut en `String` sans enum Prisma.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT pour create/update/archive.
- ⚠️ A ameliorer : liste non paginee.

### Service

- ✅ Conforme : normalisation de cle et NotFound.
- ⚠️ A ameliorer : statuts autorises peu contraints hors DTO.

### Repository

- ✅ Conforme : repository dedie.
- ✅ Conforme : archive par changement de statut.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de tests d'integration API.

### ADR 011 a 016

- ✅ Conforme : responsabilite simple.
- ⚠️ A ameliorer : securite ADR-014 et structure ADR-016 a renforcer.

## 5. offers

### Frontieres de module

- ✅ Conforme : module centre sur les offres commerciales.
- ✅ Conforme : pas de pricing ou billing dans le module Offers.

### Acces Prisma

- ✅ Conforme : acces Prisma limite au repository.
- ✅ Conforme : relation avec OfferService et OfferFeature separee.

### DTO

- ✅ Conforme : DTO dedies.
- ⚠️ A ameliorer : statuts et visibilites restent des chaines libres.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT pour create/update/archive.
- ⚠️ A ameliorer : liste non paginee.

### Service

- ✅ Conforme : normalisation de cle et NotFound.
- ✅ Conforme : pas de logique Billing.

### Repository

- ✅ Conforme : repository dedie.
- ⚠️ A ameliorer : le statut archive est centralise, mais les autres statuts ne le sont pas.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de test controller ni de test d'autorisation.

### ADR 011 a 016

- ✅ Conforme : separation avec Pricing et Subscription.
- ⚠️ A ameliorer : API security et pagination ADR-014 incompletes.

## 6. offer-features

### Frontieres de module

- ✅ Conforme : module de liaison entre Offers et Features, responsabilite limitee.
- ⚠️ A ameliorer : ce sous-module vit dans `offers/`, ce qui est acceptable a court terme mais devra rester explicite.

### Acces Prisma

- ⚠️ A ameliorer : le repository lit directement `Offer` et `Feature`, deux concepts proprietaires d'autres modules.
- ✅ Conforme : relation N-N modelisee par `OfferFeature`.
- ✅ Conforme : unicite `offerId + featureId` et index presents.

### DTO

- ✅ Conforme : pas de DTO superflu si les operations passent par params.
- ⚠️ A ameliorer : responses non formalisees.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT.
- ⚠️ A ameliorer : routes a harmoniser avec la convention API versionnee.

### Service

- ✅ Conforme : gere NotFound pour Offer et Feature.
- ✅ Conforme : pas de logique Pricing/Billing.

### Repository

- ✅ Conforme : repository dedie.
- ⚠️ A ameliorer : acces direct aux modeles Offer et Feature a remplacer a terme par contrats publics ou services exportes.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de tests d'integration sur les contraintes N-N.

### ADR 011 a 016

- ⚠️ A ameliorer : dependance inter-module a formaliser.
- ✅ Conforme : responsabilite metier limitee.

## 7. pricing

### Frontieres de module

- ✅ Conforme : module Pricing limite a la definition des prix.
- ✅ Conforme : aucune logique Billing, TVA ou paiement.

### Acces Prisma

- ⚠️ A ameliorer : le repository lit directement `Offer` pour retrouver l'offre par key.
- ⚠️ A ameliorer : aucune contrainte base ne garantit l'absence de chevauchement de prix actifs.

### DTO

- ✅ Conforme : DTO create/update dedies.
- ⚠️ A ameliorer : `currency`, `billingPeriod` et `status` devraient etre centralises/valides de facon plus stricte.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT.
- ⚠️ A ameliorer : pas de pagination pour la liste des prix d'une offre.

### Service

- ✅ Conforme : controle NotFound sur Offer et Price.
- ⚠️ A ameliorer : la regle "un seul tarif actif par periode" n'est pas verifiee explicitement.

### Repository

- ✅ Conforme : repository dedie pour Price.
- ⚠️ A ameliorer : acces inter-module a Offer.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de test sur chevauchement de periodes actives.

### ADR 011 a 016

- ⚠️ A ameliorer : frontiere avec Offers a renforcer.
- ⚠️ A ameliorer : contraintes de persistance ADR-013 incompletes.

## 8. subscriptions

### Frontieres de module

- ✅ Conforme : module limite au cycle de vie d'abonnement.
- ✅ Conforme : pas de facturation, paiement ou provisioning direct.

### Acces Prisma

- ⚠️ A ameliorer : le repository lit directement Workspace, Offer et Price.
- ✅ Conforme : index principaux sur workspace, status et renewalDate.
- ⚠️ A ameliorer : la contrainte "une seule subscription active par Workspace et Offer" existe en migration SQL partielle, mais n'apparait pas dans le schema Prisma.

### DTO

- ✅ Conforme : DTO dedies pour create, change offer, cancel, reactivate.
- ⚠️ A ameliorer : statuts sous constantes applicatives mais pas en enum Prisma.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT.
- ⚠️ A ameliorer : les params UUID ne sont pas valides par pipe dans le controller.
- ⚠️ A ameliorer : routes workspace imbriquees sous `subscriptions/workspaces/:workspaceId`, a harmoniser avec les autres conventions.

### Service

- ✅ Conforme : cycle de vie principal implemente.
- ⚠️ A ameliorer : transitions d'etat a documenter et tester davantage.

### Repository

- ✅ Conforme : repository dedie pour Subscription.
- ⚠️ A ameliorer : dependances directes vers repositories implicites d'autres modules via Prisma.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : tests de transitions metier incomplets.
- ⚠️ A ameliorer : pas de test d'integration sur contrainte d'unicite active.

### ADR 011 a 016

- ⚠️ A ameliorer : frontieres inter-modules a formaliser.
- ⚠️ A ameliorer : API security ADR-014 incomplete.

## 9. provisioning

### Frontieres de module

- ✅ Conforme : orchestrateur separe du service principal.
- ✅ Conforme : le module ne contient pas de Billing, paiement ou notification.
- ⚠️ A ameliorer : le module lit directement plusieurs modeles d'autres modules au lieu de passer par contrats publics.

### Acces Prisma

- ✅ Conforme : les jobs de provisioning ont un repository dedie.
- ⚠️ A ameliorer : le repository accede directement a Subscription, Offer, OfferFeature et WorkspaceService.
- ⚠️ A ameliorer : `ProvisioningJob` n'a pas de relation Prisma formelle vers Workspace ou Subscription, seulement des IDs.

### DTO

- ✅ Conforme : DTO dedies provision/reprovision/deprovision.
- ⚠️ A ameliorer : operation et status gagneraient a etre contraints en enum ou constantes partagees.

### Controller

- ⚠️ A ameliorer : controller non protege par JWT.
- ⚠️ A ameliorer : params UUID non valides par pipe.

### Service

- ✅ Conforme : service principal distinct de l'orchestrateur.
- ✅ Conforme : idempotence partielle via recherche de job reusable.
- ⚠️ A ameliorer : strategie de rejeu et de failed job a documenter/tester davantage.

### Repository

- ✅ Conforme : repository dedie pour ProvisioningJob.
- ❌ A corriger : acces direct aux donnees internes de plusieurs modules, contraire a la cible ADR-011/ADR-013.

### Tests

- ✅ Conforme : tests service, repository et orchestrateur presents.
- ⚠️ A ameliorer : pas de test d'integration du vertical slice complet.

### ADR 011 a 016

- ⚠️ A ameliorer : separation service/orchestrateur conforme, mais contrats inter-modules encore trop implicites.
- ⚠️ A ameliorer : Domain Events attendus par ADR-015 non materialises.

## 10. customers

### Frontieres de module

- ✅ Conforme : module Business ERP Foundation dedie aux tiers generiques.
- ✅ Conforme : pas d'adresse, contact, document, categorie ou historique dans le scope actuel.

### Acces Prisma

- ✅ Conforme : acces Prisma limite au repository.
- ✅ Conforme : unicite `workspaceId + code`.
- ✅ Conforme : relation vers Workspace avec suppression cascade.

### DTO

- ✅ Conforme : DTO create/update dedies.
- ✅ Conforme : validation des types et statuts autorises.

### Controller

- ✅ Conforme : controller protege par JWT.
- ✅ Conforme : routes imbriquees sous `workspaces/:workspaceId/customers`.
- ⚠️ A ameliorer : controle d'appartenance/permission workspace non encore visible dans le service.
- ⚠️ A ameliorer : liste non paginee.

### Service

- ✅ Conforme : normalisation du code et NotFound.
- ✅ Conforme : logique limitee aux fondations du tiers.
- ⚠️ A ameliorer : pas encore de verification d'existence/accessibilite du Workspace via contrat public.

### Repository

- ✅ Conforme : repository dedie.
- ✅ Conforme : operations create/update/archive/find/list centralisees.

### Tests

- ✅ Conforme : tests service et repository presents.
- ⚠️ A ameliorer : pas de tests controller, guard, validation HTTP ou integration Prisma reelle.

### ADR 011 a 016

- ✅ Conforme : module simple, DTO dedies, repository dedie.
- ⚠️ A ameliorer : controle multi-tenant effectif a renforcer.

## Priorites de correction recommandees

## P0 - Restaurer le build

1. Corriger les options Swagger JSON object dans `workspace-services.controller.ts`.
2. Relancer `pnpm --filter api build`.

## P1 - Securiser les surfaces API

1. Appliquer le prefixe global `/api/v1`.
2. Definir une strategie claire pour les endpoints publics vs proteges.
3. Ajouter `JwtAuthGuard` ou guards dedies aux modules sensibles.
4. Ajouter un controle systematique d'appartenance au Workspace pour les ressources tenant-aware.

## P1 - Stabiliser les frontieres inter-modules

1. Remplacer progressivement les lectures Prisma inter-modules par des services publics ou contrats applicatifs.
2. Documenter les contrats publics minimaux entre Offers, Pricing, Subscriptions, Provisioning, Workspace Services et Features.
3. Clarifier ce qui reste acceptable temporairement dans le monolithe modulaire.

## P2 - Renforcer Prisma

1. Standardiser les statuts et types sous enums ou constantes partagees controlees.
2. Ajouter les contraintes manquantes lorsque PostgreSQL peut les garantir.
3. Verifier les migrations avec une base de test.
4. Aligner schema Prisma et migrations SQL pour les index partiels non representables directement.

## P2 - Renforcer les tests

1. Ajouter tests d'integration du vertical slice Workspace Onboarding.
2. Ajouter tests controller pour guards, validation et erreurs.
3. Ajouter tests de transitions metier Subscriptions et Provisioning.
4. Ajouter tests de non-regression sur les contraintes multi-tenant.

## Conclusion

Le Core SaaS PGYS est bien avance pour une fondation modulaire : les modules principaux existent, les repositories sont dedies, les DTO sont presents et les tests unitaires passent.

Le principal blocage immediat est le build TypeScript casse par Swagger.

Les principaux risques structurants sont :

- securite API encore non uniforme ;
- frontieres inter-modules encore trop directes via Prisma ;
- absence de prefixe `/api/v1` ;
- manque de tests d'integration sur le parcours Core SaaS complet ;
- statuts et contraintes metier encore trop disperses.

Avant Billing, ERP avance, CRM ou Marketing, il est recommande de traiter d'abord les corrections P0 et P1.
