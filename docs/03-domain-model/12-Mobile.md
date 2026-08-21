# Strategie Mobile

## 1. Objectif

PGYS doit proposer des parcours adaptes au terrain sans creer un second coeur
metier ni lancer prematurement une application mobile complete distincte.

Le canal mobile est une Application au sens de la Platform Map. Il compose les
contrats publics de la Platform et des Business Modules ; il ne porte ni regle
metier propre, ni acces Prisma, ni duplication de donnees de reference.

## 2. Decision V1

La V1 adopte une approche **web mobile et PWA d'abord** :

- interfaces responsives et tactiles servies par l'architecture web PGYS ;
- installation PWA possible lorsque le parcours PGYS-075 le justifie ;
- meme API versionnee, memes regles d'autorisation et memes sources de verite
  que les applications web ;
- aucun projet iOS ou Android natif dans PGYS-074 ;
- aucune application mobile complete distincte pendant la phase de validation
  des pilotes.

Une application native ne pourra etre decidee qu'apres mesure d'un besoin que
le web mobile ne satisfait pas : usage intensif hors ligne, integration
materielle, execution en arriere-plan, notifications critiques ou contraintes
de distribution.

## 3. Principes d'architecture

### 3.1. Workspace first

Tout parcours mobile est rattache a un Workspace selectionne et autorise. Les
roles et permissions du Workspace restent la seule source d'autorisation pour
les usages clients.

Les roles Platform des operateurs internes ne sont jamais reutilises par une
experience mobile cliente.

### 3.2. API first

Le mobile consomme exclusivement les contrats publics `/api/v1`. Il ne lit
jamais la base de donnees directement et ne reimplemente pas les transitions
des modules Workspace, CRM, Sales ou Inventory.

Les DTO, validations, erreurs, recherches et paginations restent identiques
quel que soit le canal. Une adaptation de presentation ne doit pas devenir un
contrat metier concurrent.

### 3.3. Securite

- l'authentification reutilise les mecanismes PGYS existants ;
- aucun jeton n'est stocke dans `localStorage` ;
- le web privilegie des cookies securises et `httpOnly` ;
- un futur client natif utiliserait uniquement le stockage securise du systeme
  d'exploitation ;
- les donnees sensibles ne sont pas conservees hors ligne par defaut ;
- la revocation de session et la desactivation d'un membre doivent prendre
  effet sans mecanisme mobile parallele.

### 3.4. Connectivite et hors ligne

PGYS-074 n'introduit aucune synchronisation hors ligne de donnees metier.

La PWA peut mettre en cache ses ressources statiques, mais toute ecriture
metier V1 exige une confirmation du serveur. Une file locale d'operations, la
resolution de conflits et la synchronisation en arriere-plan necessiteraient
un ticket et un modele d'idempotence dedies.

L'interface doit distinguer clairement :

- chargement en cours ;
- absence de connectivite ;
- echec serveur ;
- operation confirmee par le serveur.

## 4. Experience mobile de reference

Les parcours suivent les contraintes suivantes :

- navigation courte, utilisable a une main lorsque possible ;
- zones tactiles d'au moins 44 pixels ;
- formulaires limites aux informations necessaires sur le terrain ;
- recherche et selection avant les longues listes ;
- etats de chargement, vide et erreur explicites ;
- aucune action destructive implicite ;
- accessibilite clavier, lecteur d'ecran, contraste et zoom preservee ;
- fonctionnement de reference a partir de 360 pixels de large.

Les ecrans bureau existants ne doivent pas seulement etre reduits : chaque
ticket mobile selectionne un parcours court et mesurable.

## 5. Sequencement des tickets Mobile

### PGYS-075 — Mobile Workspace Access

Ce ticket doit valider le socle transversal :

- authentification et fin de session ;
- selection d'un Workspace autorise ;
- restitution de l'identite et du contexte Workspace ;
- navigation mobile partagee ;
- gestion des etats reseau et des erreurs d'autorisation ;
- installation PWA seulement si elle apporte une valeur au parcours pilote.

Il ne cree ni role mobile, ni administration Platform, ni nouveau modele
Workspace.

### PGYS-076 — Mobile CRM Companion

Ce ticket doit composer les contrats CRM et Business Partners existants pour
des usages terrain courts. Son perimetre fonctionnel exact doit etre confirme
depuis les observations pilotes avant implementation.

Il ne doit dupliquer ni BusinessPartner, ni BusinessPartnerContact, ni
Opportunity, ni Activity. L'automatisation, la messagerie et le calendrier
externe restent hors perimetre tant qu'un ticket ne les definit pas.

### PGYS-077 — Mobile POS Exploration

Ce ticket est une exploration et non l'engagement de livrer une caisse mobile.
Il doit evaluer :

- vitesse de saisie tactile ;
- lisibilite du catalogue et du panier ;
- contraintes des paiements et peripheriques ;
- besoin reel de fonctionnement hors ligne ;
- coherence avec les contrats Sales, Catalog et Inventory existants.

Sa sortie attendue est une recommandation `GO`, `ADAPTER` ou `STOP`, avec les
risques et prerequis. Aucun moteur POS concurrent ne doit etre cree pendant
l'exploration.

## 6. Criteres de passage vers du natif

Une application native ne sera envisagee que si au moins un parcours pilote
demontre un besoin recurrent et mesurable non couvert par la PWA, et si :

- le contrat API concerne est stable ;
- le modele d'autorisation est complet ;
- les exigences hors ligne et de conflits sont documentees ;
- les integrations appareil necessaires sont identifiees ;
- le cout de maintenance iOS et Android est accepte ;
- les objectifs d'usage et de qualite sont mesurables.

Le choix technique natif, hybride ou PWA evoluee fera alors l'objet d'un ADR.

## 7. Exclusions PGYS-074

- creation d'une application mobile ;
- nouveau modele Prisma ou migration ;
- nouvelles routes metier ;
- synchronisation hors ligne ;
- notifications push ;
- geolocalisation, camera, signature ou biometrie ;
- paiement mobile et integration de terminal ;
- publication App Store ou Google Play ;
- implementation anticipee de PGYS-075, PGYS-076 ou PGYS-077.

PGYS-074 fixe uniquement la frontiere, les principes et les criteres de
decision du canal mobile PGYS.
