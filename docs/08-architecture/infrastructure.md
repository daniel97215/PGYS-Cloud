# PGYS — Infrastructure

## Serveur principal

Rôle :

- reverse proxy ;
- Nextcloud ;
- MariaDB ;
- Redis ;
- Uptime Kuma ;
- site public ;
- API future ;
- admin future.

## Serveur secondaire

Rôle :

- sauvegardes ;
- réplication ;
- stockage long terme ;
- restauration en cas d’incident.

## Services actuels

- Nginx Proxy Manager
- Nextcloud
- MariaDB
- Redis
- Uptime Kuma

## Reverse proxy

Nginx Proxy Manager gère :

- les domaines ;
- les certificats SSL ;
- le routage HTTP/HTTPS ;
- les proxys vers les conteneurs.

## DNS

Sous-domaines recommandés :

- `pgys.fr`
- `cloud.pgys.fr`
- `status.pgys.fr`
- `admin.pgys.fr`
- `api.pgys.fr`

## Docker

Tous les services doivent être lancés via Docker Compose.

Les données ne doivent pas être dans Git.

Les volumes doivent être clairement séparés :

```text
/opt/cloud-business/
  nextcloud/
  mariadb/
  redis/
  nginx-proxy-manager/
  uptime-kuma/
```

## Sauvegardes

Objectif :

- sauvegarder les fichiers Nextcloud ;
- sauvegarder MariaDB ;
- sauvegarder la configuration ;
- envoyer une copie vers le serveur secondaire.

Principe :

- dump MariaDB ;
- sauvegarde des volumes ;
- chiffrement ;
- transfert vers serveur secondaire ;
- vérification périodique.

## Monitoring

Uptime Kuma doit surveiller :

- `https://cloud.pgys.fr`
- `https://status.pgys.fr`
- le serveur principal ;
- éventuellement les ports critiques.

## Cron Nextcloud

Nextcloud doit être configuré en mode cron.

Commande :

```bash
docker exec -u www-data nextcloud php -f /var/www/html/cron.php
```

## Sécurité infrastructure

Minimum requis :

- UFW actif ;
- SSH sécurisé ;
- Fail2Ban ;
- mises à jour régulières ;
- ports limités ;
- sauvegardes testées ;
- mots de passe forts ;
- secrets hors Git.

## Règle

Une infrastructure non sauvegardée n’est pas prête pour la production.
