# Contribuer a PGYS

Merci de contribuer a PGYS. Toute contribution doit rester ciblee, lisible et
coherente avec la vision du produit.

## Avant de commencer

1. Lire `docs/00-VISION.md`, `docs/01-PRODUIT.md`,
   `docs/02-ARCHITECTURE.md` et `docs/05-DEVELOPPEMENT.md`.
2. Verifier qu'une issue decrit le besoin et son perimetre.
3. Ne jamais placer de secret, d'identifiant ou de donnee client dans Git.

## Installation locale

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Utiliser pnpm pour toute operation sur le monorepo. Une dependance ne doit etre
ajoutee que lorsqu'elle est necessaire et justifiee par le changement.

## Branches et commits

Creer une branche depuis la branche de developpement appropriee :

```text
feature/pgys-xxx-description
```

Les commits suivent de preference le format `type(scope): message`, par
exemple `feat(website): add contact form` ou `docs: clarify deployment`.

## Qualite

Avant d'ouvrir une pull request, executer :

```bash
pnpm build
pnpm lint
pnpm typecheck
```

Ajouter ou adapter les tests lorsqu'un comportement couvert evolue. Ne pas
inclure de refactorisation sans rapport avec l'issue traitee.

## Pull requests

- une pull request traite une seule issue ;
- le titre et la description expliquent clairement le changement ;
- l'issue PGYS concernee est referencee ;
- les impacts sur la configuration, la documentation et la securite sont notes ;
- les controles automatises doivent reussir avant la fusion.

En participant, vous acceptez le [code de conduite](CODE_OF_CONDUCT.md).
