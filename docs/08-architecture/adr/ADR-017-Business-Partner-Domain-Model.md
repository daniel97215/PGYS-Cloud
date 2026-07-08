ADR-017 - Business Partner Domain Model

## Statut

Accepte.

## Contexte

Le domaine actuellement nomme "Customers" est trop restrictif pour les futurs modules PGYS.

Les modules ERP, CRM, Marketing, Achats et Facturation manipuleront tous des tiers pouvant jouer plusieurs roles simultanement.

Exemples :

- une entreprise peut etre cliente et fournisseur ;
- un producteur peut devenir client ;
- un partenaire peut egalement etre revendeur ;
- un transporteur peut aussi etre sous-traitant.

Modeliser ces cas avec des entites separees comme Customer, Supplier, Prospect ou Partner creerait de la duplication d'identite, de contacts, d'adresses et de documents.

Cela rendrait aussi les workflows transverses plus fragiles : facturation, achats, CRM, marketing, support et reporting devraient reconciler plusieurs representations du meme tiers.

PGYS a donc besoin d'un modele plus generique et plus durable pour representer les tiers.

## Decision

Le domaine des tiers devient :

```text
Business Partner
```

Le Business Partner represente tout tiers externe ou interne pouvant interagir avec un Workspace.

Il devient l'agregat racine du domaine des tiers.

Le vocabulaire "Customer" reste utilisable comme role fonctionnel, mais il ne doit plus etre considere comme le concept racine du domaine.

## Principes

Un Business Partner :

- possede une identite unique ;
- peut avoir plusieurs roles simultanement ;
- possede des adresses ;
- possede des contacts ;
- possede des categories ;
- possede des documents ;
- possede des notes ;
- possede des tags.

Les roles ne creent pas de nouvelles entites racines.

Ils decrivent simplement les fonctions exercees par le Business Partner dans un contexte metier.

Un meme Business Partner peut donc etre a la fois Customer, Supplier, Partner et Reseller sans duplication de fiche.

Les donnees partagees comme l'identite legale, les contacts, les adresses, les documents et les notes restent rattachees au Business Partner.

## Roles initiaux

Les roles initiaux sont :

- Customer ;
- Prospect ;
- Supplier ;
- Producer ;
- Partner ;
- Reseller ;
- Carrier ;
- Employee ;
- Subcontractor.

Cette liste est extensible.

Tout nouveau role doit decrire une fonction metier generique et reutilisable. Il ne doit pas etre cree pour un cas client trop specifique.

## Consequences

Le module actuellement nomme `customers` deviendra progressivement `business-partners`.

Les futurs modules ERP utiliseront Business Partner comme reference commune pour les tiers.

Les fournisseurs ne seront pas un module separe : ils seront des Business Partners portant le role Supplier.

Les prospects partageront la meme identite que les clients, partenaires ou fournisseurs lorsqu'ils representent la meme organisation ou personne.

Le CRM utilisera Business Partner pour gerer les prospects, clients, contacts et relations commerciales.

Les Achats utiliseront Business Partner pour gerer les fournisseurs, producteurs, transporteurs et sous-traitants.

La Facturation utilisera Business Partner pour identifier les clients factures et les tiers associes aux documents commerciaux.

Les modules transverses devront eviter de creer leur propre representation des tiers.

## Agregat

L'agregat cible est :

```text
BusinessPartner
+-- Addresses
+-- Contacts
+-- Categories
+-- Tags
+-- Notes
+-- Documents
+-- Roles
```

BusinessPartner porte l'identite principale du tiers.

Addresses, Contacts, Categories, Tags, Notes, Documents et Roles sont rattaches a cet agregat.

Les details de persistance, les endpoints et les transitions exactes seront definis dans des tickets dedies.

## Value Objects

Les principaux Value Objects pressentis sont :

- Email ;
- Phone ;
- Postal Address ;
- VAT Number ;
- SIREN/SIRET ;
- IBAN ;
- BIC.

Ces Value Objects devront encapsuler les formats, normalisations et validations locales lorsque le besoin sera implemente.

Ils ne doivent pas contenir d'acces Prisma, de logique API ou de dependance a un module applicatif.

## Impact

Les tickets PGYS-100 a PGYS-113 devront progressivement etre adaptes au nouveau vocabulaire Business Partner.

Aucun refactoring n'est realise dans cet ADR.

Aucune migration n'est introduite par cet ADR.

Aucun endpoint n'est renomme par cet ADR.

Aucun changement du Backlog n'est realise par cet ADR.

Les futurs tickets devront s'appuyer sur cette decision pour eviter d'etendre le domaine `customers` avec un vocabulaire trop restrictif.

## Regles de transition

La transition vers Business Partner doit etre progressive.

Chaque changement futur devra respecter les regles suivantes :

- conserver la compatibilite API tant qu'aucune migration explicite n'est definie ;
- eviter les renommages massifs sans ticket dedie ;
- introduire les roles avant de dupliquer des modules ;
- rattacher les categories, tags, notes, documents, contacts et adresses au Business Partner ;
- documenter tout changement de vocabulaire public.

## Decision officielle

Business Partner est la reference officielle du domaine des tiers PGYS.

Customer, Prospect, Supplier, Producer, Partner, Reseller, Carrier, Employee et Subcontractor sont des roles du Business Partner.

Un role ne justifie pas la creation d'une entite racine separee.
