# Integrations Map

## Statut

Cartographie initiale des Integrations PGYS pour le ticket PGYS-060.

Ce document cadre les responsabilites, les frontieres et les garde-fous avant
les contrats Email, SMS, Stripe et OVH. Il ne definit ni modele Prisma, ni
endpoint, ni DTO, ni appel fournisseur executable.

## Objectif

Integrations relie PGYS a des services externes sans laisser leurs SDK, formats,
identifiants ou cycles de vie devenir des contrats internes du produit.

La fondation cible doit permettre de :

- exposer des contrats stables aux modules PGYS ;
- isoler chaque fournisseur derriere un adaptateur remplacable ;
- proteger et administrer les configurations et secrets ;
- tracer les commandes sortantes et notifications entrantes ;
- appliquer l'isolation Workspace, l'idempotence et les politiques de reprise ;
- traduire les erreurs et statuts proprietaires vers un langage PGYS ;
- conserver les modules metier comme sources de verite de leurs concepts.

## Position dans l'architecture

Les fournisseurs et leurs adaptateurs appartiennent au niveau Extensions de la
Platform Map. Les contrats consommes par PGYS sont exposes par le module
proprietaire de la capacite ou par une facade Platform explicitement definie.

```text
Applications / Business Modules / Platform
                    |
                    v
          Contrats publics PGYS
                    |
          +---------+---------+
          |                   |
 Commandes sortantes   Evenements entrants
          |                   |
          +---------+---------+
                    |
        Adaptateur fournisseur
                    |
                    v
         Service externe / API
```

Un module consommateur ne depend jamais directement d'un SDK fournisseur. Un
adaptateur depend du contrat PGYS qu'il implemente, jamais de la persistance
interne d'un autre module.

## Etat reel du depot

Au moment de PGYS-060 :

- PGYS-013 est marque termine et la documentation d'architecture identifie
  Nextcloud comme moteur de PGYS Cloud, pilotable par API ou commandes `occ` ;
- le module Provisioning cree et suit des jobs workspace-scoped, charge leur
  Subscription, Offer, Features et Workspace Services, puis termine sur une
  etape de publication encore vide ;
- aucun adaptateur Nextcloud executable n'est enregistre dans l'API ;
- `ADR-004-Provisioning-Providers.md` existe mais ne contient encore aucune
  decision ;
- Checkout et Billing excluent explicitement les fournisseurs de paiement ;
- Marketing prepare Segments, Campaigns, Templates et Automations sans
  diffusion Email ou SMS ;
- AI utilise deja un contrat interne et un registre d'adaptateurs, sans SDK ni
  appel fournisseur reel ;
- aucun SDK, webhook ou secret Email, SMS, Stripe ou OVH n'est present dans le
  code applicatif.

Cette cartographie decrit donc les frontieres cibles sans requalifier les
placeholders actuels en integrations operationnelles.

## Ubiquitous Language

### Integration Contract

Un Integration Contract exprime une capacite stable attendue par PGYS : envoyer
un message, demander un paiement, provisionner un service ou recevoir un fait
externe.

Il utilise le langage PGYS et ne publie ni objet SDK, ni statut proprietaire,
ni identifiant de modele technique non abstrait.

### Provider Adapter

Un Provider Adapter traduit un Integration Contract vers l'API, le protocole
ou l'outil d'un fournisseur determine. Il est remplacable et ne porte pas de
regle metier appartenant au consommateur.

### Provider Configuration

Provider Configuration designe les parametres non secrets autorises pour
selectionner et configurer un adaptateur. Sa portee globale ou par Workspace
doit etre decidee par le ticket du contrat concerne.

### Provider Credential

Provider Credential designe une cle, un jeton, un certificat ou toute autre
preuve d'acces externe. Un secret ne figure jamais dans Git, un DTO de reponse,
un evenement, une erreur publique ou un journal applicatif.

### Integration Attempt

Une Integration Attempt represente une tentative technique d'appel externe.
Elle peut conserver les metadonnees necessaires a l'observabilite, aux reprises
et a l'audit, sans devenir la source de verite du concept metier demandeur.

### External Reference

External Reference est l'identifiant retourne par un fournisseur. Elle sert a
correler les echanges, mais ne remplace jamais l'identifiant PGYS de l'operation
ou de l'agregat metier.

### Webhook

Un Webhook est une notification entrante non fiable tant que son authenticite,
sa date, son schema et son unicite n'ont pas ete verifies. Son payload brut
n'est pas un evenement metier PGYS.

## Carte des responsabilites

| Capacite | Proprietaire PGYS | Responsabilite de l'Integration |
| --- | --- | --- |
| Workspace et permissions | Platform | Borner configuration, commandes et traces |
| Email / SMS metier | Module demandeur ou Notifications | Exprimer destinataire, contenu et intention autorises |
| Diffusion Email / SMS | Integrations | Adapter, envoyer et traduire le resultat technique |
| Campaign / Template | Marketing | Rester source de verite de la campagne et du contenu |
| Checkout / Invoice / Payment | Checkout, Billing ou futur Payments | Porter les invariants et transitions commerciales |
| Paiement Stripe | Integration Stripe | Creer ou consulter l'operation externe et traduire ses notifications |
| Subscription / Workspace Service | Commercial Core / Platform | Porter l'abonnement et l'etat de service PGYS |
| Provisioning | Platform Provisioning | Orchestrer les operations et suivre les jobs |
| Action Nextcloud / OVH | Integration concernee | Executer l'appel technique sans posseder l'abonnement PGYS |
| AI request / usage | AI Platform | Porter le contrat et l'audit AI |
| OpenAI / Mistral | Adaptateur AI | Traduire le contrat AI vers le fournisseur |
| Reporting consolide | Reporting | Lire les faits exposes sans piloter un fournisseur |

## Commandes sortantes

Une commande sortante part d'un cas d'usage PGYS deja autorise. Elle doit porter
une identite de correlation et les donnees strictement necessaires.

Le module proprietaire reste responsable :

- de valider le Workspace et les permissions ;
- de verifier les invariants metier avant la demande ;
- de definir l'effet attendu et le comportement en cas d'indisponibilite ;
- de decider quand un resultat technique permet une transition metier ;
- de conserver son propre etat et son historique.

L'adaptateur reste responsable :

- de construire la requete fournisseur ;
- d'appliquer timeout, authentification et limites techniques ;
- de traduire reponse, refus et erreur vers le contrat PGYS ;
- de restituer l'External Reference lorsqu'elle existe ;
- d'emettre les metadonnees techniques autorisees pour l'audit.

Aucun appel reseau externe ne doit etre execute dans une transaction Prisma
longue.

## Notifications entrantes et webhooks

Une entree fournisseur suit la sequence cible suivante :

```text
Requete externe
      |
      v
Verification signature / authenticite / horodatage
      |
      v
Validation du schema et resolution de la configuration
      |
      v
Deduplication par identifiant fournisseur ou cle stable
      |
      v
Traduction en fait technique PGYS
      |
      v
Service public du module proprietaire / evenement versionne
```

Le traitement doit accepter les livraisons repetees et les arrivees dans un
ordre non garanti. Un webhook ne modifie jamais directement les tables d'un
module metier et ne contourne pas ses transitions.

La conservation eventuelle du payload brut, sa redaction, son chiffrement et sa
duree de retention doivent etre explicitement autorises par le ticket du
fournisseur. Par defaut, les secrets et contenus sensibles ne sont pas
journalises.

## Isolation Workspace

Toute configuration, commande, tentative et notification tenant-aware doit
etre resolue dans un `workspaceId` explicite.

Les invariants suivants s'appliquent :

- une configuration d'un Workspace n'est jamais utilisee pour un autre ;
- une External Reference est interpretee avec son fournisseur et sa portee ;
- un webhook doit resoudre son Workspace avant toute consequence metier ;
- les recherches et mutations persistantes sont filtrees par `workspaceId` ;
- les secrets et journaux ne melangent jamais les donnees de plusieurs
  Workspaces ;
- une integration globale ne cree pas de droit implicite sur les donnees d'un
  Workspace.

Les contrats globaux hors Workspace doivent etre explicitement justifies. La
cartographie n'en introduit aucun.

## Idempotence, reprises et erreurs

- Toute commande susceptible d'etre rejouee porte une cle d'idempotence PGYS.
- Un adaptateur reutilise le mecanisme fournisseur lorsqu'il existe, sans en
  faire l'unique garantie interne.
- Une notification entrante est dedupliquee avant ses effets.
- Les reprises sont bornees, observables et reservees aux erreurs classees
  temporaires.
- Un refus permanent n'est pas relance automatiquement comme une panne
  transitoire.
- Les erreurs publiques sont stables et expurgees des secrets et payloads.
- L'etat `unknown` apres timeout doit etre resolu par consultation ou
  reconciliation avant de repeter une operation non idempotente.
- Une panne fournisseur ne doit pas corrompre l'etat metier PGYS.

Les strategies exactes de file, backoff, dead-letter et reconciliation
appartiennent aux tickets executables.

## Securite et donnees

- Les credentials sont injectes depuis une configuration securisee et ne sont
  jamais versionnes.
- Les permissions du fournisseur suivent le principe du moindre privilege.
- Les donnees transmises sont minimisees selon la capacite demandee.
- Les environnements de test et de production utilisent des comptes et secrets
  separes.
- Les URLs de callback et certificats sont valides et controles.
- Toute donnee personnelle ou financiere envoyee hors PGYS exige un usage
  documente et une politique fournisseur compatible.
- Les journaux excluent mots de passe, tokens, signatures, donnees de carte et
  contenus sensibles non necessaires.
- La rotation et la revocation des credentials doivent etre possibles sans
  modification du code.

## Frontiere Email et SMS

Le module demandeur reste proprietaire de l'intention, du contenu et des
references metier. Integrations transporte le message et traduit le resultat
technique.

Les contrats PGYS-061 et PGYS-062 devront notamment definir :

- le destinataire et le format de message supporte ;
- la cle d'idempotence ;
- les statuts et erreurs normalises ;
- la selection et la configuration du fournisseur ;
- les metadonnees de tentative conservees ;
- la gestion des retours, refus et notifications fournisseur ;
- la frontiere avec les consentements et preferences de communication.

PGYS-060 n'autorise aucun envoi.

## Frontiere Stripe

Checkout, Billing et un futur domaine Payments restent proprietaires des
sessions, factures, paiements et transitions PGYS. Stripe ne devient pas la
source de verite d'une Subscription ou d'une Invoice.

PGYS-063 devra definir le produit Stripe utilise, les objets externes, les cles
d'idempotence, la correlation, les webhooks, les transitions autorisees et les
responsabilites de reconciliation. PGYS-060 ne cree ni client Stripe, ni
session, ni Payment Intent, ni webhook.

## Frontiere Nextcloud et OVH

Provisioning orchestre les demandes issues des Subscriptions, Offers, Features
et Workspace Services. Un adaptateur Nextcloud ou OVH execute uniquement les
actions techniques autorisees.

Il ne doit pas :

- redefinir l'etat de la Subscription ou du Workspace Service ;
- acceder directement aux repositories commerciaux ;
- choisir seul les quotas ou services a activer ;
- persister un secret dans un job ou une erreur ;
- masquer un resultat partiel ou incertain.

PGYS-064 devra preciser les capacites OVH V1 et leur relation avec Provisioning.
La completion historique de PGYS-013 ne suffit pas a conclure qu'un adaptateur
Nextcloud executable existe aujourd'hui.

## Sequence des tickets Integrations

La cartographie prepare les tickets suivants sans les implementer :

1. PGYS-061 - Email Provider Contract ;
2. PGYS-062 - SMS Provider Contract ;
3. PGYS-063 - Stripe Integration Preparation ;
4. PGYS-064 - OVH Integration Preparation.

Chaque ticket doit confirmer sa capacite V1, le proprietaire du contrat, sa
portee de configuration, ses donnees, son idempotence, ses erreurs, ses traces
et ses exclusions avant d'introduire du code ou une persistance.

## Decision PGYS-061 - Email Provider Contract

PGYS-061 introduit un contrat interne d'envoi d'email transactionnel, sans
fournisseur executable ni endpoint public.

Le perimetre V1 est le suivant :

- une demande appartient a un `workspaceId` et porte une cle d'idempotence
  obligatoire dans ce Workspace ;
- elle cible un destinataire unique et contient un sujet et un contenu texte
  obligatoires, avec un contenu HTML optionnel ;
- l'expediteur est configure globalement cote serveur par
  `EMAIL_FROM_ADDRESS` et `EMAIL_FROM_NAME` ;
- `EMAIL_PROVIDER` selectionne un adaptateur enregistre sans imposer de nom de
  fournisseur dans le contrat public ;
- le registre d'adaptateurs reste insensible a la casse et echoue proprement si
  le fournisseur configure n'est pas installe ;
- la reponse normalisee porte le statut `ACCEPTED`, `REJECTED` ou `FAILED`, le
  fournisseur et une External Reference optionnelle ;
- les entrees sont normalisees et bornees avant tout appel a l'adaptateur ;
- une erreur technique d'adaptateur est propagee sans reprise implicite ;
- les tests utilisent uniquement un adaptateur factice en memoire.

La cle d'idempotence est transmise a l'adaptateur afin d'utiliser la garantie du
fournisseur lorsqu'elle existe. PGYS-061 ne persiste aucune tentative et ne
pretend donc pas fournir encore une deduplication interne durable.

Les envois groupes, pieces jointes, templates executables, campagnes, suivi
d'ouverture, clics, webhooks, reprises, audit et delivery persiste restent hors
du perimetre. Aucun secret ni configuration fournisseur n'est ajoute au depot.

## Decision PGYS-062 - SMS Provider Contract

PGYS-062 introduit un contrat interne d'envoi de SMS transactionnel, sans
fournisseur executable ni endpoint public.

Le perimetre V1 est le suivant :

- une demande appartient a un `workspaceId` et porte une cle d'idempotence
  obligatoire dans ce Workspace ;
- elle cible un destinataire unique au format international E.164 ;
- elle contient un texte obligatoire limite a 1 600 caracteres ;
- `SMS_PROVIDER` selectionne globalement un adaptateur enregistre ;
- `SMS_FROM` permet de definir un expediteur global optionnel cote serveur ;
- le registre d'adaptateurs reste insensible a la casse et echoue proprement si
  le fournisseur configure n'est pas installe ;
- la reponse normalisee porte le statut `ACCEPTED`, `REJECTED` ou `FAILED`, le
  fournisseur et une External Reference optionnelle ;
- une erreur technique d'adaptateur est propagee sans reprise implicite ;
- les tests utilisent uniquement un adaptateur factice en memoire.

Comme pour Email, la cle d'idempotence est transmise a l'adaptateur, mais aucune
deduplication interne durable n'est revendiquee sans persistance de delivery.

Les envois groupes, MMS, liens courts, campagnes, accuses de livraison,
webhooks, reprises, audit, estimation du nombre de segments et calcul du cout
restent hors du perimetre. Aucun secret ni configuration fournisseur n'est
ajoute au depot.

## Decisions differees

PGYS-060 ne decide pas :

- les fournisseurs Email ou SMS initiaux ;
- les protocoles SMTP, API, SMPP ou autres transports ;
- la portee globale ou par Workspace des configurations ;
- le stockage et le chiffrement des credentials ;
- les templates techniques ou variables de messages ;
- les consentements et preferences de communication ;
- le produit Stripe et le parcours de paiement ;
- les services OVH et commandes de provisioning V1 ;
- le contrat executable Nextcloud ;
- la file, les workers, les reprises et la reconciliation ;
- la retention des tentatives et payloads entrants ;
- les quotas, couts, metriques, dashboards ou marketplace d'activation.

Ces decisions appartiennent aux tickets proprietaires et ne doivent pas etre
deduites de cette cartographie.

## Non-objectifs

PGYS-060 ne cree :

- aucun module applicatif ;
- aucune migration ou modification Prisma ;
- aucun controller, service, repository ou DTO ;
- aucun contrat fournisseur executable ;
- aucun appel reseau ou webhook ;
- aucun worker ou file de traitement ;
- aucun credential ou parametre secret ;
- aucune interface utilisateur ;
- aucune activation de fournisseur.

## Criteres pour les futurs tickets

Avant toute implementation d'Integration, le ticket concerne doit confirmer :

- la capacite precise et le module proprietaire du contrat PGYS ;
- les fournisseurs et transports inclus dans la V1 ;
- la portee globale ou Workspace de la configuration ;
- les donnees autorisees a quitter PGYS ;
- les commandes, reponses, erreurs et statuts normalises ;
- les cles d'idempotence et references de correlation ;
- la verification et la deduplication des notifications entrantes ;
- les timeouts, reprises et reconciliations ;
- les metadonnees d'audit et leur retention ;
- le comportement metier lorsque le fournisseur est indisponible.
