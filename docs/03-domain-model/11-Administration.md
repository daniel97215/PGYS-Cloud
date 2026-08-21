# Administration

## 1. Objectif

Le domaine Administration distingue deux perimetres qui ne doivent jamais etre
confondus :

- l'administration interne de la plateforme PGYS ;
- l'administration d'une societe cliente dans son propre workspace.

Cette separation constitue la frontiere de securite de reference pour les vues
d'administration.

## 2. Administration interne PGYS

Le portail `apps/portal` est le back-office reserve aux operateurs internes de
PGYS. Il accueillera progressivement les vues transverses sur les workspaces,
les abonnements et le journal d'audit.

Une autorisation Platform globale et dediee identifie explicitement les
operateurs internes. Les roles de workspace existants ne conferent jamais cet
acces global.

Deux roles Platform sont definis :

- `PLATFORM_ADMIN` : operateur autorise a administrer la plateforme ;
- `PLATFORM_SUPPORT` : operateur limite aux consultations en lecture seule.

L'autorisation est rattachee a un utilisateur PGYS par un profil
`PlatformOperator` actif. Aucun endpoint public ne permet de creer ce profil ou
de s'attribuer un role Platform. Le provisionnement des operateurs reste une
operation interne controlee.

PGYS-070 livre le shell visuel, la navigation et l'explication de ce perimetre.
PGYS-071 ajoute l'autorisation Platform et la consultation globale, filtree et
paginee des workspaces. Cette consultation n'ajoute aucune mutation de
workspace.

PGYS-072 ajoute la consultation globale, filtree et paginee des abonnements,
ainsi que leur detail commercial (workspace, offre, prix et echeances). Les
vues sont strictement en lecture seule : elles reutilisent la source de verite
Subscription et ne contournent aucune transition de son cycle de vie.

PGYS-073 expose aux operateurs la consultation globale, filtree et paginee du
journal `AuditLog`. La vue restitue l'action, le workspace, l'acteur, la cible
et l'horodatage sans permettre aucune mutation. Le contenu JSON libre de
`metadata` n'est pas expose tant qu'un contrat de redaction explicite n'est pas
defini ; seule sa presence est signalee.

## 3. Administration d'une societe

Chaque societe administre ses utilisateurs et leurs autorisations dans son
propre workspace. Les roles `OWNER` et `ADMIN` restent soumis a l'isolation
`workspaceId` et ne permettent d'acceder a aucun autre workspace.

Cette administration locale appartient a l'experience cliente. Elle ne doit
pas reutiliser les futures autorisations Platform et ne doit pas etre exposee
comme une capacite d'operateur PGYS.

## 4. Sequencement

- PGYS-070 : fondation visuelle du portail operateur, sans donnees reelles ;
- PGYS-071 : autorisation Platform et vues de consultation des workspaces ;
- PGYS-072 : vues operateur en lecture seule des abonnements ;
- PGYS-073 : vues operateur en lecture seule du journal d'audit.

Toute vue transverse doit verifier l'autorisation Platform dediee. Toute vue
d'administration cliente doit conserver l'isolation stricte du workspace.

## 5. Matrice d'acces aux referentiels Core

Les endpoints Core existants de Service Catalog, Features, Offers, Offer
Features, Pricing, Subscriptions, Provisioning et Workspace Services sont des
surfaces operateur :

- `PLATFORM_SUPPORT` peut uniquement les consulter ;
- `PLATFORM_ADMIN` peut les consulter et executer leurs mutations ;
- un role de Workspace ne donne aucun acces implicite a ces routes globales.

Un futur catalogue commercial anonyme utilisera un endpoint distinct, limite
aux offres publiques actives et a leurs tarifs actifs. Il ne reutilisera pas
les listes operateur qui contiennent aussi les brouillons et references
internes.

Les administrateurs d'une societe disposeront de routes Workspace dediees pour
consulter leur abonnement et leurs services. Ils ne pourront pas modifier
directement l'offre souscrite, le provisioning ou les services actives tant
qu'un parcours metier distinct ne l'autorise pas explicitement.
