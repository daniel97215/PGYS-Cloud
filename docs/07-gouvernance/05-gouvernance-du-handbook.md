# PGYS â€” Structure officielle du Handbook

**Version :** 1.0
**Statut :** Proposition de rÃ©fÃ©rence
**Objet :** Organiser la documentation stratÃ©gique, produit et opÃ©rationnelle de PGYS

---

# 1. RÃ´le du Handbook

Le Handbook PGYS constitue la source de vÃ©ritÃ© de lâ€™entreprise.

Il doit permettre de comprendre :

* pourquoi PGYS existe ;
* ce que lâ€™entreprise veut devenir ;
* quels clients elle sert ;
* quels produits elle construit ;
* comment elle gagne de lâ€™argent ;
* quelles dÃ©cisions ont Ã©tÃ© prises ;
* quelles rÃ¨gles doivent guider les futurs dÃ©veloppements.

Le Handbook ne remplace pas :

* la documentation technique ;
* les tickets de dÃ©veloppement ;
* les procÃ©dures dÃ©taillÃ©es ;
* la documentation utilisateur.

Il donne le cadre auquel ces documents doivent rester alignÃ©s.

---

# 2. Principes dâ€™organisation

La documentation doit respecter les rÃ¨gles suivantes :

1. Un sujet stratÃ©gique ne possÃ¨de quâ€™un document de rÃ©fÃ©rence.
2. Les documents courts sont prÃ©fÃ©rÃ©s aux documents volumineux.
3. Chaque document prÃ©cise son statut.
4. Les dÃ©cisions actÃ©es sont distinguÃ©es des hypothÃ¨ses.
5. Les questions ouvertes sont conservÃ©es jusquâ€™Ã  arbitrage.
6. Les documents techniques sont sÃ©parÃ©s des documents mÃ©tier.
7. Les anciens documents remplacÃ©s sont archivÃ©s, pas supprimÃ©s sans trace.
8. Les noms de fichiers restent stables dans le temps.
9. Les numÃ©ros indiquent lâ€™ordre logique de lecture, pas la prioritÃ©.
10. Le Handbook doit rester comprÃ©hensible par une personne extÃ©rieure Ã  PGYS.

---

# 3. Arborescence officielle

```text
docs/
â”‚
â”œâ”€â”€ README.md
â”‚
â”œâ”€â”€ 00-entreprise/
â”‚   â”œâ”€â”€ 00-vision.md
â”‚   â”œâ”€â”€ 01-manifeste.md
â”‚   â”œâ”€â”€ 02-mission.md
â”‚   â”œâ”€â”€ 03-valeurs-et-principes.md
â”‚   â”œâ”€â”€ 04-positionnement-entreprise.md
â”‚   â”œâ”€â”€ 05-non-objectifs.md
â”‚   â””â”€â”€ 06-glossaire-strategique.md
â”‚
â”œâ”€â”€ 01-ecosysteme/
â”‚   â”œâ”€â”€ 00-schema-directeur.md
â”‚   â”œâ”€â”€ 01-domaines-pgys.md
â”‚   â”œâ”€â”€ 02-logiciels-services-accompagnement.md
â”‚   â”œâ”€â”€ 03-partenaires.md
â”‚   â”œâ”€â”€ 04-construire-ou-integrer.md
â”‚   â””â”€â”€ 05-saas-verticaux.md
â”‚
â”œâ”€â”€ 02-produit/
â”‚   â”œâ”€â”€ 00-vision-produit.md
â”‚   â”œâ”€â”€ 01-principes-produit.md
â”‚   â”œâ”€â”€ 02-coeur-commun.md
â”‚   â”œâ”€â”€ 03-classification-des-besoins.md
â”‚   â”œâ”€â”€ 04-offre-initiale.md
â”‚   â”œâ”€â”€ 05-pgys-services.md
â”‚   â”œâ”€â”€ 06-pilotes-et-validation.md
â”‚   â””â”€â”€ 07-roadmap-produit.md
â”‚
â”œâ”€â”€ 03-marche/
â”‚   â”œâ”€â”€ 00-positionnement-initial.md
â”‚   â”œâ”€â”€ 01-client-ideal.md
â”‚   â”œâ”€â”€ 02-segments-prioritaires.md
â”‚   â”œâ”€â”€ 03-problemes-resolus.md
â”‚   â”œâ”€â”€ 04-differenciation.md
â”‚   â””â”€â”€ 05-validation-marche.md
â”‚
â”œâ”€â”€ 04-business/
â”‚   â”œâ”€â”€ 00-modele-economique.md
â”‚   â”œâ”€â”€ 01-offres-et-abonnements.md
â”‚   â”œâ”€â”€ 02-mise-en-route.md
â”‚   â”œâ”€â”€ 03-services-complementaires.md
â”‚   â”œâ”€â”€ 04-regles-de-pricing.md
â”‚   â””â”€â”€ 05-indicateurs-economiques.md
â”‚
â”œâ”€â”€ 05-roadmap/
â”‚   â”œâ”€â”€ 00-roadmap-strategique-18-mois.md
â”‚   â”œâ”€â”€ 01-jalons.md
â”‚   â”œâ”€â”€ 02-tableau-de-pilotage.md
â”‚   â”œâ”€â”€ 03-revue-mensuelle.md
â”‚   â””â”€â”€ 04-risques-strategiques.md
â”‚
â”œâ”€â”€ 06-clients-pilotes/
â”‚   â”œâ”€â”€ 00-methode-de-suivi.md
â”‚   â”œâ”€â”€ 01-analyse-comparative.md
â”‚   â”œâ”€â”€ 02-centrale-achat.md
â”‚   â”œâ”€â”€ 03-entreprise-artisanale.md
â”‚   â”œâ”€â”€ 04-salon-coiffure.md
â”‚   â””â”€â”€ 05-matrice-des-besoins.md
â”‚
â”œâ”€â”€ 07-gouvernance/
â”‚   â”œâ”€â”€ 00-regles-de-decision.md
â”‚   â”œâ”€â”€ 01-journal-des-decisions.md
â”‚   â”œâ”€â”€ 02-gestion-des-demandes.md
â”‚   â”œâ”€â”€ 03-criteres-de-priorisation.md
â”‚   â”œâ”€â”€ 04-politique-de-personnalisation.md
â”‚   â””â”€â”€ 05-gouvernance-du-handbook.md
â”‚
â”œâ”€â”€ 08-architecture/
â”‚   â”œâ”€â”€ README.md
â”‚   â””â”€â”€ adr/
â”‚       â”œâ”€â”€ ADR-001-...
â”‚       â”œâ”€â”€ ADR-002-...
â”‚       â””â”€â”€ ...
â”‚
â”œâ”€â”€ 09-execution/
â”‚   â”œâ”€â”€ README.md
â”‚   â”œâ”€â”€ backlog/
â”‚   â”œâ”€â”€ tickets/
â”‚   â””â”€â”€ plans-de-livraison/
â”‚
â””â”€â”€ archive/
    â”œâ”€â”€ documents-remplaces/
    â””â”€â”€ anciennes-versions/
```

---

# 4. Fonction de chaque section

## `00-entreprise`

Cette section dÃ©finit lâ€™identitÃ© de PGYS.

Elle rÃ©pond aux questions :

* Pourquoi PGYS existe-t-il ?
* Que dÃ©fend lâ€™entreprise ?
* Quelle ambition poursuit-elle ?
* Quelles dÃ©cisions sont incompatibles avec sa philosophie ?

Ces documents doivent rester relativement stables.

---

## `01-ecosysteme`

Cette section reprÃ©sente la vision globale de PGYS Ã  long terme.

Elle dÃ©crit :

* les huit domaines de la vie dâ€™une entreprise ;
* la combinaison logiciels, services et accompagnement ;
* la place des partenaires ;
* les futures verticales ;
* les frontiÃ¨res de lâ€™Ã©cosystÃ¨me.

Cette section dÃ©crit la destination, pas le MVP immÃ©diat.

---

## `02-produit`

Cette section dÃ©finit ce que PGYS construit.

Elle dÃ©crit :

* le cÅ“ur produit ;
* les capacitÃ©s communes ;
* les verticales ;
* lâ€™offre initiale ;
* les rÃ¨gles de conception produit ;
* la classification des besoins clients.

Elle sert de rÃ©fÃ©rence aux conversations Produit, Architecture et Codex.

---

## `03-marche`

Cette section dÃ©finit pour qui PGYS construit et pourquoi ces clients doivent acheter.

Elle dÃ©crit :

* le client idÃ©al ;
* les premiers segments ;
* les problÃ¨mes prioritaires ;
* la proposition de valeur ;
* la diffÃ©renciation ;
* les preuves attendues avant une expansion.

---

## `04-business`

Cette section dÃ©finit comment PGYS gagne de lâ€™argent.

Elle dÃ©crit :

* les abonnements ;
* les services de mise en route ;
* les options ;
* le pricing ;
* les marges ;
* les rÃ¨gles de remise ;
* les indicateurs Ã©conomiques.

---

## `05-roadmap`

Cette section organise la trajectoire.

Elle dÃ©crit :

* les phases ;
* les jalons ;
* les conditions de passage ;
* le suivi mensuel ;
* les risques ;
* les dÃ©cisions de poursuite, recentrage ou arrÃªt.

---

## `06-clients-pilotes`

Cette section conserve la connaissance issue du terrain.

Elle contient :

* les processus observÃ©s ;
* les besoins ;
* les usages rÃ©els ;
* les demandes ;
* les dÃ©cisions de gÃ©nÃ©ralisation ;
* les rÃ©sultats obtenus.

Les documents clients ne doivent contenir que les informations nÃ©cessaires Ã  lâ€™amÃ©lioration du produit.

---

## `07-gouvernance`

Cette section dÃ©finit comment PGYS prend ses dÃ©cisions.

Elle protÃ¨ge le produit contre :

* le dÃ©veloppement spÃ©cifique ;
* les changements de prioritÃ© permanents ;
* les dÃ©cisions non documentÃ©es ;
* les demandes urgentes non alignÃ©es ;
* la perte de cohÃ©rence.

---

## `08-architecture`

Cette section contient exclusivement les dÃ©cisions techniques structurantes.

Elle ne doit pas mÃ©langer :

* vision dâ€™entreprise ;
* besoins mÃ©tier ;
* implÃ©mentation technique.

Les dÃ©cisions importantes doivent Ãªtre consignÃ©es sous forme dâ€™ADR.

---

## `09-execution`

Cette section contient les Ã©lÃ©ments temporaires dâ€™exÃ©cution :

* tickets ;
* plans ;
* backlog ;
* lots ;
* prÃ©parations Codex.

Ces documents peuvent Ã©voluer rapidement.

Ils ne doivent jamais remplacer les documents stratÃ©giques stables.

---

# 5. Classement des documents dÃ©jÃ  rÃ©digÃ©s

Les documents produits jusquâ€™Ã  prÃ©sent doivent Ãªtre rÃ©partis ainsi.

| Document actuel                          | Destination officielle                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| PGYS â€” Vision                            | `00-entreprise/00-vision.md`                                                                  |
| PGYS â€” Manifeste                         | `00-entreprise/01-manifeste.md`                                                               |
| SchÃ©ma directeur de lâ€™Ã©cosystÃ¨me         | `01-ecosysteme/00-schema-directeur.md`                                                        |
| Positionnement initial et premiÃ¨re offre | Ã€ scinder entre `03-marche/00-positionnement-initial.md` et `02-produit/04-offre-initiale.md` |
| Offre initiale                           | `02-produit/04-offre-initiale.md`                                                             |
| Analyse comparative des clients pilotes  | `06-clients-pilotes/01-analyse-comparative.md`                                                |
| PGYS Services                            | `02-produit/05-pgys-services.md`                                                              |
| ModÃ¨le Ã©conomique initial                | `04-business/00-modele-economique.md`                                                         |
| Roadmap stratÃ©gique sur 18 mois          | `05-roadmap/00-roadmap-strategique-18-mois.md`                                                |
| Tableau de pilotage stratÃ©gique          | `05-roadmap/02-tableau-de-pilotage.md`                                                        |

---

# 6. Documents Ã  fusionner ou scinder

Certains documents contiennent plusieurs sujets.

Ils ne doivent pas Ãªtre conservÃ©s tels quels si cela crÃ©e des doublons.

## Positionnement initial et premiÃ¨re offre

Ce document doit Ãªtre sÃ©parÃ© en deux.

### Partie marchÃ©

Ã€ dÃ©placer vers :

`03-marche/00-positionnement-initial.md`

Contenu :

* cible ;
* problÃ¨me ;
* transformation ;
* positionnement ;
* promesse ;
* diffÃ©renciation ;
* critÃ¨res de validation.

### Partie produit

Ã€ dÃ©placer vers :

`02-produit/04-offre-initiale.md`

Contenu :

* pÃ©rimÃ¨tre ;
* fonctions ;
* options ;
* exclusions ;
* services ;
* critÃ¨res de commercialisation.

---

## ModÃ¨le Ã©conomique initial

Ce document pourra ultÃ©rieurement Ãªtre rÃ©parti entre :

* `04-business/00-modele-economique.md` ;
* `04-business/01-offres-et-abonnements.md` ;
* `04-business/02-mise-en-route.md` ;
* `04-business/04-regles-de-pricing.md`.

Pour lâ€™instant, il peut rester dans un seul fichier afin dâ€™Ã©viter une fragmentation prÃ©maturÃ©e.

---

## SchÃ©ma directeur

Le document peut rester complet dans :

`01-ecosysteme/00-schema-directeur.md`

Les autres fichiers de la section seront crÃ©Ã©s uniquement lorsque le contenu deviendra suffisamment volumineux.

---

# 7. Documents Ã  crÃ©er en prioritÃ©

La documentation actuelle est dÃ©jÃ  suffisante pour poursuivre.

Les prochains documents prioritaires sont :

## PrioritÃ© 1 â€” Mission

Fichier :

`00-entreprise/02-mission.md`

Objectif :

dÃ©finir ce que PGYS fait concrÃ¨tement chaque jour pour rÃ©aliser sa vision.

---

## PrioritÃ© 2 â€” Valeurs et principes

Fichier :

`00-entreprise/03-valeurs-et-principes.md`

Objectif :

dÃ©finir les rÃ¨gles culturelles et dÃ©cisionnelles durables.

---

## PrioritÃ© 3 â€” Non-objectifs

Fichier :

`00-entreprise/05-non-objectifs.md`

Objectif :

protÃ©ger PGYS contre les sujets attractifs mais destructeurs de focus.

---

## PrioritÃ© 4 â€” CÅ“ur commun

Fichier :

`02-produit/02-coeur-commun.md`

Objectif :

formaliser le noyau partagÃ© entre PGYS Services, la centrale dâ€™achat et les futures verticales.

---

## PrioritÃ© 5 â€” Classification des besoins

Fichier :

`02-produit/03-classification-des-besoins.md`

Objectif :

dÃ©finir prÃ©cisÃ©ment les catÃ©gories :

* cÅ“ur ;
* configuration ;
* verticale ;
* prestation ;
* spÃ©cifique ;
* refus.

---

## PrioritÃ© 6 â€” Journal des dÃ©cisions

Fichier :

`07-gouvernance/01-journal-des-decisions.md`

Objectif :

conserver les dÃ©cisions stratÃ©giques prises depuis le dÃ©but du projet.

---

# 8. Statut standard des documents

Chaque document doit commencer par un en-tÃªte minimal.

```markdown
# Titre du document

**Version :** 1.0  
**Statut :** Brouillon / Ã€ valider / ValidÃ© / RemplacÃ©  
**PropriÃ©taire :** Direction / Produit / Architecture / Business  
**DerniÃ¨re mise Ã  jour :** AAAA-MM-JJ  
**Document remplacÃ© :** Aucun
```

---

# 9. Structure standard recommandÃ©e

Tous les documents ne doivent pas Ãªtre forcÃ©s dans un modÃ¨le identique.

Cependant, les sections suivantes sont recommandÃ©es :

```markdown
# 1. Objet

# 2. Contexte

# 3. Principes ou contenu principal

# 4. DÃ©cisions actÃ©es

# 5. Questions ouvertes

# 6. Impacts

# 7. Documents liÃ©s
```

---

# 10. RÃ¨gles de validation

Un document peut Ãªtre marquÃ© **ValidÃ©** lorsque :

* son objectif est clair ;
* il ne contredit aucun document supÃ©rieur ;
* les dÃ©cisions importantes sont explicites ;
* les questions ouvertes sont identifiÃ©es ;
* les doublons ont Ã©tÃ© supprimÃ©s ;
* le document peut Ãªtre compris sans connaÃ®tre toute lâ€™histoire du projet ;
* la direction PGYS lâ€™a acceptÃ©.

Un document validÃ© peut Ãªtre modifiÃ©.

Toute modification majeure doit toutefois Ãªtre enregistrÃ©e dans le journal des dÃ©cisions.

---

# 11. HiÃ©rarchie des documents

En cas de contradiction, lâ€™ordre de prioritÃ© est :

1. Vision ;
2. Manifeste ;
3. Mission et principes ;
4. SchÃ©ma directeur de lâ€™Ã©cosystÃ¨me ;
5. Positionnement ;
6. Roadmap stratÃ©gique ;
7. Principes produit ;
8. Documents de verticale ;
9. Architecture ;
10. Tickets dâ€™exÃ©cution.

Un ticket ne peut pas remettre en question une dÃ©cision stratÃ©gique.

Une implÃ©mentation technique ne peut pas redÃ©finir silencieusement le produit.

---

# 12. Politique de doublons

Lorsquâ€™une information existe dans plusieurs documents :

* un seul document devient la source de rÃ©fÃ©rence ;
* les autres documents contiennent un lien ;
* les formulations contradictoires sont supprimÃ©es ;
* les anciens contenus sont archivÃ©s si nÃ©cessaire.

Exemple :

Le prix de PGYS Services ne doit pas Ãªtre dÃ©fini simultanÃ©ment dans :

* le document produit ;
* la roadmap ;
* le document business ;
* une fiche client.

Le document de rÃ©fÃ©rence doit Ãªtre celui de la section Business.

---

# 13. Documentation des clients

Les clients pilotes ne doivent pas apparaÃ®tre comme les propriÃ©taires du produit.

Chaque document client doit distinguer :

```text
Besoin observÃ©
â†’ Cause rÃ©elle
â†’ PortÃ©e
â†’ DÃ©cision produit
â†’ RÃ©sultat
```

La structure recommandÃ©e est :

```markdown
# Client

## ActivitÃ©

## Processus principal

## ProblÃ¨mes observÃ©s

## Fonctions utilisÃ©es

## Demandes reÃ§ues

## Classification des demandes

## DÃ©cisions produit

## RÃ©sultats mesurÃ©s

## Risques
```

---

# 14. Politique dâ€™archivage

Un document est archivÃ© lorsquâ€™il :

* est remplacÃ© ;
* nâ€™est plus applicable ;
* correspond Ã  une ancienne hypothÃ¨se ;
* contient une organisation abandonnÃ©e.

Il doit recevoir la mention :

```markdown
**Statut :** RemplacÃ©  
**RemplacÃ© par :** chemin/du/nouveau-document.md
```

Puis Ãªtre dÃ©placÃ© dans :

`archive/documents-remplaces/`

Lâ€™historique Git ne suffit pas toujours Ã  expliquer pourquoi une dÃ©cision a changÃ©.

---

# 15. README principal

Le fichier `docs/README.md` doit devenir lâ€™entrÃ©e unique du Handbook.

Il doit contenir :

* lâ€™objectif de la documentation ;
* les rÃ¨gles de lecture ;
* les grandes sections ;
* les documents prioritaires ;
* le statut des principaux documents ;
* un lien vers le journal des dÃ©cisions.

Exemple de navigation :

```markdown
# Handbook PGYS

## Commencer ici

1. [Vision](../00-entreprise/00-vision.md)
2. [Manifeste](../00-entreprise/01-manifeste.md)
3. [SchÃ©ma directeur](../01-ecosysteme/00-schema-directeur.md)
4. [Positionnement initial](../03-marche/00-positionnement-initial.md)
5. [Roadmap 18 mois](../05-roadmap/00-roadmap-strategique-18-mois.md)

## Produit actuel

- [Offre initiale](../02-produit/04-offre-initiale.md)
- [PGYS Services](../02-produit/05-pgys-services.md)
- [Clients pilotes](../06-clients-pilotes/01-analyse-comparative.md)

## Pilotage

- [ModÃ¨le Ã©conomique](../04-business/00-modele-economique.md)
- [Tableau de pilotage](../05-roadmap/02-tableau-de-pilotage.md)
- [Journal des dÃ©cisions](../07-gouvernance/01-journal-des-decisions.md)
```

---

# 16. Ordre recommandÃ© de lecture

Pour comprendre PGYS, un nouveau collaborateur doit lire :

1. Vision ;
2. Manifeste ;
3. Mission ;
4. SchÃ©ma directeur ;
5. Positionnement initial ;
6. Offre initiale ;
7. PGYS Services ;
8. Roadmap ;
9. ModÃ¨le Ã©conomique ;
10. Principes produit ;
11. Architecture pertinente pour son rÃ´le.

---

# 17. Ce qui ne doit pas entrer dans le Handbook

Le Handbook ne doit pas contenir directement :

* des mots de passe ;
* des secrets ;
* des donnÃ©es personnelles inutiles ;
* des informations confidentielles de clients ;
* des dÃ©tails techniques temporaires ;
* des logs ;
* des comptes rendus de debugging ;
* des tickets terminÃ©s ;
* des extraits de conversations non synthÃ©tisÃ©s ;
* des idÃ©es non arbitrÃ©es prÃ©sentÃ©es comme dÃ©cisions.

---

# 18. Gouvernance du Handbook

La direction PGYS reste responsable de la validation finale.

Les rÃ´les sont les suivants :

## Vision & Roadmap

Responsable de :

* la vision ;
* le positionnement ;
* la roadmap ;
* les arbitrages stratÃ©giques.

## Produit

Responsable de :

* lâ€™offre ;
* les verticales ;
* les besoins ;
* les parcours ;
* les rÃ¨gles fonctionnelles.

## Architecture

Responsable de :

* lâ€™architecture ;
* les ADR ;
* les contraintes techniques ;
* la sÃ©curitÃ© ;
* la scalabilitÃ©.

## Business

Responsable de :

* lâ€™offre commerciale ;
* le pricing ;
* les marges ;
* les indicateurs Ã©conomiques.

## Clients pilotes

Responsable de :

* collecter les faits ;
* mesurer les usages ;
* classer les retours ;
* vÃ©rifier les rÃ©sultats.

Une mÃªme personne peut assumer tous ces rÃ´les au dÃ©marrage, mais les documents doivent rester sÃ©parÃ©s par responsabilitÃ©.

---

# 19. DÃ©cisions actÃ©es

* Le Handbook sera conservÃ© dans le dossier `docs`.
* La documentation sera organisÃ©e par domaine.
* La vision et les dÃ©cisions stratÃ©giques seront sÃ©parÃ©es de lâ€™exÃ©cution.
* Les clients pilotes disposeront dâ€™une section dÃ©diÃ©e.
* Les dÃ©cisions techniques seront conservÃ©es sous forme dâ€™ADR.
* Les documents dÃ©jÃ  rÃ©digÃ©s seront rÃ©utilisÃ©s et non recommencÃ©s.
* Le document de positionnement sera scindÃ© entre marchÃ© et produit.
* Le README constituera lâ€™entrÃ©e unique du Handbook.
* Les doublons seront remplacÃ©s par des liens vers une source de rÃ©fÃ©rence.
* Les anciennes versions importantes seront archivÃ©es.
* Les prochains documents prioritaires seront Mission, Principes, Non-objectifs, CÅ“ur commun et Journal des dÃ©cisions.

---

# 20. Prochaine action recommandÃ©e

La prochaine action nâ€™est pas de rÃ©diger un nouveau document stratÃ©gique.

Elle consiste Ã  :

1. crÃ©er cette arborescence dans le dÃ©pÃ´t ;
2. dÃ©placer les documents existants ;
3. renommer les fichiers ;
4. crÃ©er le README principal ;
5. vÃ©rifier les doublons ;
6. enregistrer cette organisation dans Git.

Une fois cette structure mise en place, la rÃ©daction pourra reprendre avec le document :

> **PGYS â€” Mission**

