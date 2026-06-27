# PGYS — Tableau de pilotage stratégique

**Version :** 1.0
**Statut :** Brouillon stratégique à valider
**Périodicité :** Mise à jour mensuelle
**Nature du document :** Outil de suivi de la roadmap, du produit et du modèle économique

---

# 1. Objet du document

Ce tableau de pilotage permet de vérifier chaque mois si PGYS progresse réellement vers son objectif :

> **Transformer des besoins clients en un produit SaaS standardisé, utilisé, vendu et rentable.**

Il ne doit pas devenir un tableau de bord complexe.

Il doit permettre de répondre rapidement à cinq questions :

1. Le produit est-il réellement utilisé ?
2. Les clients obtiennent-ils de la valeur ?
3. Le produit devient-il plus générique ou plus spécifique ?
4. Le modèle économique est-il viable ?
5. Sommes-nous prêts à passer au jalon suivant ?

---

# 2. Principe de pilotage

PGYS ne doit pas mesurer son avancement au nombre de fonctionnalités développées.

Les indicateurs principaux doivent mesurer :

* l’usage ;
* la valeur créée ;
* la reproductibilité ;
* la satisfaction ;
* la rentabilité ;
* l’avancement vers les jalons stratégiques.

Une fonctionnalité livrée mais inutilisée ne constitue pas un progrès.

---

# 3. Tableau de synthèse mensuel

Chaque mois, PGYS renseigne les indicateurs suivants.

| Domaine    | Indicateur                      | Valeur du mois | Tendance | Objectif | Statut |
| ---------- | ------------------------------- | -------------: | -------- | -------: | ------ |
| Produit    | Utilisateurs actifs             |                |          |          |        |
| Produit    | Commandes ou prestations créées |                |          |          |        |
| Produit    | Factures générées               |                |          |          |        |
| Produit    | Règlements enregistrés          |                |          |          |        |
| Produit    | Bugs critiques ouverts          |                |          |        0 |        |
| Client     | Satisfaction moyenne            |                |          |   ≥ 8/10 |        |
| Client     | Temps de support consommé       |                |          |          |        |
| Client     | Demandes spécifiques reçues     |                |          |          |        |
| Business   | Revenu mensuel récurrent        |                |          |          |        |
| Business   | Panier moyen par client         |                |          |  ≥ 100 € |        |
| Business   | Revenu de mise en route         |                |          |          |        |
| Business   | Marge estimée par client        |                |          | positive |        |
| Commercial | Prospects qualifiés             |                |          |          |        |
| Commercial | Démonstrations réalisées        |                |          |          |        |
| Commercial | Propositions envoyées           |                |          |          |        |
| Commercial | Nouveaux clients signés         |                |          |          |        |
| Roadmap    | Jalon principal atteint         |                |          |          |        |

Le statut peut être :

* **Vert** : objectif atteint ou trajectoire correcte ;
* **Orange** : écart à surveiller ;
* **Rouge** : problème nécessitant une décision.

---

# 4. Indicateurs produit

## 4.1. Utilisateurs actifs

### Définition

Nombre d’utilisateurs ayant réellement utilisé le produit pendant le mois.

### Pourquoi cet indicateur est important

Un compte créé ne signifie pas que le produit est adopté.

### Signal positif

* utilisation régulière ;
* plusieurs utilisateurs actifs ;
* adoption par les profils opérationnels.

### Signal d’alerte

* seul le dirigeant utilise le produit ;
* utilisateurs créés mais inactifs ;
* retour aux anciens outils.

---

## 4.2. Utilisation du cycle principal

Mesurer :

* commandes créées ;
* prestations enregistrées ;
* rendez-vous saisis ;
* factures générées ;
* règlements enregistrés ;
* avoirs créés.

L’objectif est de vérifier que le produit est utilisé sur le processus central.

---

## 4.3. Taux de continuité du parcours

### Définition

Pourcentage d’opérations allant jusqu’à leur étape suivante sans ressaisie manuelle.

Exemple :

```text
Commande
→ réalisation
→ facture
→ règlement
```

### Objectif

Réduire progressivement les opérations traitées en dehors de PGYS.

### Signal d’alerte

* facture recréée dans un autre logiciel ;
* règlement suivi dans Excel ;
* planning géré sur papier ;
* documents non rattachés au dossier.

---

## 4.4. Bugs critiques

Un bug critique est un problème qui :

* empêche la facturation ;
* fausse un montant ;
* bloque l’encaissement ;
* provoque une perte de données ;
* expose les données d’un autre client ;
* empêche l’utilisateur de travailler.

### Règle

Le nombre de bugs critiques ouverts doit tendre vers zéro.

---

## 4.5. Fonctionnalités réellement utilisées

Chaque nouvelle fonction doit être suivie.

Pour chaque fonction importante :

* nombre d’utilisateurs ;
* fréquence d’utilisation ;
* clients concernés ;
* bénéfice observé ;
* demandes de support générées.

Une fonction peu utilisée doit être :

* simplifiée ;
* mieux présentée ;
* reportée ;
* ou supprimée.

---

# 5. Indicateurs clients

## 5.1. Satisfaction

Mesure simple recommandée :

> Sur une échelle de 0 à 10, dans quelle mesure PGYS facilite-t-il votre activité quotidienne ?

Objectif initial :

> **8/10 ou plus**

La note seule ne suffit pas.

Il faut aussi demander :

* ce qui apporte le plus de valeur ;
* ce qui fait perdre du temps ;
* ce qui manque réellement ;
* ce qui pourrait être supprimé.

---

## 5.2. Bénéfice mesurable

Chaque client doit disposer d’au moins un bénéfice mesurable.

Exemples :

* temps de saisie réduit ;
* délai de facturation réduit ;
* diminution des oublis ;
* meilleur suivi des impayés ;
* réduction du nombre de fichiers ;
* meilleure visibilité quotidienne.

Un client satisfait mais incapable d’identifier un bénéfice concret peut devenir difficile à retenir ou à convaincre de payer davantage.

---

## 5.3. Temps de support par client

Le temps mensuel doit être suivi pour chaque client.

| Client   | Temps de support | Type de demande | Cause | Action |
| -------- | ---------------: | --------------- | ----- | ------ |
| Client 1 |                  |                 |       |        |
| Client 2 |                  |                 |       |        |
| Salon    |                  |                 |       |        |

Les demandes doivent être classées :

* bug ;
* mauvaise compréhension ;
* manque de documentation ;
* besoin de formation ;
* paramétrage ;
* demande spécifique ;
* évolution produit.

---

## 5.4. Demandes spécifiques

Une augmentation des demandes spécifiques constitue un risque stratégique.

Chaque demande doit être classée :

| Demande | Client | Catégorie                                     | Réutilisable ? | Décision |
| ------- | ------ | --------------------------------------------- | -------------- | -------- |
|         |        | Cœur / Configuration / Verticale / Spécifique | Oui / Non      |          |

### Signal d’alerte

Si une part importante du travail mensuel concerne un seul client, PGYS dérive vers le développement sur mesure.

---

## 5.5. Risque de départ

Pour chaque client, attribuer un niveau :

* faible ;
* moyen ;
* élevé.

Les critères peuvent inclure :

* baisse d’utilisation ;
* problèmes répétés ;
* insatisfaction ;
* faible valeur perçue ;
* prix contesté ;
* retour à l’ancien outil.

---

# 6. Indicateurs commerciaux

## 6.1. Prospects qualifiés

Un prospect qualifié doit correspondre au segment visé.

Il doit avoir :

* un besoin réel ;
* un cycle métier compatible ;
* un décideur identifié ;
* un budget plausible ;
* une échéance ;
* une volonté de changer.

Un grand nombre de contacts non qualifiés n’est pas un indicateur de progrès.

---

## 6.2. Taux de conversion

Suivre les conversions entre :

```text
Prospect contacté
→ rendez-vous
→ démonstration
→ proposition
→ signature
→ client actif
```

Tableau recommandé :

| Étape               | Nombre | Taux de conversion |
| ------------------- | -----: | -----------------: |
| Prospects contactés |        |                    |
| Rendez-vous obtenus |        |                    |
| Démonstrations      |        |                    |
| Propositions        |        |                    |
| Signatures          |        |                    |
| Clients actifs      |        |                    |

---

## 6.3. Objections

Les objections doivent être documentées.

Catégories possibles :

* prix ;
* produit incomplet ;
* peur de changer ;
* migration ;
* absence de fonction ;
* concurrence ;
* manque de confiance ;
* calendrier ;
* complexité perçue.

L’objectif est d’identifier les objections récurrentes et non de répondre au cas par cas sans apprentissage.

---

## 6.4. Durée du cycle de vente

Mesurer le nombre de jours entre :

* le premier contact ;
* la démonstration ;
* la proposition ;
* la signature ;
* la mise en service.

Un cycle trop long peut indiquer :

* une cible mal choisie ;
* une offre peu claire ;
* un prix difficile à justifier ;
* un onboarding trop lourd.

---

# 7. Indicateurs économiques

## 7.1. Revenu mensuel récurrent

Le revenu mensuel récurrent doit être séparé des prestations ponctuelles.

```text
MRR = somme des abonnements actifs du mois
```

Les frais de mise en route, migrations et formations ne sont pas inclus dans le MRR.

---

## 7.2. Panier moyen

```text
Panier moyen = MRR / nombre de clients actifs
```

Objectif de travail initial :

> **Supérieur ou égal à 100 € HT par mois**

Cet objectif pourra évoluer après validation du marché.

---

## 7.3. Marge client

Pour chaque client :

```text
Revenu mensuel
- coûts techniques
- temps de support valorisé
- coûts de services tiers
= marge mensuelle estimée
```

Cette estimation doit rester simple, mais régulière.

---

## 7.4. Coût de mise en route

Mesurer :

* temps de diagnostic ;
* paramétrage ;
* migration ;
* formation ;
* corrections ;
* accompagnement initial.

Comparer ce coût au prix réellement facturé.

### Signal d’alerte

La mise en route est vendue 500 €, mais consomme plusieurs jours de travail.

---

## 7.5. Revenu non récurrent

Suivre séparément :

* mise en route ;
* migration ;
* formation ;
* conseil ;
* intervention spécifique ;
* intégration.

L’objectif n’est pas de supprimer ces revenus.

L’objectif est de vérifier qu’ils ne deviennent pas indispensables pour compenser un abonnement insuffisant.

---

# 8. Indicateurs de reproductibilité

## 8.1. Temps d’onboarding

Mesurer le temps nécessaire pour transformer un client signé en client actif.

Objectif :

* réduire progressivement le temps ;
* standardiser les étapes ;
* limiter les interventions manuelles.

---

## 8.2. Part de configuration standard

Mesurer la proportion du déploiement réalisée avec :

* profils ;
* paramètres ;
* imports standards ;
* modèles existants ;
* documentation.

Plus cette part augmente, plus le produit devient scalable.

---

## 8.3. Développement spécifique par client

Mesurer le temps consacré aux fonctions destinées à un seul client.

Objectif stratégique :

> **Tendre vers zéro pour les nouveaux clients standards.**

---

## 8.4. Réutilisation des composants

Pour chaque évolution, indiquer :

* nombre de clients bénéficiaires ;
* nombre de verticales concernées ;
* intégration dans le cœur ou dans une extension.

Une évolution utilisée par plusieurs clients renforce la plateforme.

---

# 9. Suivi des jalons

## Jalon 1 — Noyau commun confirmé

### Critères

* cycles des pilotes documentés ;
* tiers communs ;
* catalogue commun ;
* pièces communes ;
* règlements communs ;
* différences isolées.

### Statut

* Non commencé ;
* En cours ;
* Atteint ;
* Bloqué.

---

## Jalon 2 — PGYS Services stable

### Critères

* cycle commande-facture-règlement fiable ;
* utilisation quotidienne ;
* synthèse exploitable ;
* faible nombre de bugs critiques ;
* démonstration reproductible.

---

## Jalon 3 — Salon intégré

### Critères

* planning opérationnel ;
* prestations avec durée ;
* collaborateurs ;
* produits complémentaires ;
* facturation et encaissement ;
* même socle que le client 2.

---

## Jalon 4 — Offre standardisée

### Critères

* offre documentée ;
* pricing ;
* onboarding ;
* modèles ;
* exclusions ;
* support ;
* migration standard.

---

## Jalon 5 — Premier client au tarif standard

### Critères

* client externe ;
* prix normal accepté ;
* mise en route payée ;
* absence de développement spécifique majeur ;
* usage réel.

---

## Jalon 6 — Verticale validée

### Critères

* plusieurs clients comparables ;
* usage régulier ;
* rétention ;
* marge positive ;
* onboarding reproductible ;
* acquisition amorcée.

---

# 10. Revue mensuelle

Une revue stratégique doit être organisée chaque mois.

Même si PGYS repose sur une seule personne, cette discipline reste utile.

## Ordre du jour recommandé

### 1. Résultats du mois

* usage ;
* clients ;
* revenus ;
* incidents ;
* commercial.

### 2. Écarts par rapport à la roadmap

* retard ;
* nouvelle demande ;
* dépendance ;
* sujet bloquant.

### 3. Décisions

* poursuivre ;
* simplifier ;
* reporter ;
* supprimer ;
* accélérer.

### 4. Priorité du mois suivant

Une seule priorité stratégique principale doit être retenue.

---

# 11. Compte rendu mensuel

```text
Mois :

Priorité principale du mois :
Résultat attendu :
Résultat obtenu :

Indicateurs verts :
-

Indicateurs orange :
-

Indicateurs rouges :
-

Décisions prises :
-

Sujets reportés :
-

Priorité du mois suivant :
-
```

---

# 12. Règles de décision

## Accélérer une fonctionnalité

Seulement si :

* plusieurs clients la demandent ;
* elle renforce le cycle principal ;
* elle apporte un bénéfice mesurable ;
* elle ne fragilise pas la roadmap.

## Reporter une fonctionnalité

Si :

* elle est utile mais non nécessaire au jalon actuel ;
* elle ne concerne qu’un futur segment ;
* elle demande trop de dépendances ;
* sa valeur n’est pas encore démontrée.

## Refuser une fonctionnalité

Si :

* elle ne concerne qu’un client ;
* elle reproduit une habitude historique sans valeur générale ;
* elle complexifie durablement le produit ;
* elle ne peut pas être maintenue correctement.

## Revoir le positionnement

Si :

* les prospects ne comprennent pas la promesse ;
* les utilisateurs n’adoptent pas le cycle principal ;
* le prix accepté est trop faible ;
* les besoins divergent entre clients ;
* le support devient excessif.

---

# 13. Signaux d’alerte stratégiques

Une décision de recadrage doit être prise si l’un des événements suivants se produit :

* plus de 30 % du temps produit est consacré à un seul client ;
* plusieurs nouveaux clients nécessitent des développements spécifiques ;
* le support moyen dépasse la marge dégagée ;
* les utilisateurs continuent à utiliser Excel ou EBP pour le processus principal ;
* le produit est utilisé uniquement pour la facturation ;
* le salon et l’artisan nécessitent deux produits différents ;
* le planning retarde excessivement le cœur commercial ;
* aucun prospect externe n’accepte le prix ;
* les clients ne peuvent pas expliquer la valeur obtenue ;
* la roadmap change chaque mois.

---

# 14. Indicateurs à ne pas survaloriser

PGYS ne doit pas se laisser tromper par :

* le nombre total de fonctionnalités ;
* le nombre de lignes de code ;
* le nombre d’écrans ;
* le nombre de contacts non qualifiés ;
* les compliments sans usage réel ;
* les inscriptions gratuites ;
* les demandes de fonctionnalités ;
* les heures de développement ;
* le chiffre d’affaires ponctuel sans récurrence.

Ces chiffres peuvent être utiles, mais ils ne prouvent pas la viabilité du SaaS.

---

# 15. Tableau de décision trimestriel

Tous les trois mois, PGYS doit répondre à ces questions.

| Question                                           | Oui | Non | Commentaire |
| -------------------------------------------------- | :-: | :-: | ----------- |
| Le produit est-il davantage utilisé ?              |     |     |             |
| Les clients obtiennent-ils un résultat mesurable ? |     |     |             |
| Le support devient-il plus simple ?                |     |     |             |
| L’onboarding devient-il reproductible ?            |     |     |             |
| Le revenu récurrent augmente-t-il ?                |     |     |             |
| Le panier moyen est-il acceptable ?                |     |     |             |
| Les demandes spécifiques diminuent-elles ?         |     |     |             |
| Le prochain jalon est-il clairement défini ?       |     |     |             |
| Le produit reste-t-il cohérent ?                   |     |     |             |
| PGYS se rapproche-t-il d’un modèle scalable ?      |     |     |             |

Si plusieurs réponses sont négatives pendant deux trimestres consécutifs, la stratégie doit être réexaminée.

---

# 16. Responsabilités

## Direction PGYS

* mettre à jour les indicateurs ;
* arbitrer ;
* protéger la roadmap ;
* décider des priorités ;
* suivre la rentabilité.

## Produit

* suivre l’usage ;
* classer les demandes ;
* mesurer les bénéfices ;
* maintenir le périmètre.

## Commercial

* documenter les prospects ;
* mesurer les conversions ;
* collecter les objections ;
* tester les prix.

## Support

* catégoriser les demandes ;
* mesurer le temps ;
* identifier les problèmes récurrents ;
* distinguer bug, formation et évolution.

Au démarrage, une seule personne peut remplir plusieurs rôles. Les responsabilités doivent néanmoins rester distinctes.

---

# 17. Décisions actées

* PGYS utilisera un tableau de pilotage mensuel.
* L’usage réel sera prioritaire sur le nombre de fonctionnalités.
* Le revenu récurrent sera séparé des prestations.
* Le temps de support sera suivi par client.
* Les demandes seront classées avant développement.
* Les jalons auront des critères de sortie explicites.
* Une seule priorité stratégique principale sera retenue chaque mois.
* Les indicateurs rouges devront déclencher une décision.
* La reproductibilité fera partie des indicateurs principaux.
* Le tableau restera volontairement simple.

---

# 18. Modèle minimal à utiliser immédiatement

Pour commencer, seuls dix indicateurs sont obligatoires :

1. utilisateurs actifs ;
2. commandes ou prestations créées ;
3. factures générées ;
4. bugs critiques ;
5. satisfaction client ;
6. temps de support par client ;
7. demandes spécifiques ;
8. revenu mensuel récurrent ;
9. panier moyen ;
10. jalon stratégique actuel.

Les autres indicateurs seront ajoutés lorsqu’ils deviennent utiles.

---

# 19. Formulation synthétique

> **Le tableau de pilotage PGYS mesure non pas ce que nous avons développé, mais ce que les clients utilisent, la valeur qu’ils obtiennent et la capacité de PGYS à reproduire cette réussite de manière rentable.**

---

# 20. Principe directeur

> **Ce qui n’est pas mesuré finit par être piloté par l’intuition. L’intuition peut lancer PGYS, mais seules les données permettront de le faire grandir.**
