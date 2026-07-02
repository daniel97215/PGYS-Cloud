ADR-016 - Module Template

## Statut

Accepte.

## Contexte

ADR-011 definit PGYS comme un monolithe modulaire API-first avec des frontieres strictes entre modules.

ADR-012 limite le Shared Kernel aux primitives techniques communes et interdit d'y placer de la logique metier.

ADR-013 definit la strategie de persistance : repositories par module, Prisma limite a l'infrastructure et pas de logique metier dans les repositories.

ADR-014 definit les conventions API : controllers minces, DTO dedies et contrats REST explicites.

ADR-015 definit les Domain Events comme contrats publics de faits metier passes.

PGYS a besoin d'un modele officiel de module afin que chaque futur module reste homogene, testable, maintenable et extractible si necessaire.

## Decision

Tout module PGYS doit respecter une structure en couches.

Les couches separent le domaine, les cas d'usage, les details techniques, la presentation et les tests.

Le Domain reste independant de toutes les autres couches.

## Structure minimale

Chaque module doit respecter l'organisation suivante :

```text
module/
|
+-- domain/
|   +-- entities/
|   +-- value-objects/
|   +-- services/
|   +-- events/
|   +-- repositories/
|
+-- application/
|   +-- commands/
|   +-- queries/
|   +-- dto/
|   +-- services/
|   +-- handlers/
|
+-- infrastructure/
|   +-- prisma/
|   +-- repositories/
|   +-- mappers/
|   +-- providers/
|
+-- presentation/
|   +-- controllers/
|   +-- requests/
|   +-- responses/
|
+-- tests/
|   +-- unit/
|   +-- integration/
|   +-- e2e/
|
+-- module.ts
```

Cette structure peut etre adaptee uniquement lorsqu'un dossier n'a pas encore de contenu utile. Elle reste la reference officielle pour les nouveaux modules.

## Responsabilites des couches

### Domain

La couche Domain contient le modele metier du module.

Elle contient :

- entities ;
- value objects ;
- services de domaine ;
- Domain Events ;
- interfaces de repositories.

Le Domain exprime les regles metier du module.

Il ne depend d'aucune autre couche.

Il ne depend pas de Prisma, NestJS, HTTP, OpenAPI, controllers ou providers externes.

### Application

La couche Application orchestre les cas d'usage du module.

Elle contient :

- commands ;
- queries ;
- DTO applicatifs ;
- services applicatifs ;
- handlers.

Elle utilise le Domain pour appliquer les regles metier.

Elle depend des interfaces du Domain, pas des implementations techniques.

Elle publie les Domain Events lorsque le cas d'usage produit un fait metier important.

### Infrastructure

La couche Infrastructure contient les details techniques.

Elle contient :

- schemas ou clients Prisma propres au module ;
- implementations des repositories ;
- mappers entre persistance et domaine ;
- providers techniques ;
- integrations externes propres au module.

Prisma est limite a cette couche.

Les repositories sont implementes dans Infrastructure et exposent les interfaces definies par le Domain.

Infrastructure ne doit pas porter de logique metier.

### Presentation

La couche Presentation expose les contrats d'entree et de sortie.

Elle contient :

- controllers ;
- requests ;
- responses.

Les controllers restent minces.

Ils valident, deleguent a Application et retournent des responses conformes aux contrats API.

Ils ne contiennent pas de logique metier.

Ils n'accedent jamais directement a Prisma ou aux repositories.

### Tests

La couche Tests valide le comportement du module.

Elle contient :

- tests unitaires ;
- tests d'integration ;
- tests e2e lorsque le module expose une API ou une orchestration complete.

Les tests unitaires couvrent le Domain et les services applicatifs.

Les tests d'integration couvrent les repositories, mappers et integrations techniques.

Les tests e2e couvrent les contrats exposes par Presentation.

## Dependances autorisees

Les dependances internes suivent ce sens :

```text
Presentation
        ↓
Application
        ↓
Domain
        ↑
Infrastructure
```

Presentation depend d'Application.

Application depend de Domain.

Infrastructure depend de Domain pour implementer ses interfaces.

Domain ne depend d'aucune autre couche.

Infrastructure ne doit pas etre appelee directement par Presentation.

Presentation ne doit pas contourner Application.

## Principes

Un module a une seule responsabilite fonctionnelle.

La logique metier vit dans Domain ou dans Application selon sa nature.

Les controllers ne contiennent pas de logique metier.

Prisma n'est accessible que depuis Infrastructure.

Les DTO appartiennent a Application lorsqu'ils representent des cas d'usage.

Les requests et responses appartiennent a Presentation lorsqu'elles representent les contrats HTTP.

Les interfaces de repositories appartiennent a Domain.

Les implementations de repositories appartiennent a Infrastructure.

Les evenements metier appartiennent a Domain.

Les handlers applicatifs appartiennent a Application.

Les mappers protegent le Domain des details de persistance.

## Creation d'un nouveau module

La creation d'un nouveau module suit les etapes suivantes :

1. Classer le module selon la Platform Map : Platform, Business Module, Application ou Extension.
2. Creer la structure de dossiers officielle.
3. Creer le module NestJS dans `module.ts`.
4. Implementer le domaine : entities, value objects, services de domaine, events et interfaces de repositories.
5. Implementer l'application : commands, queries, DTO, services et handlers.
6. Implementer les repositories dans Infrastructure.
7. Ajouter les mappers et providers necessaires.
8. Exposer l'API dans Presentation en respectant ADR-014.
9. Publier les Domain Events requis en respectant ADR-015.
10. Ecrire les tests unitaires, integration et e2e adaptes au module.

Tout ecart durable par rapport a ce template doit etre justifie dans le ticket ou par un ADR.

## Principes interdits

Les pratiques suivantes sont interdites :

- melange des responsabilites entre couches ;
- acces direct entre modules ;
- logique metier dans Infrastructure ;
- logique metier dans Presentation ;
- repositories partages entre modules ;
- acces Prisma hors Infrastructure ;
- controller appelant directement un repository ;
- module important des details internes d'un autre module ;
- Domain dependant de NestJS, Prisma, HTTP ou d'une Extension ;
- DTO ou modele de persistance expose comme contrat public sans mapping.

## Consequences

Les modules PGYS partagent un modele unique.

Les frontieres entre couches deviennent explicites.

Les tests sont plus simples a organiser.

Les modules restent maintenables dans le monolithe modulaire.

Une extraction future vers microservice reste possible si un module respecte ses contrats, ses interfaces et ses frontieres internes.
