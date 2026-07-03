# Vertical Slice - Workspace Onboarding

## Objectif

Ce document decrit le premier parcours fonctionnel complet de PGYS : creer un Workspace, choisir une Offer, creer une Subscription, lancer le Provisioning, activer les Workspace Services et rendre les Features disponibles.

Il sert de reference operationnelle pour stabiliser le Core SaaS avant d'ajouter Billing, ERP, CRM ou Marketing.

Ce document ne definit pas de nouvelle logique applicative. Il formalise le flux attendu entre les modules existants.

## Flux complet

```text
Utilisateur / API
      |
      v
Workspace
      |
      v
Offer selection
      |
      v
Subscription
      |
      v
Provisioning
      |
      v
Workspace Services
      |
      v
Features
      |
      v
Workspace pret a l'utilisation
```

Vue module par module :

```text
Workspace Module
  -> Offers Module
  -> Pricing Module
  -> Subscriptions Module
  -> Provisioning Module
  -> Workspace Services Module
  -> Offer Features / Features
```

## 1. Creation du Workspace

### Module responsable

`workspace`

### Donnees creees ou modifiees

- creation d'un `Workspace` ;
- creation des settings par defaut du Workspace si le module settings est actif ;
- creation eventuelle du lien owner/membre selon le parcours d'inscription ;
- statut initial attendu : `ACTIVE` ou statut equivalent defini par le module Workspace.

### Evenements de domaine emis

Evenement cible :

- `WorkspaceCreated`

Payload minimal attendu :

- `workspaceId` ;
- identifiant de l'utilisateur createur si disponible ;
- date de creation ;
- version de l'evenement.

L'evenement doit representer un fait passe, pas une commande.

### Points de controle

- le slug du Workspace est unique ;
- le Workspace est cree avec un identifiant stable ;
- les champs obligatoires sont presents ;
- les settings par defaut sont coherents ;
- le createur dispose bien d'un role permettant de poursuivre l'onboarding.

### Erreurs possibles

- donnees invalides ;
- slug deja utilise ;
- utilisateur createur introuvable ;
- echec de creation des settings ;
- echec transactionnel pendant la creation Workspace + owner.

## 2. Selection d'une Offer

### Module responsable

`offers`

### Donnees creees ou modifiees

Aucune donnee n'est necessairement creee a cette etape.

Le parcours selectionne une `Offer` existante par sa cle ou son identifiant.

### Evenements de domaine emis

Aucun evenement obligatoire.

Evenement optionnel futur :

- `OfferSelected`

Cet evenement ne doit etre ajoute que si un module aval en a besoin, par exemple Analytics ou Audit.

### Points de controle

- l'Offer existe ;
- l'Offer est dans un statut selectionnable ;
- l'Offer est visible pour le canal d'acquisition concerne ;
- l'Offer dispose des relations necessaires vers ses services et features.

### Erreurs possibles

- Offer introuvable ;
- Offer archivee ou non publiable ;
- Offer invisible pour le contexte courant ;
- Offer incomplete pour l'onboarding.

## 3. Creation de la Subscription

### Module responsable

`subscriptions`

### Donnees creees ou modifiees

- creation d'une `Subscription` ;
- association a un `workspaceId` ;
- association a un `offerId` ;
- reference optionnelle au `priceId` utilise ;
- initialisation du statut, par exemple `pending` ou `active` selon le parcours cible ;
- renseignement de `startedAt`, `renewalDate`, `endsAt` si applicable.

Le module Subscription ne calcule pas le prix. Il reference uniquement le prix choisi lorsque celui-ci est connu.

### Evenements de domaine emis

Evenements cibles :

- `SubscriptionCreated`
- `SubscriptionActivated` si le statut initial est actif

Payload minimal attendu :

- `workspaceId` ;
- `subscriptionId` ;
- `offerId` ;
- `priceId` si disponible ;
- `status` ;
- `startedAt` ;
- version de l'evenement.

### Points de controle

- le Workspace existe ;
- l'Offer existe ;
- le Price existe si `priceId` est fourni ;
- il n'existe pas deja une Subscription active pour le meme Workspace et la meme Offer ;
- le statut fourni fait partie des statuts autorises ;
- les dates sont coherentes.

### Erreurs possibles

- Workspace introuvable ;
- Offer introuvable ;
- Price introuvable ;
- Subscription active deja existante ;
- statut invalide ;
- dates invalides ou incoherentes.

## 4. Declenchement du Provisioning

### Module responsable

`provisioning`

### Donnees creees ou modifiees

- creation d'un `ProvisioningJob` ;
- association au `workspaceId` ;
- association au `subscriptionId` ;
- operation attendue : `provision` ;
- statut initial : `pending`, puis `running`, puis `completed` ou `failed` ;
- renseignement de `startedAt`, `completedAt`, `error` si necessaire.

### Evenements de domaine emis

Evenements cibles :

- `ProvisioningStarted`
- `ProvisioningCompleted`
- `ProvisioningFailed`

Payload minimal attendu :

- `workspaceId` ;
- `subscriptionId` ;
- `provisioningJobId` ;
- `operation` ;
- `status` ;
- erreur si applicable ;
- version de l'evenement.

### Points de controle

- la Subscription existe ;
- la Subscription appartient au Workspace demande ;
- l'Offer associee a la Subscription existe ;
- les Offer Features peuvent etre recuperees ;
- les Workspace Services existants peuvent etre lus ;
- l'operation est idempotente : relancer le meme provisioning ne doit pas creer de doublons incoherents.

### Erreurs possibles

- Subscription introuvable ;
- Subscription rattachee a un autre Workspace ;
- Offer introuvable ;
- Offer Features indisponibles ;
- Workspace Services indisponibles ;
- job deja en erreur non rejoue explicitement ;
- echec d'une etape de l'orchestrateur.

## 5. Activation des Workspace Services

### Module responsable

`workspace-services`

### Donnees creees ou modifiees

- creation ou mise a jour d'un `WorkspaceService` par service activable ;
- association au `workspaceId` ;
- utilisation d'une cle de service stable ;
- statut actif ;
- configuration JSON initiale si disponible ;
- renseignement de `activatedAt` ;
- remise a `null` de `deactivatedAt` si le service etait desactive.

### Evenements de domaine emis

Evenements cibles :

- `WorkspaceServiceActivated`
- `WorkspaceServiceUpdated` si un service existant est modifie

Payload minimal attendu :

- `workspaceId` ;
- `serviceKey` ;
- `workspaceServiceId` ;
- `subscriptionId` si le lien est utile ;
- version de l'evenement.

### Points de controle

- un Workspace Service est unique par `workspaceId` et `serviceKey` ;
- l'activation est idempotente ;
- la configuration est un objet JSON valide ;
- un service deja actif peut etre conserve sans duplication ;
- aucune logique fournisseur n'est executee directement dans ce module.

### Erreurs possibles

- serviceKey vide ou invalide ;
- configuration JSON invalide ;
- conflit d'unicite ;
- echec de mise a jour d'un service existant.

## 6. Activation des Features

### Modules responsables

- `features`
- `offer-features`
- futur module d'autorisation ou feature flags lorsque celui-ci existera

### Donnees creees ou modifiees

Dans le Core actuel, l'activation des Features est principalement derivee :

- des Features existantes ;
- des Offer Features associees a l'Offer ;
- de la Subscription active ;
- des Workspace Services actives.

Aucune table d'autorisation runtime ne doit etre creee implicitement par ce parcours tant qu'un module dedie n'existe pas.

### Evenements de domaine emis

Evenement cible futur :

- `WorkspaceFeaturesActivated`

Payload minimal attendu :

- `workspaceId` ;
- `subscriptionId` ;
- liste des feature keys activees ;
- version de l'evenement.

### Points de controle

- les Features existent ;
- les Offer Features sont actives ;
- les Features sont compatibles avec les services provisionnes ;
- l'activation reste derivable et auditable ;
- aucune regle d'autorisation finale n'est dupliquee dans Offers ou Provisioning.

### Erreurs possibles

- Feature introuvable ;
- Offer Feature desactivee ;
- incoherence entre Offer Services et Offer Features ;
- activation partielle non tracee.

## 7. Workspace pret a l'utilisation

### Module responsable

Responsabilite transverse coordonnee par :

- `workspace`
- `subscriptions`
- `provisioning`
- `workspace-services`

### Donnees creees ou modifiees

- Workspace actif ;
- Subscription active ;
- ProvisioningJob termine ;
- Workspace Services actifs ;
- Features derivables depuis l'Offer active ;
- eventuel indicateur futur d'onboarding termine.

### Evenements de domaine emis

Evenement cible :

- `WorkspaceOnboardingCompleted`

Payload minimal attendu :

- `workspaceId` ;
- `subscriptionId` ;
- `offerId` ;
- `provisioningJobId` ;
- liste des services actives ;
- liste des features disponibles ;
- version de l'evenement.

### Points de controle

- le Workspace peut etre charge par l'API ;
- une Subscription active existe ;
- le dernier ProvisioningJob est `completed` ;
- les Workspace Services attendus sont actifs ;
- les Features attendues sont disponibles ;
- aucune erreur critique n'est presente dans le provisioning.

### Erreurs possibles

- provisioning incomplet ;
- services manquants ;
- subscription non active ;
- incoherence entre services et features ;
- evenement final non publie ou non rejouable.

## Diagramme textuel detaille

```text
1. POST /workspaces
   Workspace Module
   - cree Workspace
   - cree settings par defaut
   - emet WorkspaceCreated

2. GET /offers ou GET /offers/:key
   Offers Module
   - selectionne Offer
   - verifie statut et visibilite

3. GET /pricing/offers/:offerKey/prices/active
   Pricing Module
   - recupere Price actif
   - ne calcule aucune facture

4. POST /subscriptions
   Subscriptions Module
   - cree Subscription
   - reference Workspace, Offer, Price
   - verifie unicite active
   - emet SubscriptionCreated / SubscriptionActivated

5. POST /provisioning/workspaces/:workspaceId/provision
   Provisioning Module
   - cree ProvisioningJob
   - charge Subscription
   - charge Offer
   - charge Offer Features
   - charge Workspace Services existants
   - coordonne les etapes
   - emet ProvisioningStarted / ProvisioningCompleted

6. Workspace Services Module
   - active ou met a jour les services du Workspace
   - garantit l'idempotence par workspaceId + serviceKey
   - emet WorkspaceServiceActivated

7. Features / Offer Features
   - expose les features accordees par l'Offer
   - permet de deriver les capacites actives du Workspace

8. Workspace pret
   - Subscription active
   - ProvisioningJob completed
   - Workspace Services actifs
   - Features disponibles
   - emet WorkspaceOnboardingCompleted
```

## Tests d'integration necessaires

### Parcours nominal

- Creer un Workspace.
- Creer ou recuperer une Offer disponible.
- Associer des Offer Features a cette Offer.
- Creer un Price actif pour cette Offer.
- Creer une Subscription active pour le Workspace.
- Declencher le Provisioning.
- Verifier que le ProvisioningJob passe a `completed`.
- Verifier que les Workspace Services attendus sont actifs.
- Verifier que les Features attendues sont derivables depuis l'Offer.

### Idempotence

- Relancer le provisioning avec le meme `workspaceId` et `subscriptionId`.
- Verifier qu'aucun doublon incoherent de Workspace Service n'est cree.
- Verifier que le job est reutilise ou que le nouveau job reste coherent selon la strategie retenue.

### Erreurs Workspace

- Tenter l'onboarding avec un Workspace inexistant.
- Verifier une erreur `NotFound` standardisee.

### Erreurs Offer

- Tenter de creer une Subscription avec une Offer inexistante.
- Tenter de selectionner une Offer archivee ou non visible.
- Verifier que le provisioning ne demarre pas.

### Erreurs Pricing

- Tenter de creer une Subscription avec un Price inexistant.
- Tenter de recuperer un Price actif absent.
- Verifier qu'aucune Subscription incoherente n'est creee.

### Erreurs Subscription

- Creer deux Subscriptions actives pour le meme Workspace et la meme Offer.
- Verifier une erreur de conflit.
- Verifier que l'etat existant n'est pas modifie.

### Erreurs Provisioning

- Declencher le provisioning avec une Subscription inexistante.
- Declencher le provisioning avec une Subscription rattachee a un autre Workspace.
- Simuler une erreur dans une etape de l'orchestrateur.
- Verifier que le ProvisioningJob passe a `failed` avec une erreur exploitable.

### Erreurs Workspace Services

- Simuler une configuration JSON invalide.
- Verifier que le service n'est pas active partiellement.
- Verifier que l'erreur est remontee au ProvisioningJob.

### Evenements de domaine

- Verifier que chaque evenement cible contient `eventId`, `eventType`, `occurredAt`, `workspaceId`, `aggregateId`, `payload`, `version`.
- Verifier que les evenements sont des faits passes.
- Verifier que les consommateurs peuvent traiter deux fois le meme evenement sans effet secondaire.

## Criteres de validation du vertical slice

Le parcours Workspace Onboarding est considere valide lorsque :

- le Workspace est cree et actif ;
- une Offer selectionnable est associee au parcours ;
- une Subscription active existe pour le Workspace et l'Offer ;
- le ProvisioningJob se termine en `completed` ;
- les Workspace Services attendus sont actifs ;
- les Features de l'Offer sont disponibles pour le Workspace ;
- les erreurs principales sont testees ;
- les operations rejouees restent idempotentes ;
- aucun module Billing, paiement, email ou IA n'est requis pour terminer le parcours.
