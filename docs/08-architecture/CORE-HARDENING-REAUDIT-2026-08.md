# Reevaluation Core Platform Hardening - 2026-08

## 1. Objet

Ce document reevalue PGYS-032 sur l'etat reel du depot au 21 aout 2026. Il ne
remplace pas l'historique de `ARCHITECTURE-REVIEW-CORE-SAAS.md` ni de
`CORE-AUDIT-REPORT.md` ; il identifie les constats devenus obsoletes et les
ecarts encore actionnables.

PGYS-032 reste `Planned`. Son ancien perimetre ne doit pas etre implemente en
un seul changement : les corrections restantes touchent des frontieres de
securite, de contrats inter-modules, de pagination et de provisioning qui
doivent etre traitees en increments independants.

## 2. Verification du socle actuel

Les controles suivants ont ete executes sur l'API actuelle :

| Controle | Resultat |
| --- | --- |
| Prisma validate | OK |
| Prisma generate | OK |
| Build API | OK |
| Tests API | 150 suites et 932 tests passes |
| Lint API | OK |
| Typecheck API | OK |

Le schema Prisma a ete valide avec une URL PostgreSQL locale factice, sans
connexion ni migration. Aucun fichier applicatif n'a ete modifie par l'audit.

## 3. Constats historiques deja corriges

Les points suivants du rapport historique ne sont plus des ecarts :

- le prefixe global `/api/v1` est applique dans `main.ts` ;
- le build Swagger de Workspace Services est repare ;
- les vocabulaires stables de Feature, Offer, Price, Subscription et
  Provisioning sont centralises par module ;
- les transitions critiques de Subscription et Provisioning disposent de
  tests unitaires ;
- PGYS-034 fournit un test d'integration applicatif du vertical slice
  Workspace Onboarding, y compris rejeu, changement d'offre, resiliation et
  isolation entre Workspaces ;
- la contrainte PostgreSQL d'une souscription active unique par Workspace et
  Offer existe dans la migration dediee ;
- l'autorisation globale des operateurs PGYS existe avec les roles
  `PLATFORM_ADMIN` et `PLATFORM_SUPPORT`.

Le rapport `CORE-AUDIT-REPORT.md` reste utile comme historique, mais ses
resultats de build et de tests ne doivent plus etre utilises comme etat
courant.

## 4. Ecarts encore reels

### 4.1. Autorisation des surfaces Core

La matrice d'autorisation confirmee est appliquee aux controllers suivants :

- Service Catalog ;
- Features ;
- Offers et Offer Features ;
- Pricing ;
- Subscriptions ;
- Provisioning.

Chaque surface exige desormais un JWT et un profil PlatformOperator actif.
`PLATFORM_SUPPORT` dispose des lectures et `PLATFORM_ADMIN` des lectures et
mutations. Workspace Services suit la meme frontiere ; un simple membre d'un
Workspace ne peut plus cibler arbitrairement ces routes.

Le futur catalogue commercial anonyme et les consultations locales d'un
abonnement ou de services utiliseront des endpoints distincts, filtres et
Workspace-scoped. Aucun role Workspace n'obtient de mutation implicite sur
l'offre souscrite ou le provisioning.

### 4.2. Validation et contrat HTTP

Le premier increment technique de PGYS-032 applique `ParseUUIDPipe` en version
4 aux identifiants de Pricing, Subscriptions et Provisioning. Treize cas de
controller verifient la presence du pipe, l'acceptation d'un UUID v4 et le rejet
d'une valeur invalide ou d'une autre version.

Le deuxieme increment installe un filtre d'exception global conforme a
ADR-014. Les erreurs exposent desormais `code`, `message`, `details` et
`correlationId`. Les erreurs de validation conservent leurs messages dans des
details structures, un code metier explicite peut etre fourni par une exception
et les erreurs internes sont masquees puis journalisees avec leur identifiant de
correlation.

Les ecarts suivants restent ouverts :

- aucun test HTTP de bout en bout ne couvre encore guards, validation et
  erreurs ;
- Service Catalog, Features, Offers, Pricing et Subscriptions sont desormais
  pagines selon la convention ADR-014, avec `page` a partir de 1, `pageSize`
  limite a 100, `total` et `items`.

Ces sujets doivent rester separes : la validation d'identifiants, le format
d'erreur et la pagination modifient des contrats clients differents.

### 4.3. Frontieres inter-modules

Les contrats publics de Features, Offers, Pricing et Subscriptions existent
dans `shared/contracts`. Lors de la reevaluation initiale, aucun n'etait
implemente ni injecte par son module proprietaire.

Les contrats publics Workspace, Features, Offers, Pricing et Subscriptions sont
desormais implementes par leurs services proprietaires, injectables via des
tokens explicites exportes par leurs modules. Les consommateurs peuvent
maintenant migrer progressivement sans importer les repositories proprietaires.

Plusieurs repositories continuent donc a lire directement les tables d'autres
modules :

- Offer Features lit Offer, Feature, Subscription et CheckoutSession ;
- Pricing consomme desormais Offer via son contrat public, mais lit encore
  Subscription et CheckoutSession pour verifier l'utilisation d'une offre ;
- Subscriptions lit Workspace, Offer et Price ;
- Provisioning lit Subscription, Offer, OfferFeature et WorkspaceService.

Une correction mecanique repository par repository serait dangereuse. Chaque
dependance doit etre remplacee par un contrat public minimal, avec un test
d'integration prouvant que les invariants actuels sont conserves.

### 4.4. Provisioning incomplet

Le `ProvisioningOrchestratorService` charge Subscription, Offer, Offer Features
et Workspace Services, puis execute une etape `publish-event-placeholder`. Il
n'active ni ne desactive encore de Workspace Service et ne publie aucun
evenement de domaine reel.

Le test d'integration PGYS-034 valide l'orchestration applicative avec un etat
en memoire ; il ne prouve pas une activation persistante de services ni la
reprise d'une execution partiellement echouee.

Completer ce flux necessite de definir la correspondance entre une Offer, ses
Features et les `serviceKey` a activer, ainsi que les effets attendus d'un
reprovisioning ou d'un deprovisioning. Ce comportement ne doit pas etre deduit
implicitement du schema Prisma.

## 5. Decoupage atomique recommande

PGYS-032 doit etre traite dans l'ordre suivant, chaque increment ayant ses
propres tests, validations et commit :

1. definir puis appliquer la matrice d'autorisation des surfaces Core ;
2. garantir l'appartenance Workspace sur Workspace Services ;
3. valider les UUID des controllers Core et ajouter les tests HTTP associes ;
4. standardiser le contrat d'erreur et l'identifiant de correlation ;
5. paginer les collections Core avec des DTO compatibles ;
6. remplacer les lectures Prisma inter-modules par les contrats publics ;
7. definir puis implementer les effets persistants du provisioning ;
8. refaire l'audit et ne cloturer PGYS-032 que lorsque chaque ecart accepte est
   corrige ou explicitement reporte dans un nouveau ticket.

Les increments 1, 2 et 7 exigent une decision d'autorisation ou de comportement
metier. Les increments 3 a 6 sont techniques, mais leurs contrats publics
doivent etre stabilises avant implementation pour eviter une rupture API
globale.

## 6. Criteres de cloture de PGYS-032

PGYS-032 pourra passer a `Completed` lorsque :

- aucune mutation Core sensible n'est accessible sans l'autorisation attendue ;
- toute ressource tenant-aware verifie l'identite et le Workspace ;
- les UUID, erreurs et collections respectent un contrat HTTP teste ;
- les modules proprietaires exposent et implementent leurs contrats publics ;
- Provisioning ne depend plus d'un effet persistant implicite ou d'un
  placeholder ;
- Prisma validate/generate, build, tests, lint et typecheck restent verts ;
- le perimetre Git ne contient aucun changement Website, Portal ou
  configuration preexistant.
