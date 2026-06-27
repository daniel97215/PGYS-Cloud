# PGYS Services — Définition de la première verticale

**Version :** 1.0
**Statut :** Brouillon stratégique à valider
**Horizon :** 12 à 24 mois
**Nature du document :** Définition de la première verticale commerciale PGYS

---

# 1. Objet du document

Ce document définit la première verticale commerciale de PGYS.

Cette verticale doit réunir plusieurs métiers partageant un même mode de fonctionnement, sans enfermer le produit dans un secteur unique.

Elle doit permettre de répondre à un besoin suffisamment homogène pour :

* proposer une offre claire ;
* construire une expérience adaptée ;
* standardiser l’onboarding ;
* mutualiser les développements ;
* prospecter des entreprises comparables ;
* démontrer rapidement la valeur du produit.

---

# 2. Nom de travail

> **PGYS Services**

Ce nom désigne une solution destinée aux petites entreprises qui vendent principalement des prestations, éventuellement complétées par des produits, et qui doivent organiser leur activité depuis la prise de commande ou de rendez-vous jusqu’au paiement.

Le nom reste provisoire.

Il pourra évoluer après validation du positionnement commercial et des premiers tests marché.

---

# 3. Définition de la verticale

PGYS Services s’adresse aux petites entreprises de services de proximité qui :

* accueillent des clients ;
* reçoivent des demandes, commandes ou rendez-vous ;
* sélectionnent des prestations, articles ou opérations ;
* organisent leur réalisation ;
* facturent ;
* encaissent ;
* suivent leur activité quotidienne.

Le produit doit couvrir aussi bien une prestation immédiate qu’une prestation planifiée ou une commande réalisée ultérieurement.

---

# 4. Problème principal

Ces entreprises utilisent souvent plusieurs outils séparés :

* agenda papier ou numérique ;
* logiciel de caisse ;
* logiciel de facturation ;
* fiches clients ;
* cahiers ;
* feuilles de calcul ;
* applications de prise de rendez-vous ;
* outils de paiement ;
* dossiers papier.

Cette fragmentation crée :

* des doubles saisies ;
* des oublis ;
* une mauvaise visibilité sur les rendez-vous ou commandes ;
* une perte d’historique client ;
* des écarts de caisse ou de règlement ;
* des difficultés à suivre la réalisation ;
* une dépendance aux habitudes de chaque salarié ;
* un pilotage limité de l’activité.

Le problème central est donc :

> **L’activité du client, sa réalisation, sa facturation et son paiement sont suivis dans des outils ou processus séparés.**

---

# 5. Proposition de valeur

## Formulation principale

> **PGYS Services centralise les clients, les rendez-vous, les commandes, les prestations, les produits, la facturation et les règlements dans un environnement simple, conçu pour le travail quotidien des petites entreprises de services.**

## Formulation courte

> **De la prise en charge du client jusqu’au paiement, toute l’activité au même endroit.**

## Promesse opérationnelle

PGYS Services doit permettre de :

* servir le client plus rapidement ;
* réduire les ressaisies ;
* suivre ce qui reste à réaliser ;
* facturer sans ressaisie ;
* encaisser plusieurs règlements ;
* retrouver l’historique ;
* connaître l’activité de la journée ;
* mieux organiser les collaborateurs.

---

# 6. Segments potentiels

La verticale peut servir plusieurs sous-segments partageant un flux proche.

## 6.1. Services avec accueil au comptoir

Exemples :

* ateliers de réparation ;
* cordonneries ;
* services de personnalisation ;
* imprimeries de proximité ;
* retouche et confection ;
* services techniques ;
* artisans recevant directement les clients.

Flux courant :

```text
Client
→ commande
→ articles ou opérations
→ réalisation
→ restitution
→ facture
→ règlement
```

## 6.2. Services sur rendez-vous

Exemples :

* salons de coiffure ;
* instituts de beauté ;
* soins non médicaux ;
* services de bien-être ;
* tatouage ;
* photographie ;
* conseil sur rendez-vous.

Flux courant :

```text
Client
→ rendez-vous
→ prestation
→ produits complémentaires
→ réalisation
→ facture ou ticket
→ règlement
```

## 6.3. Services avec intervention planifiée

Exemples :

* maintenance ;
* dépannage ;
* installation ;
* entretien ;
* nettoyage ;
* prestations techniques.

Flux courant :

```text
Demande
→ devis ou commande
→ planification
→ intervention
→ compte rendu
→ facture
→ règlement
```

Ces trois familles utilisent un même cœur, mais certaines fonctionnalités peuvent être activées selon le profil.

---

# 7. Sous-segment de lancement recommandé

Le premier lancement ne doit pas viser tous les services de proximité.

Le sous-segment recommandé est :

> **Les petites entreprises avec accueil client, saisie rapide de prestations ou commandes, réalisation immédiate ou différée, puis encaissement.**

Ce sous-segment correspond :

* au client pilote 2 ;
* au futur salon de coiffure ;
* à une expérience tactile commune ;
* à un cycle commercial court ;
* à une démonstration simple ;
* à un besoin de pilotage quotidien.

Cette cible pourra ensuite être élargie aux entreprises d’intervention.

---

# 8. Client idéal

Le client idéal initial présente les caractéristiques suivantes :

* 1 à 10 collaborateurs ;
* une activité de proximité ;
* des clients particuliers ou professionnels ;
* des prestations fréquentes ;
* éventuellement des produits vendus en complément ;
* un accueil physique ou une prise de rendez-vous ;
* une facturation ou un encaissement régulier ;
* un dirigeant impliqué dans l’exploitation ;
* peu de compétences informatiques internes ;
* un besoin de simplicité et de rapidité.

Il utilise actuellement une combinaison de :

* cahier ;
* agenda ;
* caisse ;
* EBP ou logiciel similaire ;
* fichiers clients ;
* tableur ;
* applications non connectées.

---

# 9. Cycle métier générique

Le cœur de PGYS Services doit couvrir ce cycle :

```text
Identification du client
        ↓
Rendez-vous, demande ou commande
        ↓
Sélection des prestations, articles ou opérations
        ↓
Planification éventuelle
        ↓
Réalisation
        ↓
Contrôle ou validation
        ↓
Facture ou ticket
        ↓
Règlement
        ↓
Historique et fidélisation
```

Chaque entreprise peut activer uniquement les étapes qui lui sont utiles.

Une prestation immédiate peut passer directement de la sélection à l’encaissement.

Une commande complexe peut être suivie sur plusieurs jours.

---

# 10. Socle fonctionnel obligatoire

## 10.1. Clients

Le produit doit permettre :

* création rapide ;
* recherche ;
* coordonnées ;
* notes ;
* préférences ;
* historique ;
* documents ;
* statut actif ;
* consentements utiles ;
* rattachement aux rendez-vous, commandes, factures et règlements.

La création d’un client ne doit pas ralentir une vente rapide.

Une vente anonyme ou à un client occasionnel peut être autorisée selon les règles de l’entreprise.

## 10.2. Catalogue

Le catalogue doit gérer :

* prestations ;
* produits ;
* opérations ;
* familles ;
* prix ;
* taxes ;
* durées ;
* prix modifiable ou fixe ;
* remises autorisées ;
* collaborateurs habilités ;
* statut stocké ou non stocké ;
* commentaires ou options.

Une ligne peut représenter :

* une prestation ;
* un article vendu ;
* une transformation ;
* une réparation ;
* une opération complémentaire.

## 10.3. Commandes et dossiers

Le produit doit permettre :

* création rapide ;
* client ;
* lignes ;
* détails par ligne ;
* quantité ;
* prix ;
* remise ;
* commentaires ;
* statut ;
* responsable ;
* date prévue ;
* date réelle ;
* documents ;
* aperçu.

Le terme affiché peut être configurable :

* commande ;
* dossier ;
* ticket ;
* prestation ;
* intervention.

## 10.4. Facturation

Le produit doit gérer :

* facture ;
* ticket ;
* facture issue d’une commande ;
* facturation immédiate ;
* acompte ;
* avoir ;
* facture brouillon ;
* validation ;
* impression ou envoi ;
* archivage.

## 10.5. Règlements

Le moteur doit gérer :

* espèces ;
* carte ;
* chèque ;
* virement ;
* bons ou avoirs ;
* plusieurs règlements ;
* paiement partiel ;
* reste à payer ;
* référence ;
* date ;
* historique.

## 10.6. Synthèse quotidienne

Le dirigeant doit pouvoir voir :

* ventes du jour ;
* encaissements ;
* répartition par moyen de paiement ;
* prestations réalisées ;
* commandes en attente ;
* factures non réglées ;
* annulations ;
* remises ;
* avoirs ;
* activité par collaborateur lorsque pertinent.

---

# 11. Expérience tactile

L’expérience tactile constitue un élément différenciant important.

Elle doit permettre de réaliser une opération courante avec un minimum d’étapes.

## Organisation recommandée

L’écran principal peut comporter quatre zones :

1. **Client**

   * recherche ;
   * sélection ;
   * informations essentielles ;
   * historique rapide.

2. **Familles**

   * catégories de prestations ;
   * catégories de produits ;
   * raccourcis.

3. **Sélection et configuration**

   * article ou prestation ;
   * quantité ;
   * prix ;
   * remise ;
   * commentaire ;
   * opérations à effectuer ;
   * durée éventuelle.

4. **Pièce en cours**

   * lignes ;
   * total ;
   * taxes ;
   * remise ;
   * statut ;
   * passage à la facturation ou au paiement.

L’interface doit être adaptable, mais pas entièrement redessinable pour chaque client.

---

# 12. Planning et rendez-vous

Avec l’arrivée du salon de coiffure, le planning devient une capacité structurante.

Il doit rester optionnel pour les entreprises qui n’en ont pas besoin.

## Fonctions minimales

* vue jour ;
* vue semaine ;
* collaborateurs ;
* créneaux ;
* durée ;
* client ;
* prestation ;
* statut ;
* notes ;
* création rapide ;
* déplacement ;
* annulation ;
* absence ;
* disponibilité simple.

## Statuts possibles

* réservé ;
* confirmé ;
* arrivé ;
* en cours ;
* terminé ;
* annulé ;
* absent.

## Principe

Le rendez-vous ne doit pas être un objet isolé.

Il doit pouvoir déclencher ou alimenter :

* une commande ;
* une prestation ;
* une facture ;
* un règlement ;
* l’historique client.

---

# 13. Collaborateurs

Le produit doit progressivement gérer :

* les utilisateurs ;
* les collaborateurs opérationnels ;
* les compétences ;
* les prestations autorisées ;
* les horaires ;
* les disponibilités ;
* l’activité réalisée ;
* le chiffre d’affaires associé ;
* les droits.

Le suivi de performance individuelle doit rester transparent et compatible avec les règles sociales applicables.

PGYS ne doit pas encourager une surveillance excessive.

---

# 14. Produits et stock

Certaines entreprises de services vendent également des produits.

Exemple dans un salon de coiffure :

* shampoings ;
* soins ;
* accessoires.

Le stock doit donc pouvoir être activé.

Fonctions recommandées :

* stock courant ;
* ventes ;
* entrées ;
* inventaires ;
* alertes ;
* historique ;
* consommation éventuelle dans une prestation.

Le stock avancé ne doit pas être obligatoire pour lancer PGYS Services.

---

# 15. Fidélisation

La fidélisation peut devenir un prolongement naturel de la verticale.

Fonctions possibles :

* historique des visites ;
* fréquence ;
* préférences ;
* prochaine visite recommandée ;
* rappels ;
* points ;
* cartes de fidélité ;
* forfaits ;
* abonnements ;
* cartes cadeaux ;
* campagnes ciblées.

Ces fonctions ne doivent pas être prioritaires avant la stabilisation du cycle principal.

---

# 16. Portail et réservation en ligne

À terme, PGYS Services pourra inclure :

* prise de rendez-vous ;
* modification ou annulation ;
* choix du collaborateur ;
* choix de la prestation ;
* paiement d’un acompte ;
* consultation des rendez-vous ;
* téléchargement des factures ;
* messages ;
* dépôt de documents.

La réservation en ligne constitue une extension commerciale importante, mais ne doit pas retarder la première version.

---

# 17. Configuration par profil

PGYS Services doit proposer des profils préconfigurés.

## Profil Comptoir

Activé :

* clients ;
* commande ;
* saisie tactile ;
* facturation ;
* règlements ;
* synthèse quotidienne.

Désactivé par défaut :

* planning ;
* rendez-vous ;
* intervention externe.

## Profil Rendez-vous

Activé :

* clients ;
* planning ;
* prestations ;
* collaborateurs ;
* facturation ;
* règlements ;
* historique.

## Profil Intervention

Activé :

* clients ;
* devis ;
* planning ;
* intervention ;
* compte rendu ;
* facture ;
* règlement.

Ces profils doivent utiliser le même produit et les mêmes données communes.

---

# 18. Différenciation

PGYS Services ne doit pas se battre uniquement sur la facturation ou la caisse.

Sa différenciation repose sur :

## 18.1. Continuité du parcours

Le client, la demande, la prestation, la facture et le paiement sont liés.

## 18.2. Souplesse maîtrisée

Le produit peut servir plusieurs métiers proches sans devenir du développement sur mesure.

## 18.3. Saisie adaptée au terrain

L’interface tactile et les parcours rapides répondent au travail réel.

## 18.4. Accompagnement

PGYS aide à configurer et structurer l’activité.

## 18.5. Évolutivité

Le client peut commencer par la facturation, puis activer le planning, le stock, le portail ou la fidélisation.

---

# 19. Ce que PGYS Services ne doit pas devenir

La verticale ne doit pas devenir :

* une caisse générique pour tous commerces ;
* un logiciel spécialisé coiffure uniquement ;
* un ERP pour toutes les entreprises de services ;
* une application entièrement personnalisable ;
* une solution de paie ;
* une plateforme de réservation grand public ;
* un outil marketing complexe dès le lancement ;
* un logiciel métier différent pour chaque client.

---

# 20. MVP de la verticale

## Inclus

* entreprise ;
* utilisateurs simples ;
* clients ;
* catalogue ;
* familles ;
* prestations ;
* produits ;
* commande ou dossier ;
* saisie rapide tactile ;
* commentaires et opérations par ligne ;
* prix modifiable selon autorisation ;
* remises ;
* facturation ;
* avoirs ;
* règlements multiples ;
* historique ;
* synthèse quotidienne ;
* sauvegarde ;
* export simple.

## Option prioritaire

* planning et rendez-vous.

## Extensions suivantes

* devis ;
* stock ;
* collaborateurs avancés ;
* intervention ;
* réservation en ligne ;
* fidélité ;
* cartes cadeaux ;
* forfaits ;
* relances ;
* portail client.

---

# 21. Scénarios de démonstration

## Scénario 1 — Atelier

```text
Création du client
→ saisie d’une commande
→ ajout d’un article
→ ajout d’une opération
→ commentaire
→ prix ajusté
→ commande terminée
→ facture
→ règlement en deux moyens
→ synthèse quotidienne
```

## Scénario 2 — Salon de coiffure

```text
Création d’un rendez-vous
→ sélection du client
→ choix de la prestation
→ affectation à un collaborateur
→ réalisation
→ ajout d’un produit
→ facture
→ paiement
→ historique client
```

Ces deux démonstrations doivent utiliser le même cœur logiciel.

---

# 22. Validation par le salon de coiffure

Le futur salon de coiffure devra servir à valider :

* le planning ;
* les durées de prestation ;
* les collaborateurs ;
* la prise de rendez-vous ;
* la vente combinée de prestations et de produits ;
* l’encaissement rapide ;
* l’historique client ;
* l’activité quotidienne.

Il ne devra pas imposer immédiatement :

* un programme de fidélité complexe ;
* une réservation en ligne complète ;
* une gestion de paie ;
* des commissions salariés sophistiquées ;
* un marketing automatisé avancé.

---

# 23. Critères de validation marché

La verticale sera considérée comme validée lorsque :

1. au moins trois entreprises proches utilisent le même noyau ;
2. le produit répond à leur cycle principal sans développement spécifique majeur ;
3. la mise en route est reproductible ;
4. la démonstration est comprise rapidement ;
5. les utilisateurs adoptent la saisie quotidienne ;
6. les dirigeants consultent la synthèse ;
7. l’abonnement est accepté ;
8. le support reste maîtrisé ;
9. les différences entre métiers sont gérées par configuration ou options ;
10. un canal d’acquisition reproductible commence à émerger.

---

# 24. Stratégie commerciale initiale

La prospection doit viser des entreprises dont le fonctionnement ressemble déjà aux pilotes.

Message recommandé :

> **Vous gérez vos clients, vos commandes, vos prestations, vos factures et vos paiements dans plusieurs outils ? PGYS Services les rassemble dans un seul environnement adapté à votre activité quotidienne.**

La démonstration doit commencer par un parcours métier.

Elle ne doit pas commencer par une liste de fonctionnalités.

---

# 25. Risques

## 25.1. Segment trop large

Le terme « services » peut devenir trop générique.

La prospection devra toujours cibler un sous-segment concret.

## 25.2. Concurrence

Les salons et commerces de proximité disposent déjà de nombreuses solutions.

PGYS devra démontrer une meilleure continuité entre opération, facturation et pilotage.

## 25.3. Complexité du planning

Le planning peut rapidement devenir complexe.

La première version doit rester simple.

## 25.4. Réglementation de caisse

Dès que le produit est présenté comme système de caisse, des obligations réglementaires et fiscales peuvent s’appliquer.

Ce point devra être étudié avant toute commercialisation comme logiciel de caisse.

## 25.5. Multiplication des variantes

Chaque métier peut demander une interface particulière.

PGYS devra limiter la personnalisation aux profils et paramètres validés.

---

# 26. Décisions actées

* La première verticale sera provisoirement nommée PGYS Services.
* Elle ciblera d’abord les petites entreprises de services avec accueil client, saisie rapide et encaissement.
* Le client pilote 2 reste le pilote principal.
* Le salon de coiffure devient le second cas de validation de cette verticale.
* Le planning devient une option prioritaire.
* Les prestations, les produits et les opérations partageront un catalogue commun.
* L’interface tactile constitue une capacité importante.
* Le produit doit couvrir les prestations immédiates et différées.
* Le stock restera optionnel.
* La fidélisation et la réservation en ligne seront ajoutées après validation du cœur.
* Les profils Comptoir, Rendez-vous et Intervention partageront le même socle.

---

# 27. Questions ouvertes

* Quel est précisément le métier du client pilote 2 ?
* Quel sous-segment sera prospecté après le salon de coiffure ?
* PGYS doit-il se présenter comme logiciel de caisse ou comme logiciel de gestion avec encaissement ?
* Quelles obligations réglementaires s’appliqueront au module d’encaissement ?
* Le planning doit-il être inclus dans l’abonnement principal ?
* Quel niveau de gestion des collaborateurs est nécessaire ?
* Les ventes anonymes doivent-elles être autorisées ?
* Les acomptes seront-ils inclus dans le MVP ?
* Quel bénéfice doit être garanti dans les trente premiers jours ?
* Quel prix les deux premiers profils peuvent-ils accepter ?

---

# 28. Formulation de synthèse

> **PGYS Services est une solution de gestion pour les petites entreprises de proximité qui accueillent des clients, réalisent des prestations ou commandes, facturent et encaissent. Elle relie l’ensemble du parcours dans une expérience simple, tactile et évolutive.**

---

# 29. Principe directeur

> **La verticale doit être assez spécialisée pour être immédiatement compréhensible, mais assez générique pour servir plusieurs métiers partageant le même cycle d’activité.**
