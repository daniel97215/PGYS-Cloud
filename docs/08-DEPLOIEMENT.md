# PGYS — Déploiement

## Objectif

Déployer PGYS de manière reproductible, simple et sécurisée.

## Environnements

### Local

Utilisé sur Windows 11 avec Cursor.

Services :

- Next.js ;
- NestJS ;
- PostgreSQL local via Docker ;
- Redis local si nécessaire.

### Production

Serveur dédié principal.

Services :

- reverse proxy ;
- Nextcloud ;
- MariaDB ;
- Redis ;
- site ;
- API ;
- admin ;
- monitoring.

## Principe

Le serveur de production ne doit pas être utilisé comme environnement de développement.

Le code est développé localement, versionné avec Git, puis déployé.

## Déploiement initial

Étapes :

1. build de l’application ;
2. copie ou pull Git sur serveur ;
3. chargement `.env`;
4. `docker compose up -d`;
5. vérification des logs ;
6. vérification HTTP ;
7. monitoring.

## Variables d’environnement

Chaque application doit fournir un `.env.example`.

Aucun `.env` réel ne doit être commité.

## Rollback

Le rollback doit être possible via Git :

```bash
git checkout <ancien_commit>
docker compose up -d --build
```

## DNS

Les sous-domaines doivent pointer vers le serveur principal.

## HTTPS

Les certificats sont gérés par Nginx Proxy Manager.

## Vérifications après déploiement

- site accessible ;
- admin accessible ;
- API healthcheck OK ;
- Nextcloud accessible ;
- logs sans erreur critique ;
- Uptime Kuma vert.

## Règle

Un déploiement non documenté est considéré comme fragile.
