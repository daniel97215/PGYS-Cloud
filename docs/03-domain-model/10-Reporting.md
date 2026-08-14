# Reporting Domain Map

## Statut

Cartographie initiale du domaine Reporting pour le ticket PGYS-065.

Ce document cadre les responsabilites, les frontieres et les garde-fous avant
toute nouvelle implementation. Il ne definit ni modele Prisma, ni endpoint, ni
DTO, ni indicateur metier supplementaire.

## Objectif

Reporting fournit des vues de lecture permettant de comprendre l'activite d'un
Workspace sans devenir la source de verite des faits observes.

La fondation cible doit permettre de :

- exposer des indicateurs explicites et reproductibles ;
- consolider les faits produits par Platform, Commercial Core, ERP, CRM,
  Marketing et AI ;
- appliquer des dimensions et filtres coherents ;
- preserver l'isolation entre Workspaces ;
- distinguer un instantane courant d'une mesure historique ;
- preparer les dashboards et exports sans les confondre avec les calculs.

## Position dans l'architecture

Reporting est un Business Module transverse en lecture seule.

```text
Platform  Commercial Core  ERP  CRM  Marketing  AI
    \            |          |    |       |       /
     +-----------+----------+----+-------+------+
                            |
                            v
                  Contrats de Reporting
                            |
                +-----------+-----------+
                |                       |
          API de lecture          Applications
                                  dashboards/exports
```

Les modules sources restent proprietaires de leurs faits et transitions.
Reporting selectionne, regroupe et presente ces faits ; il ne les corrige pas
et ne commande aucune mutation metier.

## Etat reel du depot

Au moment de PGYS-065 :

- `crm-reporting` expose deja deux instantanes workspace-scoped pour les
  opportunites et les activites CRM ;
- ses lectures Prisma sont centralisees dans un repository dedie ;
- les montants d'opportunites sont regroupes par devise sans addition
  inter-devise ;
- aucun modele Prisma ne persiste un rapport, un dashboard ou un export ;
- aucun module Reporting consolide encore plusieurs domaines ;
- les documents CRM, Marketing, ERP, AI et Integrations attribuent deja les
  vues consolidees a Reporting ;
- le document des indicateurs economiques reste a rediger et ne constitue pas
  une specification executable.

Cette carte reconnait la fondation CRM existante sans la generaliser
implicitement aux futurs tickets.

## Ubiquitous Language

### Report

Un Report est une reponse de lecture construite a partir de faits appartenant a
un ou plusieurs modules sources. Son contrat nomme les mesures, dimensions,
filtres et regles de calcul qu'il expose.

### Metric

Une Metric est une valeur calculee selon une formule et un perimetre explicites.
Un meme libelle ne doit pas masquer des formules, statuts ou dates differents.

### Dimension

Une Dimension est un axe stable de regroupement ou de filtrage, par exemple un
statut, un pipeline, une devise ou une periode. Sa valeur provient du domaine
source ou d'une traduction documentee par le contrat du rapport.

### Snapshot

Un Snapshot decrit l'etat observable au moment de la requete. Il peut filtrer
des faits existants par date, mais ne reconstitue pas une situation historique
si les transitions necessaires n'ont pas ete conservees.

### Historical Measure

Une Historical Measure depend de faits immuables ou d'un historique de
transitions. Elle ne peut pas etre deduite de l'etat courant lorsque les donnees
necessaires n'existent pas.

### Dashboard

Un Dashboard compose plusieurs contrats de Reporting pour un usage determine.
Il organise la presentation mais ne definit pas silencieusement une nouvelle
formule metier.

### Export

Un Export est une projection telechargeable d'un contrat de lecture autorise.
Son format, son volume et sa retention ne changent ni la source ni le sens des
donnees.

## Carte des responsabilites

| Concept | Proprietaire | Responsabilite |
| --- | --- | --- |
| Workspace et permissions | Platform | Isolation, appartenance et autorisation de lecture |
| Subscription, Offer et Invoice SaaS | Commercial Core / Billing | Faits commerciaux et cycle de vie source |
| Produits, stocks, ventes et achats | ERP | Faits operationnels et documents sources |
| Opportunites et activites | CRM | Faits relationnels et commerciaux CRM |
| Segments, campagnes et automatisations | Marketing | Definitions et etats marketing sources |
| Usages AI | AI Platform | Traces d'usage autorisees |
| Metric et Report | Reporting | Formule, regroupements, filtres et contrat de reponse |
| Dashboard | Application consommatrice | Composition et presentation des rapports |
| Export | Reporting ou application selon ticket | Projection autorisee et bornee d'un rapport |

## Frontieres avec les domaines sources

Reporting ne devient jamais proprietaire :

- d'une Subscription ou d'une Invoice Billing ;
- d'un Product, d'un mouvement de stock ou d'un document ERP ;
- d'une Opportunity, d'une Activity ou d'un Pipeline CRM ;
- d'un Segment, d'une Campaign, d'un Template ou d'une Automation Marketing ;
- d'un AI Usage ;
- d'un statut ou d'une transition appartenant a l'un de ces modules.

Une incoherence de donnees doit etre corrigee dans le module proprietaire. Un
rapport ne reecrit pas un fait source et n'introduit pas une source concurrente.

Les lectures Prisma restent limitees aux repositories de Reporting. Lorsqu'un
module source expose un contrat public adapte, Reporting le consomme. Une
lecture consolidee directe doit rester explicitement bornee, en lecture seule
et couverte par un repository dedie ; elle ne donne aucun droit d'ecriture dans
la persistance d'un autre module.

## Isolation Workspace et permissions

Toute requete issue d'un Workspace porte un `workspaceId` explicite. Chaque
source, jointure, agregation et verification de reference est bornee par ce
Workspace.

Il est interdit :

- d'agreger plusieurs Workspaces dans un contrat client ordinaire ;
- d'accepter un identifiant de filtre appartenant a un autre Workspace ;
- de reutiliser un cache ou un export entre Workspaces ;
- de construire une jointure uniquement sur un identifiant non verifie ;
- d'exposer une donnee que l'appelant ne peut pas consulter dans son contexte.

Un reporting global d'administration exige un contrat distinct, des permissions
dediees et un ticket explicite. PGYS-065 n'en introduit aucun.

## Temps, statuts et historique

Chaque Metric temporelle doit nommer :

- la date source utilisee, par exemple creation, emission, echeance, paiement
  ou achevement ;
- les bornes inclusives ou exclusives de la periode ;
- le fuseau de reference et le traitement des jours civils ;
- les statuts inclus et exclus ;
- la date d'observation lorsque la reponse est un Snapshot.

Un filtre de periode sur `createdAt` ne transforme pas un etat courant en
historique. Les taux de conversion, encours a une date passee, delais entre
transitions ou tendances exigent des faits historiques suffisants. Si ces faits
n'existent pas, le ticket doit differer la mesure plutot que l'estimer.

## Montants et devises

Les montants conservent la devise de leur fait source. Reporting :

- regroupe les montants separement par devise ;
- n'additionne jamais des devises differentes ;
- n'invente ni taux de change, ni devise de consolidation ;
- conserve la precision definie par le domaine source ;
- documente les statuts et dates qui rendent un montant eligible.

Toute conversion monetaire future exige une source de taux, une date de
conversion, des regles d'arrondi et un ticket proprietaire.

## Architecture de lecture cible

```text
Requete autorisee et workspace-scoped
                  |
                  v
       DTO de filtres ferme et valide
                  |
                  v
        Service de Reporting
        - applique la formule
        - traduit les groupes
        - ne contient pas Prisma
                  |
                  v
       Repository de lecture dedie
        - filtre par workspaceId
        - lit les faits necessaires
        - ne produit aucune mutation
                  |
                  v
       Reponse explicite et stable
```

Le choix entre calcul instantane, read model persiste, cache ou traitement
asynchrone appartient au ticket qui en demontre le besoin. Aucune de ces
strategies n'est introduite par la carte.

## Invariants structurants

- toute lecture client est isolee par `workspaceId` ;
- Reporting est en lecture seule vis-a-vis des domaines sources ;
- Prisma reste limite aux repositories ;
- toute Metric possede une formule, des statuts et une date source explicites ;
- les devises restent separees sans conversion implicite ;
- un Snapshot n'est pas presente comme un historique ;
- une valeur absente est distinguee de zero ;
- les filtres sont fermes, valides et appliques de facon coherente ;
- les resultats restent deterministes pour les memes faits et parametres ;
- un dashboard ou export ne contourne ni permissions, ni limites de volume.

## Sequence des tickets Reporting

La cartographie prepare les tickets suivants sans les implementer :

1. PGYS-066 - Operational Dashboards Foundation ;
2. PGYS-067 - Commercial Reporting Foundation ;
3. PGYS-068 - ERP Reporting Foundation ;
4. PGYS-069 - CRM Reporting Consolidation.

Chaque ticket doit definir ses mesures, dimensions, sources, dates, statuts,
permissions, filtres, contrats de reponse et exclusions avant d'introduire du
code ou une persistance.

## Decision PGYS-066 - Operational Dashboards Foundation

PGYS-066 introduit un instantane operationnel en lecture seule pour un
Workspace.

Le contrat V1 expose :

- les services `Service` regroupes par type et statut ;
- les jobs de provisioning regroupes par operation et statut ;
- la date de generation de l'instantane ;
- des filtres optionnels et inclusifs sur la date de creation des faits.

Le filtre de periode s'applique de facon identique aux services et aux jobs.
Il ne reconstitue pas un etat historique : les groupes de services decrivent
les statuts courants des services crees pendant la periode selectionnee.

Toutes les lectures sont bornees par `workspaceId` et centralisees dans le
repository de Reporting. Les operations et statuts de provisioning sont
limites aux constantes du moteur existant ; une valeur inconnue echoue
explicitement au lieu d'etre exposee comme un nouveau contrat.

Le ticket ne lit ni Subscription, ni Offer, ni Invoice et ne calcule aucun
revenu. Il n'ajoute aucun historique, monitoring d'infrastructure, uptime,
alerte, cache, export ou dashboard frontend.

## Decisions differees

PGYS-065 ne decide pas :

- les KPI exacts des futurs dashboards ;
- les formules de revenu, marge, stock, conversion ou performance ;
- les roles autorises a consulter chaque rapport ;
- le fuseau horaire metier de chaque Workspace ;
- la persistance de snapshots ou d'historiques supplementaires ;
- le cache, le rafraichissement ou le pre-calcul ;
- les formats, volumes et politiques de retention des exports ;
- une conversion monetaire ou une devise de consolidation ;
- les objectifs, seuils, alertes ou comparaisons entre periodes ;
- le reporting global multi-Workspace d'administration.

Ces decisions appartiennent aux tickets proprietaires et ne doivent pas etre
deduites de cette cartographie.

## Non-objectifs

PGYS-065 ne cree :

- aucun module applicatif ;
- aucune migration ou modification Prisma ;
- aucun controller, service, repository ou DTO ;
- aucun nouvel indicateur executable ;
- aucun dashboard frontend ;
- aucun export ;
- aucun cache ou traitement asynchrone ;
- aucune donnee historique artificielle ;
- aucune conversion de devise.

## Criteres pour les futurs tickets

Avant toute implementation Reporting, le ticket concerne doit confirmer :

- la question metier a laquelle le rapport repond ;
- les faits et modules sources ;
- la formule exacte de chaque Metric ;
- les dimensions et filtres autorises ;
- les statuts, dates, bornes et fuseaux appliques ;
- le comportement des valeurs nulles, absentes ou egales a zero ;
- les regles de devise et d'arrondi ;
- les permissions et limites de volume ;
- le caractere instantane ou historique de la reponse ;
- les exclusions evitant de dupliquer une source de verite metier.
