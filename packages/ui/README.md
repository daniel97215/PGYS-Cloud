# @pgys/ui

Design System partagé de PGYS. Le package expose des composants React
accessibles, les tokens de marque et les styles Tailwind communs au site, au
dashboard, à l’administration et au portail client.

## Installation dans une application du monorepo

```json
{
  "dependencies": {
    "@pgys/ui": "workspace:*"
  }
}
```

Importer une fois les styles globaux :

```css
@import "tailwindcss";
@import "@pgys/ui/styles.css";
```

Puis importer les composants depuis le point d’entrée :

```tsx
import { Button, Card, Input } from "@pgys/ui";
```

## Composants

- `Button` : action ou lien, avec variantes et tailles.
- `Card` : conteneur visuel pour contenu groupé.
- `Input` et `Textarea` : champs avec label, aide et erreur accessibles.
- `Badge` : statut ou catégorie courte.
- `Alert` : message d’information, succès, avertissement ou erreur.
- `Avatar` : image ou initiales de remplacement.
- `Container` et `Section` : structure responsive des pages.
- `Heading` : titre de section avec surtitre et description.
- `Logo` : signature typographique PGYS.
- `Navbar` et `Footer` : navigation globale pilotée par des données.
- `Icon` : jeu d’icônes SVG interne, sans dépendance externe.

Chaque composant accepte `className` pour les adaptations de mise en page sans
dupliquer ses styles fondamentaux. Les composants interactifs conservent un
focus visible et les champs exposent leurs états aux technologies d’assistance.

## Tokens

Les objets `colors`, `typography`, `spacing`, `radii` et `shadows` sont exportés
pour les usages TypeScript. Les mêmes valeurs sont disponibles via les classes
Tailwind sémantiques définies dans `styles.css`.

Le mode sombre est prêt via la classe `.dark` sur un élément parent. Il n’est
pas activé automatiquement afin de laisser chaque application choisir sa
stratégie de thème.
