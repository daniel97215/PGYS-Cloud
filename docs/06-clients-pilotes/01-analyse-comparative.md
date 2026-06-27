# PGYS — Analyse comparative des clients pilotes et choix de la verticale initiale

**Version :** 1.0
**Statut :** Brouillon stratégique à valider
**Date de référence :** Juin 2026
**Nature du document :** Analyse produit et décision de positionnement

---

# 1. Objet du document

Ce document analyse les deux premiers clients pilotes de PGYS afin de déterminer :

* le noyau fonctionnel réellement commun ;
* les différences entre leurs activités ;
* les capacités pouvant être configurées ;
* les fonctionnalités relevant d’une verticale spécialisée ;
* les risques de développement spécifique ;
* le client de référence pour le premier produit commercialisable ;
* la stratégie à suivre pour accueillir les futurs profils clients.

L’objectif n’est pas de fusionner artificiellement les deux logiciels existants.

L’objectif est d’identifier les composants génériques permettant de construire plusieurs offres cohérentes sur un socle commun.

---

# 2. Synthèse des clients pilotes

## 2.1. Client pilote 1 — Centrale d’achat

### Profil

* **Activité :** centrale d’achat ;
* **Utilisateurs prévus :** 3 ;
* **Produits vendus :** marchandises ;
* **Outils précédents :** EBP, Excel et cahiers ;
* **Ancienneté d’utilisation du logiciel PGYS :** plus d’un an.

### Flux métier principal

```text
Achat ou réception de marchandises
            ↓
Gestion du stock ou des quantités reçues
            ↓
Envoi ou livraison au client
            ↓
Confirmation des quantités réellement reçues
            ↓
Facturation du client
            ↓
Calcul du montant dû au producteur
            ↓
Déduction de la commission
            ↓
Facturation ou règlement du producteur
            ↓
Règlements et export comptable
```

### Particularité fondamentale

La centrale d’achat intervient entre deux parties :

* le producteur qui fournit la marchandise ;
* le client qui reçoit et paie la marchandise.

Une même opération commerciale génère donc plusieurs flux financiers liés :

* une créance sur le client ;
* une dette envers le producteur ;
* une commission conservée par la centrale ;
* éventuellement des écarts de quantité, retours et avoirs.

Ce fonctionnement ne correspond pas à une gestion commerciale classique.

Il se rapproche d’un modèle d’intermédiation, de commissionnement ou de gestion pour compte de tiers.

---

## 2.2. Client pilote 2 — Entreprise artisanale

### Profil

* **Activité :** artisanat ;
* **Utilisateurs prévus :** 5 ;
* **Éléments vendus :** articles, services, interventions et production ;
* **Outil précédent :** EBP ;
* **Utilisation du logiciel PGYS :** depuis décembre 2025.

### Flux métier principal

```text
Sélection ou création du client
            ↓
Saisie d’une commande
            ↓
Ajout d’articles, prestations ou opérations
            ↓
Réalisation de la commande
            ↓
Facturation
            ↓
Saisie d’un ou plusieurs règlements
            ↓
Contrôle des ventes de la journée
```

### Particularité fondamentale

L’utilisateur travaille depuis un écran tactile de saisie rapide, proche d’un terminal de point de vente.

Cet écran doit permettre, dans un même parcours :

* de sélectionner le client ;
* de choisir une famille de produits ;
* de sélectionner un article ;
* d’ajouter des commentaires ou des opérations ;
* d’adapter le prix lorsque cela est autorisé ;
* de saisir une remise ;
* de définir une quantité ;
* de visualiser le ticket ou la pièce en cours.

Le processus est centré sur la rapidité de saisie et le suivi de la commande jusqu’à sa réalisation et son paiement.

---

# 3. Noyau fonctionnel commun

Malgré leurs différences, les deux clients utilisent un ensemble important de capacités communes.

## 3.1. Référentiel des tiers

Les deux produits nécessitent :

* des clients ;
* des fournisseurs ou producteurs ;
* des contacts ;
* des adresses ;
* des informations administratives ;
* un historique des opérations.

La notion générique à retenir est celle de **tiers**.

Un tiers peut remplir un ou plusieurs rôles :

* prospect ;
* client ;
* fournisseur ;
* producteur ;
* partenaire ;
* intermédiaire.

Cette modélisation évite de créer des fichiers indépendants et redondants.

---

## 3.2. Catalogue

Les deux clients ont besoin d’un catalogue regroupant :

* des articles ;
* des produits ;
* des prestations ;
* des opérations ;
* des familles ;
* des unités ;
* des prix ;
* des taxes ;
* des règles de modification du prix ;
* un statut actif ou archivé.

Le catalogue doit pouvoir représenter aussi bien :

* une marchandise ;
* une prestation ;
* un article transformé ;
* une opération à effectuer ;
* un élément stocké ou non stocké.

---

## 3.3. Pièces commerciales

Les deux applications reposent sur des pièces représentant une opération commerciale.

Exemples :

* commande ;
* bon de réception ;
* bon de livraison ;
* brouillon de facture ;
* facture ;
* avoir.

Le noyau PGYS doit donc gérer une structure générique de pièce comprenant :

* un type ;
* un numéro ;
* une date ;
* un tiers principal ;
* des lignes ;
* des quantités ;
* des prix ;
* des remises ;
* des taxes ;
* un statut ;
* des commentaires ;
* des liens vers d’autres pièces.

Une pièce doit pouvoir être transformée ou reliée à une autre sans ressaisie complète.

---

## 3.4. Facturation

Les deux clients nécessitent :

* la préparation d’une facture ;
* la génération depuis une pièce existante ;
* les factures en brouillon ;
* les factures validées ;
* les avoirs ;
* le suivi des montants ;
* l’historique.

La notion de « facture brouillon » du client 1 n’est pas réellement spécifique.

Elle révèle un besoin générique :

> Une opération doit pouvoir être préparée, contrôlée, corrigée, puis transformée en document comptable définitif.

Cette capacité doit donc appartenir au cœur du produit.

En revanche, la création simultanée d’une facture client et d’un montant dû à un producteur relève du module spécialisé de la centrale d’achat.

---

## 3.5. Règlements

Les deux clients ont besoin de gérer :

* plusieurs règlements pour une même facture ;
* différents moyens de paiement ;
* les paiements partiels ;
* le reste à payer ;
* les dates ;
* les références ;
* l’historique ;
* les règlements entrants et sortants.

Le moteur de règlement doit être générique.

Il doit pouvoir couvrir :

* le règlement d’une facture client ;
* le paiement d’un fournisseur ;
* le paiement d’un producteur ;
* plusieurs paiements sur une pièce ;
* un paiement associé à plusieurs pièces lorsque nécessaire.

---

## 3.6. Pilotage quotidien

Les deux clients ont besoin d’une vision opérationnelle :

* opérations du jour ;
* ventes ;
* factures ;
* règlements ;
* éléments en attente ;
* anomalies ;
* échéances.

Le récapitulatif quotidien du client 2 peut devenir une capacité générique de clôture ou de synthèse de journée.

---

## 3.7. Sauvegarde et continuité

Les deux clients ont exprimé un besoin fort de sauvegarde.

Cependant, il faut distinguer :

* le besoin métier : ne pas perdre les données et pouvoir reprendre l’activité ;
* la solution historique : copier une sauvegarde sur un serveur à la fermeture, puis la récupérer au démarrage.

La stratégie de sauvegarde actuelle ne doit pas devenir une fonctionnalité métier du produit.

Le besoin générique est :

> Les données doivent être sécurisées, synchronisées et récupérables sans intervention complexe de l’utilisateur.

Le mécanisme exact devra être défini séparément par l’architecture.

---

# 4. Matrice comparative

| Domaine                | Client 1 : centrale d’achat        | Client 2 : artisan             | Décision produit                 |
| ---------------------- | ---------------------------------- | ------------------------------ | -------------------------------- |
| Tiers                  | Clients, producteurs, fournisseurs | Clients, fournisseurs          | Cœur commun                      |
| Catalogue              | Produits et marchandises           | Articles, services, opérations | Cœur commun                      |
| Commandes              | Flux d’achat et de vente           | Commandes clients              | Cœur commun configurable         |
| Réception              | Fonction essentielle               | Peu ou pas prioritaire         | Module stock/logistique          |
| Livraison              | Fonction essentielle               | Selon activité                 | Module opérationnel              |
| Facturation client     | Oui                                | Oui                            | Cœur commun                      |
| Facturation producteur | Oui, avec commission               | Non                            | Verticale centrale d’achat       |
| Règlements entrants    | Oui                                | Oui                            | Cœur commun                      |
| Règlements sortants    | Producteurs et fournisseurs        | Selon besoin                   | Extension achats                 |
| Stock                  | Central                            | Potentiellement limité         | Module commun optionnel          |
| Retours et écarts      | Confirmation client essentielle    | Retours classiques possibles   | Base commune + règles verticales |
| Avoirs                 | Oui                                | À prévoir                      | Cœur commun                      |
| Écran tactile          | Non prioritaire                    | Central                        | Expérience verticale artisan     |
| Prix modifiable        | Selon règles                       | Oui                            | Paramétrage catalogue            |
| Détails par ligne      | Oui potentiellement                | Oui                            | Cœur commun                      |
| Vente quotidienne      | Oui                                | Oui, récapitulatif dédié       | Cœur commun                      |
| Export comptable       | Essentiel                          | Probable à terme               | Capacité transverse              |
| Mode déconnecté        | Synchronisation historique         | Sauvegarde quotidienne         | Besoin transverse à requalifier  |

---

# 5. Ce qui peut être mutualisé

Le premier cœur de gestion PGYS peut raisonnablement mutualiser les éléments suivants :

## Référentiels

* entreprises ;
* établissements ;
* utilisateurs ;
* tiers ;
* contacts ;
* articles ;
* services ;
* familles ;
* taxes ;
* moyens de paiement.

## Documents et pièces

* modèles de pièces ;
* numérotation ;
* statuts ;
* lignes de pièces ;
* transformations ;
* documents générés ;
* pièces jointes ;
* commentaires.

## Cycle commercial

* commande ;
* livraison ou réalisation ;
* facture ;
* avoir ;
* règlement ;
* suivi du solde.

## Pilotage

* ventes du jour ;
* factures à produire ;
* sommes dues ;
* sommes encaissées ;
* opérations en attente ;
* historique.

## Capacités transversales

* droits ;
* traçabilité ;
* export ;
* sauvegarde ;
* synchronisation ;
* configuration.

---

# 6. Ce qui doit être configurable

Les différences suivantes ne doivent pas créer des produits séparés.

## 6.1. Terminologie

Selon l’activité, une même notion peut être appelée :

* commande ;
* dossier ;
* chantier ;
* mission ;
* intervention ;
* ticket.

Le produit peut présenter un vocabulaire adapté sans modifier son modèle central.

## 6.2. Types de tiers

Les rôles suivants doivent être configurables :

* client ;
* fournisseur ;
* producteur ;
* apporteur ;
* partenaire.

## 6.3. Types de pièces

Les entreprises peuvent activer uniquement les pièces utiles :

* commande ;
* réception ;
* livraison ;
* intervention ;
* facture préparatoire ;
* facture ;
* avoir.

## 6.4. Statuts et parcours

Les statuts peuvent varier dans des limites contrôlées.

Exemple pour une commande artisanale :

```text
Brouillon
→ En attente
→ À réaliser
→ En cours
→ Terminée
→ Facturée
→ Payée
```

Exemple pour une centrale d’achat :

```text
Prévue
→ Réceptionnée
→ Expédiée
→ Confirmée par le client
→ Facturable
→ Facturée
→ Réglée
```

## 6.5. Règles tarifaires

Les paramètres peuvent déterminer :

* si le prix est modifiable ;
* si une remise est autorisée ;
* si un contrôle est requis ;
* quelles taxes s’appliquent ;
* qui peut modifier le prix.

## 6.6. Mode de saisie

Le même moteur peut proposer plusieurs interfaces :

* formulaire classique ;
* saisie rapide ;
* interface tactile ;
* saisie mobile.

L’interface tactile du client 2 doit être considérée comme une expérience spécialisée utilisant le cœur commun, et non comme un second moteur commercial.

---

# 7. Ce qui appartient à la verticale « Centrale d’achat »

Les fonctionnalités suivantes constituent un domaine spécialisé :

* association entre producteurs, produits, lots reçus et clients ;
* facturation du client à partir des quantités confirmées ;
* calcul du montant dû au producteur ;
* retenue d’une commission ;
* gestion des écarts entre quantité envoyée et quantité reçue ;
* retours spécifiques ;
* génération de plusieurs flux financiers depuis une même opération ;
* suivi des sommes dues aux producteurs ;
* export comptable adapté à ces flux.

Ce module pourrait être nommé à terme :

> **PGYS Centrale**, **PGYS Négoce** ou **PGYS Intermédiation**.

Avant de le commercialiser largement, il faudra vérifier que ces processus existent chez d’autres centrales, groupements, coopératives ou intermédiaires.

Le client 1 est une excellente source de règles métier, mais son processus ne doit pas définir seul un produit vertical complet.

---

# 8. Ce qui appartient à la verticale « Artisan »

Les fonctionnalités suivantes caractérisent une offre destinée aux artisans et petites entreprises opérationnelles :

* commande client ;
* saisie rapide ;
* écran tactile ;
* articles et prestations ;
* commentaires et opérations par ligne ;
* prix modifiable selon autorisation ;
* remises ;
* suivi de réalisation ;
* facturation ;
* règlements multiples ;
* synthèse quotidienne.

Cette verticale peut ensuite évoluer vers :

* planning ;
* interventions ;
* photos ;
* signature du client ;
* temps passé ;
* matières consommées ;
* devis ;
* suivi de chantier ;
* relances ;
* portail client.

Le nom de travail recommandé est :

> **PGYS Artisan**

ou, si la cible doit rester légèrement plus large :

> **PGYS Activité**

---

# 9. Évaluation stratégique des deux clients

## 9.1. Client 1 — Forces

* utilisation réelle depuis plus d’un an ;
* processus métier complexe déjà éprouvé ;
* profondeur fonctionnelle importante ;
* validation du stock, des réceptions et des règlements ;
* forte valeur métier ;
* remplacement effectif d’EBP, d’Excel et des cahiers.

## 9.2. Client 1 — Risques

* activité très particulière ;
* faible nombre d’utilisateurs ;
* règles de commission et de règlement spécifiques ;
* risque de confondre besoin d’un client et besoin d’un marché ;
* commercialisation probablement plus longue ;
* marché potentiel à mesurer.

## 9.3. Client 2 — Forces

* parcours plus simple à expliquer ;
* problème fréquent chez les artisans ;
* marché potentiel beaucoup plus large ;
* démonstration commerciale visuelle ;
* valeur immédiate de l’écran tactile ;
* cycle commande-facture-règlement facilement compréhensible ;
* potentiel d’ajout progressif du planning, des interventions et du stock.

## 9.4. Client 2 — Risques

* écran tactile potentiellement trop lié aux habitudes actuelles ;
* concurrence importante sur la facturation et les logiciels artisans ;
* risque de se positionner comme simple logiciel de caisse ou de facturation ;
* nécessité de démontrer la valeur du suivi opérationnel ;
* besoin d’identifier un sous-segment d’artisans plus précis.

---

# 10. Choix du client de référence

## Décision recommandée

> **Le client pilote 2 doit devenir la référence principale du premier produit commercialisable.**

Cette décision ne signifie pas que le client 1 est moins important.

Elle signifie que le cas du client 2 est :

* plus simple à expliquer ;
* plus facile à démontrer ;
* plus proche d’un besoin répandu ;
* plus rapide à standardiser ;
* moins dépendant de règles métier exceptionnelles ;
* plus adapté à une première acquisition commerciale.

Le client 1 conserve un rôle stratégique majeur :

> Il sert de validation avancée du socle de gestion commerciale, du stock, des flux multi-parties et de la capacité de PGYS à gérer des processus complexes.

---

# 11. Verticale initiale recommandée

## Positionnement provisoire

> **PGYS Artisan est une solution de gestion opérationnelle destinée aux artisans et petites entreprises qui doivent enregistrer des commandes, suivre leur réalisation, facturer rapidement et contrôler leurs règlements.**

## Promesse

> **De la commande au paiement, toute l’activité est suivie dans un seul environnement.**

## Différenciation

PGYS Artisan ne doit pas se présenter comme un simple logiciel de facturation.

Sa différenciation doit être :

* la saisie rapide adaptée au terrain ;
* le suivi de la commande jusqu’à sa réalisation ;
* l’unification des articles, services et opérations ;
* la facturation sans ressaisie ;
* les règlements multiples ;
* le pilotage quotidien ;
* l’évolution progressive vers le planning, les interventions et la production.

---

# 12. Noyau du premier produit vertical

Le premier produit commercialisable doit inclure :

## Obligatoire

* clients ;
* articles et prestations ;
* familles ;
* commande ;
* suivi de réalisation ;
* facture ;
* avoir ;
* règlements multiples ;
* commentaires par ligne ;
* prix modifiable selon autorisation ;
* remises ;
* aperçu et génération de la pièce ;
* synthèse quotidienne ;
* sauvegarde et sécurité des données.

## Fortement recommandé

* devis ;
* statuts de commande ;
* historique client ;
* recherche ;
* documents ;
* utilisateurs et rôles simples ;
* export comptable ;
* tableau de bord des commandes et paiements en attente.

## À intégrer ensuite

* planning ;
* intervention mobile ;
* signature ;
* stock ;
* achats ;
* production simple ;
* portail client ;
* relances.

---

# 13. Ce qui ne doit pas être mutualisé prématurément

Certaines différences doivent rester isolées jusqu’à validation auprès d’autres clients.

## Pour la centrale d’achat

* calcul précis des commissions ;
* facturation producteur ;
* confirmation des marchandises reçues par le client ;
* règles particulières de retour ;
* génération liée des pièces client et producteur.

## Pour l’artisan

* disposition exacte de l’écran tactile ;
* comportement particulier du ticket ;
* raccourcis propres aux habitudes du client ;
* organisation précise des boutons ;
* règles de clôture journalière spécifiques.

Ces fonctions peuvent être conservées dans les applications actuelles, mais elles ne doivent intégrer le produit générique qu’après analyse de leur réutilisabilité.

---

# 14. Stratégie concernant le mode déconnecté

Le fonctionnement actuel repose sur une sauvegarde transférée à la fermeture et récupérée au démarrage.

Ce mécanisme répond à un besoin historique, mais il présente plusieurs limites :

* risque de conflits ;
* absence de collaboration simultanée ;
* dépendance à la fermeture correcte du logiciel ;
* difficulté à identifier la version la plus récente ;
* risque d’écrasement ;
* expérience peu adaptée à un SaaS multi-utilisateur.

## Décision stratégique

PGYS doit conserver comme objectif :

* la continuité en cas de coupure ;
* la sauvegarde automatique ;
* la restauration ;
* la sécurité des données.

En revanche, le mécanisme actuel de copie de sauvegarde ne doit pas être présenté comme la cible définitive.

Le futur produit devra distinguer :

* le stockage central de référence ;
* les données locales nécessaires au fonctionnement temporaire ;
* la synchronisation contrôlée ;
* la gestion des conflits.

Les choix techniques seront traités dans la conversation Architecture.

---

# 15. Conséquences pour la plateforme PGYS

Les deux clients confirment que le cœur de la plateforme doit prendre en charge :

```text
Entreprise
    ↓
Utilisateurs
    ↓
Tiers
    ↓
Catalogue
    ↓
Pièces commerciales
    ↓
Exécution ou logistique
    ↓
Facturation
    ↓
Règlements
    ↓
Pilotage
```

Autour de ce cœur peuvent être ajoutés des modules verticaux :

```text
                    Cœur PGYS Gestion

             ┌────────────┴────────────┐
             │                         │
       PGYS Artisan             PGYS Centrale
             │                         │
  Saisie tactile                Réceptions
  Réalisation                   Expéditions
  Planning                      Producteurs
  Interventions                 Commissions
  Production simple             Flux multi-parties
```

Cette organisation confirme le modèle stratégique retenu :

> **Plateforme générique, expérience verticale.**

---

# 16. Gestion des futurs profils clients

D’autres profils sont prévus avant la fin de l’année 2026.

Ils ne doivent pas être intégrés automatiquement dans la même verticale.

Chaque nouveau profil devra être analysé selon quatre niveaux.

## Niveau 1 — Cœur commun

Le besoin renforce une capacité déjà partagée :

* tiers ;
* catalogue ;
* pièces ;
* factures ;
* règlements ;
* documents.

## Niveau 2 — Configuration

Le besoin peut être traité par :

* un terme ;
* un statut ;
* un type de pièce ;
* une règle ;
* une option ;
* un rôle.

## Niveau 3 — Extension verticale

Le besoin est partagé par plusieurs entreprises d’un même secteur, mais pas par toutes les entreprises.

## Niveau 4 — Besoin spécifique

Le besoin n’existe que chez un client et ne justifie pas une évolution du produit.

Cette classification doit être réalisée avant tout développement important.

---

# 17. Informations à collecter pour les futurs clients

Pour chaque nouveau profil, PGYS devra documenter :

* secteur ;
* taille ;
* utilisateurs ;
* produits ou services vendus ;
* cycle principal ;
* documents utilisés ;
* règles de facturation ;
* règles de paiement ;
* gestion du stock ;
* gestion des opérations ;
* contraintes de mobilité ;
* outils existants ;
* problème principal ;
* bénéfice attendu ;
* fonctions communes avec les clients existants ;
* particularités propres au secteur ;
* particularités propres au client.

Une matrice comparative devra être mise à jour après chaque nouveau pilote.

---

# 18. Risques stratégiques

## 18.1. Construire un ERP généraliste trop tôt

Les deux clients pourraient donner l’impression que PGYS doit immédiatement gérer tous les flux commerciaux possibles.

Ce serait une erreur.

Le cœur doit rester générique, mais chaque offre doit conserver une promesse claire.

## 18.2. Choisir une verticale uniquement parce qu’un client existe

Un client pilote valide un problème.

Il ne valide pas à lui seul la taille ni la rentabilité d’un marché.

## 18.3. Conserver deux bases produit indépendantes

Les deux applications peuvent continuer temporairement à fonctionner, mais les nouvelles fonctionnalités communes doivent progressivement provenir d’un même socle.

## 18.4. Généraliser une interface spécifique

L’écran tactile du client 2 est un avantage potentiel, mais sa disposition exacte ne doit pas devenir une norme universelle sans tests supplémentaires.

## 18.5. Promettre le mode déconnecté sans cadrage

Le fonctionnement hors connexion peut devenir coûteux et complexe.

Il doit être traité comme une capacité stratégique, pas comme une simple sauvegarde.

---

# 19. Décisions actées

* Les deux clients partagent un cœur commun de gestion commerciale.
* Le cœur comprend les tiers, le catalogue, les pièces, la facturation, les avoirs, les règlements, les documents et le pilotage.
* Les factures préparatoires ou brouillons appartiennent au cœur générique.
* Les règlements multiples appartiennent au cœur générique.
* Le client 1 relève d’une future verticale de centrale d’achat, de négoce ou d’intermédiation.
* Les commissions, flux producteurs et confirmations de réception restent dans cette verticale.
* Le client 2 relève d’une première verticale destinée aux artisans et petites entreprises opérationnelles.
* Le client 2 devient la référence principale pour le premier produit commercialisable.
* L’écran tactile constitue une expérience spécialisée au-dessus du cœur commun.
* Le mécanisme historique de sauvegarde ne constitue pas la cible stratégique du mode déconnecté.
* Les futurs profils seront classés entre cœur commun, configuration, extension verticale et besoin spécifique.
* PGYS conservera un cœur unique et plusieurs expériences verticales.

---

# 20. Recommandation finale

PGYS ne doit pas choisir entre les deux clients.

Il doit leur attribuer des rôles différents.

## Client 1

> **Pilote de profondeur métier**

Il valide la capacité de PGYS à gérer :

* le stock ;
* la logistique ;
* les flux complexes ;
* les règlements entrants et sortants ;
* les relations multi-parties ;
* les commissions.

## Client 2

> **Pilote de reproductibilité commerciale**

Il valide la capacité de PGYS à proposer :

* une offre compréhensible ;
* une expérience simple ;
* une saisie rapide ;
* un cycle complet ;
* un produit déployable auprès d’autres artisans.

---

# 21. Formulation stratégique

> **PGYS construit un cœur commun de gestion commerciale et opérationnelle, puis l’adapte à chaque marché au moyen d’expériences verticales. La première verticale commercialisable sera centrée sur les artisans et petites entreprises suivant leurs commandes de la saisie jusqu’au paiement.**

---

# 22. Principe directeur

> **Un besoin commun renforce la plateforme. Un besoin sectoriel enrichit une verticale. Un besoin isolé ne doit jamais déformer le produit.**
