# Projet GitHub PGYS

Ce document decrit l'organisation recommandee du projet GitHub utilise pour
piloter le developpement de PGYS.

## Objectif

Le tableau suit les tickets depuis leur qualification jusqu'a leur livraison,
en gardant un lien clair entre la feuille de route, les issues et les pull
requests.

## Vues recommandees

- **Backlog** : tous les tickets a qualifier ou planifier ;
- **Iteration courante** : tickets de l'iteration, regroupes par statut ;
- **Feuille de route** : epics et jalons regroupes par produit ;
- **Mes tickets** : elements regroupes par responsable.

## Statuts

| Statut | Definition |
| --- | --- |
| Backlog | Ticket enregistre, non planifie |
| Pret | Perimetre et criteres d'acceptation valides |
| En cours | Implementation active |
| En revue | Pull request ouverte et controles en cours |
| Termine | Changement fusionne et verifie |

## Champs

- **Produit** : Cloud, Apps, Hosting, Backup ou Interne ;
- **Priorite** : P0, P1, P2 ou P3 ;
- **Taille** : XS, S, M, L ou XL ;
- **Iteration** : cycle de developpement cible ;
- **Responsable** : personne chargee du suivi.

## Regles de suivi

1. Chaque changement fonctionnel ou technique part d'une issue `PGYS-XXX`.
2. Une issue n'entre dans **Pret** qu'avec des criteres d'acceptation clairs.
3. Une pull request ne traite qu'un ticket et reference son issue.
4. Le statut **Termine** exige une fusion et la validation des controles.
5. La documentation et le changelog sont mis a jour lorsque le changement le
   necessite.

La vision de livraison reste definie dans `docs/06-ROADMAP.md` et le backlog
initial dans `docs/07-BACKLOG.md`. GitHub Projects sert au suivi operationnel ;
il ne remplace pas ces documents de reference.
