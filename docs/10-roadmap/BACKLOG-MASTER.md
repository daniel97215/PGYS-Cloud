# PGYS - Backlog Master

## 1. Presentation

Le Backlog Master est la source unique de planification du developpement PGYS.

Il centralise les versions produit, les EPIC, les tickets, les dependances, les priorites et l'etat d'avancement. Il ne remplace pas les tickets detailles, les ADR, la roadmap strategique ou les specifications fonctionnelles.

Son role est de repondre rapidement aux questions suivantes :

- quelle version est en cours ;
- quels EPIC structurent le produit ;
- quels tickets sont termines, en cours ou planifies ;
- quelles dependances bloquent un chantier ;
- ou ajouter les prochains tickets sans casser l'organisation.

Regle de lecture : ce document organise le travail, mais ne decrit pas le contenu detaille des tickets.

## 2. Versions

| Version | Objectif | Criteres de sortie | Etat |
| --- | --- | --- | --- |
| v0.1 Core Platform | Stabiliser le socle technique, architectural et workspace-first de PGYS. | Architecture documentee, API de base, Prisma, Workspace, Service Catalog, Workspace Services, Provisioning et vertical slice Workspace Onboarding documentes. | In Progress |
| v0.2 Commercial Core | Poser les fondations commerciales sans facturation complete. | Offers, Features, Offer Features, Pricing et Subscriptions coherents, testes et raccordes au parcours d'onboarding. | In Progress |
| v0.3 ERP Foundation | Demarrer les premiers modules ERP generiques. | Catalog, customers, products, inventory, sales et purchases definis avec un premier parcours exploitable. | Planned |
| v0.4 CRM Foundation | Construire les fondations CRM reutilisables. | Contacts, pipeline, activites, historique client et premiers workflows CRM disponibles. | Planned |
| v0.5 Marketing Foundation | Ajouter les capacites marketing de base. | Segments, campagnes, templates et suivi minimal des actions marketing disponibles. | Planned |
| v0.6 AI Platform | Structurer les capacites IA transverses. | Contrats IA, fournisseurs, usages controles, logs et garde-fous definis. | Planned |
| v0.7 Marketplace & Integrations | Prepararer les extensions et integrations externes. | Connecteurs prioritaires, contrats d'extension et mecanismes d'activation documentes. | Planned |
| v1.0 First Commercial Release | Livrer une premiere version commercialisable. | Onboarding complet, offre vendable, modules prioritaires stables, support et exploitation prets. | Planned |

## 3. EPIC

| EPIC | Nom | Role | Version principale | Etat |
| --- | --- | --- | --- | --- |
| EPIC-01 | Core Platform | Socle technique, Workspace, architecture, persistence, provisioning et fondations API. | v0.1 Core Platform | In Progress |
| EPIC-02 | Commercial Core | Offers, Features, Pricing, Subscriptions et preparation Billing. | v0.2 Commercial Core | In Progress |
| EPIC-03 | ERP | Fondations ERP generiques. | v0.3 ERP Foundation | Planned |
| EPIC-04 | CRM | Fondations CRM SaaS. | v0.4 CRM Foundation | Planned |
| EPIC-05 | Marketing | Acquisition, campagnes et marketing automation. | v0.5 Marketing Foundation | Planned |
| EPIC-06 | AI | Capacites IA transverses et gouvernees. | v0.6 AI Platform | Planned |
| EPIC-07 | Integrations | Connecteurs, extensions et marketplace technique. | v0.7 Marketplace & Integrations | Planned |
| EPIC-08 | Reporting | Tableaux de bord, indicateurs et exports. | v1.0 First Commercial Release | Planned |
| EPIC-09 | Administration | Back-office, gouvernance operationnelle et outils internes. | v1.0 First Commercial Release | Planned |
| EPIC-10 | Mobile | Experiences mobiles et usages terrain. | v1.0 First Commercial Release | Planned |

## 4. Tickets

### EPIC-01 Core Platform

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-001 | Documentation fondatrice | Aucune | P1 | Completed |
| PGYS-009 | API MVP | PGYS-001 | P1 | Completed |
| PGYS-010 | PostgreSQL + Prisma | PGYS-009 | P1 | Completed |
| PGYS-012 | Modele Service | PGYS-010 | P2 | Completed |
| PGYS-014 | Sauvegarde serveur | PGYS-001 | P2 | Completed |
| PGYS-015 | Monitoring | PGYS-001 | P2 | Completed |
| PGYS-016 | Authentication Foundation | PGYS-009 | P1 | Completed |
| PGYS-017 | Workspace Management | PGYS-010, PGYS-016 | P1 | Completed |
| PGYS-018 | Architecture Foundations | PGYS-001 | P1 | Completed |
| PGYS-019 | Handbook Reorganization | PGYS-001 | P2 | Completed |
| PGYS-020 | Platform Map and ADR Foundations | PGYS-018, PGYS-019 | P1 | Completed |
| PGYS-021 | Workspace Services Foundation | PGYS-017, PGYS-020 | P1 | Completed |
| PGYS-022 | Service Catalog Foundation | PGYS-020 | P1 | Completed |
| PGYS-028 | Provisioning Engine Foundation | PGYS-021, PGYS-022, PGYS-025, PGYS-027 | P1 | Completed |
| PGYS-029 | Architecture Review and Hardening Plan | PGYS-021, PGYS-022, PGYS-024, PGYS-025, PGYS-026, PGYS-027, PGYS-028 | P1 | Completed |
| PGYS-030 | Vertical Slice Workspace Onboarding | PGYS-021, PGYS-022, PGYS-023, PGYS-025, PGYS-026, PGYS-027, PGYS-028 | P1 | Completed |
| PGYS-031 | Backlog Master Foundation | PGYS-029, PGYS-030 | P1 | Completed |
| PGYS-032 | Core Platform Hardening | PGYS-029, PGYS-030, PGYS-031 | P1 | Planned |
| PGYS-033 | Core Status Constants | PGYS-029 | P2 | Planned |
| PGYS-034 | Core Integration Test Suite | PGYS-030 | P1 | Planned |

### EPIC-02 Commercial Core

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-023 | Offers Foundation | PGYS-022 | P1 | Completed |
| PGYS-024 | Features Foundation | PGYS-022 | P1 | Completed |
| PGYS-025 | Offer Features | PGYS-023, PGYS-024 | P1 | Completed |
| PGYS-026 | Pricing Engine Foundation | PGYS-023 | P1 | Completed |
| PGYS-027 | Subscription Foundation | PGYS-017, PGYS-023, PGYS-026 | P1 | Completed |
| PGYS-035 | Billing Foundation | PGYS-026, PGYS-027, PGYS-030 | P1 | Planned |
| PGYS-036 | Checkout Foundation | PGYS-026, PGYS-027, PGYS-035 | P2 | Planned |
| PGYS-037 | Commercial Offer Lifecycle | PGYS-023, PGYS-025, PGYS-026 | P2 | Planned |
| PGYS-038 | Subscription Lifecycle Tests | PGYS-027, PGYS-035 | P1 | Planned |

### EPIC-03 ERP

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-039 | ERP Domain Map | PGYS-031 | P1 | Planned |
| PGYS-011 | Modele Customer | PGYS-010 | P2 | Completed |
| PGYS-040 | Catalog Foundation | PGYS-039 | P1 | Planned |
| PGYS-041 | Customers Foundation | PGYS-039 | P1 | Planned |
| PGYS-042 | Products Foundation | PGYS-040 | P1 | Planned |
| PGYS-043 | Inventory Foundation | PGYS-042 | P1 | Planned |
| PGYS-044 | Sales Foundation | PGYS-041, PGYS-042 | P1 | Planned |
| PGYS-045 | Purchases Foundation | PGYS-042, PGYS-043 | P2 | Planned |

### EPIC-04 CRM

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-046 | CRM Domain Map | PGYS-031 | P1 | Planned |
| PGYS-047 | Contacts Foundation | PGYS-046 | P1 | Planned |
| PGYS-048 | Accounts Foundation | PGYS-047 | P1 | Planned |
| PGYS-049 | Pipeline Foundation | PGYS-047 | P1 | Planned |
| PGYS-050 | CRM Activities Foundation | PGYS-047 | P2 | Planned |
| PGYS-051 | CRM Reporting Foundation | PGYS-049, PGYS-050 | P2 | Planned |

### EPIC-05 Marketing

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-003 | Site public | PGYS-001 | P1 | Completed |
| PGYS-004 | Page PGYS Cloud | PGYS-003 | P2 | Completed |
| PGYS-005 | Page applications metier | PGYS-003 | P2 | Completed |
| PGYS-006 | Page hebergement | PGYS-003 | P2 | Completed |
| PGYS-052 | Marketing Domain Map | PGYS-031 | P2 | Planned |
| PGYS-053 | Segments Foundation | PGYS-047, PGYS-052 | P2 | Planned |
| PGYS-054 | Campaigns Foundation | PGYS-053 | P2 | Planned |
| PGYS-055 | Marketing Automation Foundation | PGYS-054 | P3 | Planned |

### EPIC-06 AI

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-002 | Structure AI | PGYS-001 | P2 | Completed |
| PGYS-056 | AI Platform Map | PGYS-031 | P2 | Planned |
| PGYS-057 | AI Provider Contracts | PGYS-056 | P2 | Planned |
| PGYS-058 | AI Usage Audit | PGYS-056 | P2 | Planned |
| PGYS-059 | AI Assistant Foundation | PGYS-057, PGYS-058 | P3 | Planned |

### EPIC-07 Integrations

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-013 | Integration Nextcloud | PGYS-001 | P2 | Completed |
| PGYS-060 | Integrations Map | PGYS-031 | P2 | Planned |
| PGYS-061 | Email Provider Contract | PGYS-060 | P2 | Planned |
| PGYS-062 | SMS Provider Contract | PGYS-060 | P3 | Planned |
| PGYS-063 | Stripe Integration Preparation | PGYS-035, PGYS-060 | P2 | Planned |
| PGYS-064 | OVH Integration Preparation | PGYS-060 | P3 | Planned |

### EPIC-08 Reporting

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-065 | Reporting Domain Map | PGYS-031 | P2 | Planned |
| PGYS-066 | Operational Dashboards Foundation | PGYS-065 | P2 | Planned |
| PGYS-067 | Commercial Reporting Foundation | PGYS-035, PGYS-065 | P2 | Planned |
| PGYS-068 | ERP Reporting Foundation | PGYS-044, PGYS-065 | P3 | Planned |
| PGYS-069 | CRM Reporting Consolidation | PGYS-051, PGYS-065 | P3 | Planned |

### EPIC-09 Administration

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-007 | Design system | PGYS-003 | P1 | Completed |
| PGYS-008 | Admin MVP | PGYS-007 | P1 | Completed |
| PGYS-070 | Admin Portal Foundation | PGYS-021, PGYS-027, PGYS-031 | P2 | Planned |
| PGYS-071 | Workspace Administration Views | PGYS-070 | P2 | Planned |
| PGYS-072 | Subscription Administration Views | PGYS-070, PGYS-027 | P2 | Planned |
| PGYS-073 | Audit Administration Views | PGYS-070 | P3 | Planned |

### EPIC-10 Mobile

| ID | Titre | Dependances | Priorite | Etat |
| --- | --- | --- | --- | --- |
| PGYS-074 | Mobile Strategy | PGYS-031 | P3 | Planned |
| PGYS-075 | Mobile Workspace Access | PGYS-074 | P3 | Planned |
| PGYS-076 | Mobile CRM Companion | PGYS-047, PGYS-074 | P3 | Planned |
| PGYS-077 | Mobile POS Exploration | PGYS-044, PGYS-074 | P3 | Planned |

## 5. Dependances entre EPIC

Vue principale :

```text
Core Platform
        |
        v
Commercial Core
        |
        v
ERP
        |
        v
CRM
        |
        v
Marketing
```

Vue transverse :

```text
AI
  -> peut enrichir Core Platform, ERP, CRM, Marketing et Reporting

Integrations
  -> peut connecter Billing, Notifications, Providers, Accounting tools et Marketplace

Reporting
  -> consolide les donnees exposees par Core Platform, Commercial Core, ERP, CRM et Marketing

Administration
  -> expose des vues internes sur les modules stables

Mobile
  -> consomme les API publiques des modules, sans logique metier lourde
```

Principes de dependance :

- Core Platform doit etre suffisamment stable avant Billing, ERP, CRM ou Marketing.
- Commercial Core depend du Core Platform et prepare Billing, Subscription et Checkout.
- ERP peut demarrer lorsque Workspace, Offers, Pricing et Subscription sont suffisamment stabilises.
- CRM peut demarrer apres les premieres fondations commerciales et clients.
- Marketing depend des capacites CRM et des contrats d'integration.
- AI, Integrations et Reporting sont transverses et doivent rester branches par contrats explicites.

## 6. Regles de gestion

- Un ticket appartient a un seul EPIC.
- Un ticket a un identifiant unique.
- Les dependances doivent etre explicites.
- Un ticket termine ne change plus d'identifiant.
- Les nouveaux tickets sont ajoutes a la fin de leur EPIC.
- Un ticket ne doit pas changer de perimetre une fois commence ; un nouveau besoin cree un nouveau ticket.
- Les tickets documentaires, API, Prisma, UI et infrastructure doivent rester separes lorsque les perimetres sont distincts.
- Les etats autorises sont `Planned`, `In Progress`, `Blocked`, `Completed` et `Cancelled`.
- Les priorites autorisees sont `P1`, `P2` et `P3`.
- Les tickets termines peuvent etre references comme dependances, mais ne doivent pas etre reecrits dans ce document.

## 7. Indicateurs d'avancement

Ces indicateurs sont mis a jour manuellement.

### Synthese globale

| Indicateur | Valeur |
| --- | ---: |
| Nombre total de tickets repertories | 77 |
| Tickets termines | 31 |
| Tickets planifies | 46 |
| Tickets en cours | 0 |
| Tickets bloques | 0 |
| Progression globale | 40% |

### Progression par EPIC

| EPIC | Total | Completed | Planned | Progression |
| --- | ---: | ---: | ---: | ---: |
| EPIC-01 Core Platform | 20 | 17 | 3 | 85% |
| EPIC-02 Commercial Core | 9 | 5 | 4 | 56% |
| EPIC-03 ERP | 8 | 1 | 7 | 13% |
| EPIC-04 CRM | 6 | 0 | 6 | 0% |
| EPIC-05 Marketing | 8 | 4 | 4 | 50% |
| EPIC-06 AI | 5 | 1 | 4 | 20% |
| EPIC-07 Integrations | 6 | 1 | 5 | 17% |
| EPIC-08 Reporting | 5 | 0 | 5 | 0% |
| EPIC-09 Administration | 6 | 2 | 4 | 33% |
| EPIC-10 Mobile | 4 | 0 | 4 | 0% |

### Progression par version

| Version | Tickets principaux suivis | Completed | Etat |
| --- | ---: | ---: | --- |
| v0.1 Core Platform | 20 | 17 | In Progress |
| v0.2 Commercial Core | 9 | 5 | In Progress |
| v0.3 ERP Foundation | 8 | 1 | Planned |
| v0.4 CRM Foundation | 6 | 0 | Planned |
| v0.5 Marketing Foundation | 8 | 4 | Planned |
| v0.6 AI Platform | 5 | 1 | Planned |
| v0.7 Marketplace & Integrations | 6 | 1 | Planned |
| v1.0 First Commercial Release | 15 | 2 | Planned |

## 8. Maintenance du Backlog Master

Le Backlog Master doit etre mis a jour a chaque creation, demarrage, abandon ou cloture de ticket structurant.

Lorsqu'un nouveau ticket est ajoute :

- choisir son EPIC unique ;
- lui attribuer le prochain identifiant disponible ;
- renseigner les dependances ;
- fixer la priorite ;
- initialiser l'etat a `Planned` ou `In Progress` ;
- eviter toute specification detaillee dans ce document.

Lorsqu'un ticket est termine :

- passer son etat a `Completed` ;
- mettre a jour les indicateurs ;
- ne pas renommer son identifiant ;
- ne pas fusionner son historique avec un autre ticket.
