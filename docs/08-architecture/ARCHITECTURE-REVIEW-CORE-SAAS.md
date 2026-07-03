# Architecture Review Core SaaS PGYS

## 1. Objectif de la revue

Cette revue sert a stabiliser le Core SaaS PGYS avant d'ajouter Billing, ERP, CRM ou Marketing.

Le socle actuel pose les briques minimales permettant de representer :

- un Workspace ;
- les services activables dans ce Workspace ;
- le catalogue officiel des services ;
- les fonctionnalites disponibles ;
- les offres commerciales ;
- les prix applicables aux offres ;
- les souscriptions d'un Workspace ;
- l'orchestration de provisioning.

Avant d'ajouter des modules plus lourds, il faut verifier que ces briques restent simples, coherentes et correctement separees. L'objectif n'est pas de refactorer immediatement, mais d'identifier les points a durcir pour eviter de construire Billing ou les modules metier sur des fondations instables.

Cette revue doit etre utilisee comme support de decision pour les prochains tickets Codex de hardening.

## 2. Cartographie actuelle

Le flux fonctionnel cible du Core SaaS est le suivant :

```text
Workspace
  -> Workspace Services
  -> Service Catalog
  -> Features
  -> Offers
  -> Offer Features
  -> Pricing
  -> Subscriptions
  -> Provisioning
```

### Workspace

Le Workspace represente l'organisation cliente et le point d'ancrage multi-tenant.

Points a verifier :

- chaque donnee tenant-aware doit etre rattachee explicitement a un Workspace ;
- les modules aval ne doivent pas contourner le Workspace pour creer des ressources isolees ;
- les endpoints doivent garder une separation claire entre profil, settings, services et membres.

### Workspace Services

Workspace Services represente les services actives, desactives ou configures pour un Workspace.

Points a verifier :

- un service doit rester unique par `workspaceId` et `serviceKey` ;
- la configuration JSON doit rester generique ;
- aucune logique d'abonnement, de facturation ou de provisioning fournisseur ne doit etre embarquee ici.

### Service Catalog

Service Catalog definit la liste officielle des services disponibles dans PGYS.

Points a verifier :

- les services du catalogue doivent rester globaux, pas rattaches directement a un Workspace ;
- le module doit rester utilisable par Workspace Services, Offers, Pricing, Billing et Provisioning ;
- les statuts et la visibilite doivent etre explicites et documentes.

### Features

Features definit les capacites fonctionnelles activables de la plateforme.

Points a verifier :

- une Feature doit rester independante des offres et des tarifs ;
- les cles doivent suivre une convention stable, par exemple `crm.contacts` ou `erp.stock` ;
- les Features ne doivent pas contenir de logique d'autorisation ou de feature flag runtime.

### Offers

Offers represente les offres commerciales vendables.

Points a verifier :

- une Offer doit rester un produit commercial, pas un prix ;
- la relation aux services du catalogue doit rester extensible ;
- les statuts doivent etre coherents avec les futurs parcours de publication.

### Offer Features

Offer Features associe les fonctionnalites accordees par une offre.

Points a verifier :

- la relation N-N doit rester lisible et unique par couple `offerId` / `featureId` ;
- la desactivation d'une feature dans une offre doit etre explicite ;
- aucune logique d'autorisation effective ne doit etre implementee dans ce module.

### Pricing

Pricing definit les prix applicables aux Offers.

Points a verifier :

- un prix appartient a une Offer, pas a un service ;
- Pricing ne doit pas creer de facture, de paiement ou de souscription ;
- les periodes de validite doivent etre exploitables par les futurs modules Billing et Checkout.

### Subscriptions

Subscriptions represente l'engagement d'un Workspace envers une Offer.

Points a verifier :

- une souscription doit etre rattachee a un Workspace et a une Offer ;
- `priceId` doit rester une reference optionnelle au prix utilise ;
- le cycle de vie doit rester limite aux etats de souscription ;
- le module ne doit pas calculer le prix, provisionner un service ou creer une facture.

### Provisioning

Provisioning orchestre l'activation, la mise a jour et la desactivation des services d'un Workspace.

Points a verifier :

- le module doit coordonner les actions sans embarquer de logique metier specifique ;
- les jobs doivent etre idempotents ;
- l'orchestrateur doit rester separe du service principal ;
- les etapes futures doivent pouvoir etre ajoutees sans reecrire le coeur de l'orchestrateur.

## 3. Checklist d'audit

### Frontieres de modules

- [ ] Chaque module a une responsabilite clairement identifiable.
- [ ] Aucun module Platform ne depend directement d'un module Business sans contrat explicite.
- [ ] Aucun module Business n'importe les details internes d'un autre module Business.
- [ ] Les communications inter-modules passent par des services publics, contrats ou evenements.

### Dependances entre modules

- [ ] Workspace reste le point d'ancrage multi-tenant.
- [ ] Workspace Services ne depend pas de Billing ou Pricing.
- [ ] Service Catalog ne depend pas de Workspace Services.
- [ ] Features ne depend pas de Offers.
- [ ] Offers ne contient pas de logique Pricing.
- [ ] Pricing depend des Offers sans gerer les souscriptions.
- [ ] Subscriptions depend de Workspace, Offers et Pricing sans gerer Billing.
- [ ] Provisioning coordonne Subscriptions, Offers, Offer Features et Workspace Services sans logique fournisseur.

### Acces Prisma

- [ ] Aucun controller n'accede directement a Prisma.
- [ ] Aucun service applicatif n'utilise Prisma directement.
- [ ] Les acces Prisma sont limites aux repositories.
- [ ] Les repositories ne contiennent pas de logique metier.

### Controllers

- [ ] Les controllers restent minces.
- [ ] Les controllers valident l'entree via DTO.
- [ ] Les controllers deleguent au service.
- [ ] Les controllers ne contiennent pas de decisions metier.

### DTO

- [ ] Chaque payload entrant dispose d'un DTO dedie.
- [ ] Les DTO ne reutilisent pas directement les modeles Prisma.
- [ ] Les champs optionnels sont documentes.
- [ ] Les formats de cles, UUID, URL, devises et dates sont coherents entre modules.

### Endpoints REST

- [ ] Les routes sont groupees par module.
- [ ] Les verbes HTTP respectent leur sens standard.
- [ ] Les actions de cycle de vie sont nommees de facon explicite.
- [ ] Les endpoints ne contournent pas les services publics des modules.

### Tests unitaires

- [ ] Chaque service a des tests unitaires.
- [ ] Chaque repository a des tests unitaires couvrant les appels Prisma.
- [ ] Les transitions de statut importantes sont testees.
- [ ] Les erreurs `NotFound`, `BadRequest` et `Conflict` sont testees.
- [ ] Les cas d'idempotence sont couverts lorsque le module le requiert.

### Migrations Prisma

- [ ] Chaque modele ajoute dispose d'une migration.
- [ ] Les index correspondent aux recherches principales.
- [ ] Les contraintes d'unicite correspondent aux invariants metier.
- [ ] Les migrations ne modifient pas des tables hors ticket sans justification.

### Relations Prisma

- [ ] Les relations Workspace sont explicites pour les donnees tenant-aware.
- [ ] Les relations Offer, Feature, Price et Subscription sont coherentes.
- [ ] Les suppressions en cascade sont limitees aux cas attendus.
- [ ] Les relations optionnelles sont justifiees.

### Perimetre Git

- [ ] `git status --short` ne montre que les fichiers du ticket audite.
- [ ] Aucun fichier applicatif n'est modifie lors d'un ticket documentaire.
- [ ] Aucun ADR existant n'est modifie sans demande explicite.
- [ ] Aucun fichier Prisma n'est modifie dans un ticket de documentation.

## 4. Risques a analyser

### Couplage excessif

Risque : un module commence a importer les repositories ou details internes d'un autre module.

Impact : les modules deviennent difficiles a tester, a extraire et a faire evoluer.

Verification : rechercher les imports directs entre modules et confirmer qu'ils passent par des services publics ou contrats explicites.

### Duplication de logique

Risque : plusieurs modules normalisent les cles, statuts ou dates avec des regles legerement differentes.

Impact : incoherences API, bugs de transition, comportements divergents entre endpoints.

Verification : comparer les fonctions de normalisation, DTO et constantes de statuts.

### Incoherence des statuts

Risque : les statuts restent de simples chaines non harmonisees entre modules.

Impact : transitions impossibles a auditer, erreurs de filtrage, duplication dans les tests.

Verification : lister tous les statuts de `WorkspaceService`, `Feature`, `Offer`, `Price`, `Subscription` et `ProvisioningJob`.

### Absence de constantes metier

Risque : les statuts, operations et types d'evenements sont ecrits en dur.

Impact : fautes de frappe, ruptures silencieuses, tests moins fiables.

Verification : confirmer que les statuts et operations stables sont centralises dans chaque module.

### Endpoints trop CRUD

Risque : certains endpoints exposent seulement les tables au lieu de representer les cas d'usage.

Impact : l'API devient instable lorsque le modele interne evolue.

Verification : identifier les endpoints qui devraient exprimer une action de cycle de vie plutot qu'une mise a jour generique.

### Manque d'idempotence

Risque : une operation relancee cree des doublons ou casse l'etat existant.

Impact : provisioning, activation de services et transitions de souscription deviennent fragiles.

Verification : tester les appels repetes sur Workspace Services, Subscriptions et Provisioning.

### Erreurs non standardisees

Risque : les modules retournent des messages d'erreurs heterogenes.

Impact : les clients API et les futurs modules applicatifs gerent mal les erreurs.

Verification : comparer les usages de `BadRequestException`, `NotFoundException`, `ConflictException` et le format d'erreur public.

## 5. Actions de hardening proposees

Ces actions sont proposees pour des tickets futurs. Elles ne doivent pas etre implementees dans cette revue documentaire.

### Standardiser les statuts

- Creer une convention de nommage commune pour les statuts.
- Documenter les etats autorises par module.
- Ajouter des tests de non-regression sur les transitions.
- Decider quand utiliser enum Prisma, constantes TypeScript ou table de reference.

### Harmoniser les DTO

- Aligner les conventions de validation UUID, key, currency, dates et JSON.
- Harmoniser les exemples Swagger.
- Verifier que les DTO ne refletent pas directement les modeles Prisma.
- Ajouter des tests unitaires pour les DTO sensibles.

### Creer des constantes partagees avec prudence

- Garder les constantes metier dans leur module proprietaire par defaut.
- Ne deplacer dans un Shared Kernel que ce qui est consomme par au moins deux modules.
- Eviter un fichier global qui deviendrait un fourre-tout.

### Ajouter des tests de transitions metier

- Tester les transitions Subscription : `pending`, `active`, `suspended`, `cancelled`, `expired`.
- Tester les operations Provisioning : `provision`, `reprovision`, `deprovision`.
- Tester les reactivations et annulations repetes.
- Tester les conflits d'unicite fonctionnelle.

### Preparer les evenements de domaine

- Identifier les faits passes a publier, par exemple `SubscriptionActivated`, `SubscriptionCancelled`, `ProvisioningCompleted`.
- Definir un contrat minimal contenant `eventId`, `eventType`, `occurredAt`, `workspaceId`, `aggregateId`, `payload`, `version`.
- Eviter d'utiliser les evenements comme commandes.
- Prevoir le rejeu et l'idempotence des consommateurs.

### Documenter les workflows de bout en bout

- Ecrire un workflow "creation Workspace -> souscription -> provisioning".
- Ecrire un workflow "changement d'offre -> mise a jour features -> reprovisioning".
- Ecrire un workflow "resiliation -> deprovisioning".
- Identifier clairement les modules responsables a chaque etape.

### Clarifier les responsabilites avant Billing

- Verifier que Pricing ne calcule pas de facture.
- Verifier que Subscriptions ne declenche pas de paiement.
- Verifier que Provisioning ne connait pas les regles de facturation.
- Definir les contrats que Billing consommera plus tard.

## 6. Criteres de sortie

Le Core SaaS PGYS peut etre considere stable lorsque les criteres suivants sont remplis :

- les modules audites ont des responsabilites distinctes et documentees ;
- les dependances suivent la Platform Map et ADR-011 ;
- aucun controller ne contient de logique metier lourde ;
- aucun acces Prisma n'existe hors repository ;
- les DTO sont coherents et valident les formats attendus ;
- les statuts et operations sont centralises par module ;
- les migrations Prisma sont coherentes avec les invariants metier ;
- les relations Prisma Workspace, Offer, Feature, Price, Subscription et ProvisioningJob sont explicites ;
- les tests unitaires couvrent repositories, services et transitions critiques ;
- les operations idempotentes sont testees ;
- les erreurs les plus frequentes sont standardisees ;
- `git status --short` reste limite au perimetre du ticket en cours ;
- aucun module Billing, ERP, CRM ou Marketing ne depend d'un comportement implicite du Core SaaS.

Quand ces criteres sont satisfaits, PGYS peut ajouter Billing et les modules metier sur une base plus stable, avec moins de risque de devoir corriger les fondations pendant les developpements aval.
