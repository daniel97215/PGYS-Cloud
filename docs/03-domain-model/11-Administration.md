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

Une autorisation Platform globale et dediee devra identifier explicitement les
operateurs internes avant que ce portail puisse lire ou modifier des donnees
reelles. Les roles de workspace existants ne conferent jamais cet acces global.

PGYS-070 livre uniquement le shell visuel, la navigation et l'explication de ce
perimetre. Il ne livre ni role global, ni endpoint d'administration, ni acces
aux donnees, ni mutation operationnelle.

## 3. Administration d'une societe

Chaque societe administre ses utilisateurs et leurs autorisations dans son
propre workspace. Les roles `OWNER` et `ADMIN` restent soumis a l'isolation
`workspaceId` et ne permettent d'acceder a aucun autre workspace.

Cette administration locale appartient a l'experience cliente. Elle ne doit
pas reutiliser les futures autorisations Platform et ne doit pas etre exposee
comme une capacite d'operateur PGYS.

## 4. Sequencement

- PGYS-070 : fondation visuelle du portail operateur, sans donnees reelles ;
- PGYS-071 : vues d'administration des workspaces, apres definition de
  l'autorisation Platform necessaire ;
- PGYS-072 : vues d'administration des abonnements ;
- PGYS-073 : vues d'administration du journal d'audit.

Toute vue transverse doit verifier l'autorisation Platform dediee. Toute vue
d'administration cliente doit conserver l'isolation stricte du workspace.
