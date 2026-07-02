ADR-012 - Shared Kernel

## Statut

Accepte.

## Contexte

ADR-011 definit PGYS comme un monolithe modulaire API-first avec des frontieres strictes entre modules.

La Platform Map separe les niveaux Platform, Business Modules, Applications et Extensions. Cette separation impose de limiter ce qui peut etre partage afin d'eviter les couplages metier implicites.

PGYS a besoin d'un Shared Kernel pour mutualiser les primitives techniques communes sans transformer ce noyau partage en domaine metier transversal.

## Decision

PGYS utilise un Shared Kernel petit, stable et tres controle.

Le Shared Kernel regroupe uniquement des elements techniques communs, reutilisables par plusieurs modules sans porter de regle metier.

Il ne doit pas devenir un module metier cache, ni un raccourci pour contourner les contrats publics des modules.

## Role du Shared Kernel

Le Shared Kernel sert a partager des primitives transverses necessaires a la coherence technique du monolithe modulaire.

Il peut fournir des types, interfaces et helpers generiques qui evitent la duplication technique entre modules.

Il ne decide pas des comportements metier. Ces comportements restent dans les modules Platform ou Business concernes.

## Elements autorises

Les elements suivants peuvent appartenir au Shared Kernel :

- types techniques communs ;
- erreurs standardisees ;
- contrats API transverses ;
- helpers sans logique metier ;
- primitives de pagination ;
- primitives d'auth context ;
- interfaces d'evenements communes ;
- constantes techniques stables ;
- utilitaires de serialisation ou de formatage sans decision metier.

## Elements interdits

Les elements suivants sont interdits dans le Shared Kernel :

- logique metier ;
- regles de pricing ;
- regles billing ;
- regles workspace ;
- acces Prisma ;
- repositories ;
- services applicatifs ;
- dependance a un module applicatif ;
- dependance a une Extension ;
- regles propres a une verticale ;
- orchestration de cas d'usage.

Le Shared Kernel ne doit pas importer de module Business, Application ou Extension.

Il ne doit pas connaitre les details internes d'un module.

## Regle principale

Le Shared Kernel doit rester petit, stable et tres controle.

Tout ajout doit etre justifie par au moins deux modules consommateurs.

Si un element n'a qu'un seul consommateur, il reste dans le module qui l'utilise.

Si un element porte une decision metier, il reste dans le module metier responsable.

Si un element est lie a un fournisseur externe, il reste dans l'Extension concernee ou derriere son contrat public.

## Relation avec ADR-011

ADR-011 impose des frontieres strictes entre modules et interdit l'acces direct aux donnees internes d'un autre module.

Le Shared Kernel ne modifie pas cette regle.

Il fournit seulement des primitives communes qui aident les modules a communiquer proprement par contrats publics ou evenements.

Un module ne doit pas placer une partie de son modele interne dans le Shared Kernel pour la rendre accessible aux autres modules.

## Relation avec la Platform Map

La Platform Map definit le sens des dependances :

```text
Applications
    ↓
Business Modules
    ↓
Platform
```

Le Shared Kernel soutient cette architecture sans creer un cinquieme niveau metier.

Il peut etre utilise par plusieurs niveaux lorsque l'element partage reste purement technique.

Il ne doit jamais permettre a une Application de contourner un Business Module ou a un Business Module de contourner la Platform.

## Consequences

Les modules PGYS peuvent partager des primitives techniques communes sans dupliquer du code bas niveau.

Les frontieres metier restent protegees.

Les ajouts au Shared Kernel doivent etre rares, justifies et relus avec attention.

Un ajout injustifie doit rester local au module demandeur.

Toute extension significative du Shared Kernel doit etre documentee par un ADR ou par une mise a jour de celui-ci.
