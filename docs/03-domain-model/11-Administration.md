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
- PGYS-072 : vues d'administration des abonnements ;
- PGYS-073 : vues d'administration du journal d'audit.

Toute vue transverse doit verifier l'autorisation Platform dediee. Toute vue
d'administration cliente doit conserver l'isolation stricte du workspace.
