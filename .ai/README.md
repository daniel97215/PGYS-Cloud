# PGYS AI Context

Ce dossier fournit le contexte à donner à Codex, Cursor ou tout autre agent IA.

Avant toute tâche, l’agent doit lire :

- `docs/00-VISION.md`
- `docs/01-PRODUIT.md`
- `docs/02-ARCHITECTURE.md`
- `docs/05-DEVELOPPEMENT.md`
- `.ai/RULES.md`

Le dépôt Git est la source de vérité.

## Fichiers

- `AI_CONTEXT.md` : résumé stable du produit et du dépôt ;
- `RULES.md` : règles obligatoires pour toute intervention ;
- `CODEX-PROMPT.md` : prompt de démarrage pour les tickets PGYS.

Les agents doivent limiter leurs modifications au ticket demandé, préserver les
changements existants et signaler les vérifications qu’ils n’ont pas pu lancer.
