# PGYS — Sécurité

## Objectif

Définir les règles minimales de sécurité pour PGYS.

## Principes

- minimiser l’exposition ;
- limiter les accès ;
- sauvegarder ;
- tracer ;
- mettre à jour ;
- documenter.

## Secrets

Interdit :

- secrets dans Git ;
- mots de passe dans le code ;
- clés API dans les tickets ;
- copier des secrets dans des logs publics.

Obligatoire :

- `.env`;
- gestion stricte des accès ;
- rotation si fuite suspectée.

## Serveur

Mesures minimales :

- UFW actif ;
- SSH limité ;
- authentification forte ;
- Fail2Ban ;
- mises à jour régulières ;
- ports publics réduits à 80, 443 et SSH si nécessaire.

## Docker

Règles :

- pas de conteneur inutile ;
- images officielles ou reconnues ;
- volumes séparés ;
- logs surveillés ;
- redémarrage automatique contrôlé.

## Nextcloud

À vérifier :

- trusted domains ;
- trusted proxies ;
- HTTPS forcé ;
- cron actif ;
- sauvegardes ;
- mises à jour testées.

## Données clients

Les données clients doivent être traitées comme sensibles.

Règles :

- accès limité ;
- sauvegarde chiffrée recommandée ;
- suppression documentée ;
- restauration testée.

## Sauvegardes

Une sauvegarde n’est valide que si une restauration a été testée.

## Accès admin

Les interfaces admin doivent être protégées.

Mesures recommandées :

- mot de passe fort ;
- 2FA dès que possible ;
- accès restreint ;
- logs.

## Incident

En cas d’incident :

1. isoler le service ;
2. préserver les logs ;
3. identifier la cause ;
4. corriger ;
5. restaurer si nécessaire ;
6. documenter ;
7. prévenir les clients si impact.

## Règle finale

La sécurité doit rester proportionnée au stade du projet, mais elle ne doit jamais être ignorée.
