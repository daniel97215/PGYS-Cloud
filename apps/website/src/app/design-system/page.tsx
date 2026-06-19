import type { Metadata } from "next";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Footer,
  Heading,
  Icon,
  Input,
  Logo,
  Navbar,
  Section,
  Textarea,
} from "@pgys/ui";
import type { IconName } from "@pgys/ui";

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Composants, tokens et principes visuels partagés des interfaces PGYS.",
};

const navigation = [
  { label: "Fondations", href: "#fondations" },
  { label: "Composants", href: "#composants" },
  { label: "Mode sombre", href: "#mode-sombre" },
];

const palette = [
  { name: "Brand", value: "#2563EB", className: "bg-brand" },
  { name: "Brand dark", value: "#1E3A8A", className: "bg-brand-dark" },
  { name: "Content", value: "#0F172A", className: "bg-content" },
  { name: "Muted", value: "#475569", className: "bg-content-muted" },
  { name: "Mist", value: "#F8FAFC", className: "bg-surface-muted" },
  { name: "Success", value: "#10B981", className: "bg-success" },
  { name: "Warning", value: "#F59E0B", className: "bg-warning" },
  { name: "Danger", value: "#EF4444", className: "bg-danger" },
];

const iconNames: IconName[] = [
  "cloud",
  "apps",
  "hosting",
  "backup",
  "check",
  "arrowRight",
  "info",
  "warning",
  "error",
  "menu",
];

type PreviewProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

function ComponentPreview({ children, description, title }: PreviewProps) {
  return (
    <Card as="article" className="p-6 sm:p-8">
      <h3 className="text-xl font-bold text-content">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-content-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </Card>
  );
}

export default function DesignSystemPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background text-content">
      <Navbar
        brandLabel="PGYS UI"
        links={navigation}
        action={{ label: "Retour au site", href: "/" }}
        sticky={false}
      />

      <main>
        <Section spacing="lg">
          <Container>
            <Badge variant="brand">Documentation interne</Badge>
            <Heading
              as="h1"
              className="mt-6"
              title="Design System PGYS"
              description="Une base visuelle cohérente, accessible et réutilisable pour toutes les interfaces PGYS."
            />
          </Container>
        </Section>

        <Section
          id="fondations"
          aria-labelledby="foundations-title"
          tone="muted"
        >
          <Container>
            <Heading
              id="foundations-title"
              eyebrow="Fondations"
              title="Une identité commune"
              description="Les tokens évitent les valeurs arbitraires et préparent les composants aux évolutions de marque."
            />

            <div className="mt-12 grid gap-8">
              <ComponentPreview
                title="Palette de couleurs"
                description="Couleurs de marque et couleurs sémantiques utilisées dans tous les produits."
              >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {palette.map((color) => (
                    <div
                      key={color.name}
                      className="overflow-hidden rounded-pgys-lg border border-border bg-surface"
                    >
                      <div className={`h-24 ${color.className}`} />
                      <div className="p-4">
                        <p className="font-bold text-content">{color.name}</p>
                        <p className="mt-1 font-mono text-xs text-content-muted">
                          {color.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ComponentPreview>

              <div className="grid gap-8 lg:grid-cols-2">
                <ComponentPreview
                  title="Typographie"
                  description="Une hiérarchie courte pour des interfaces professionnelles et faciles à parcourir."
                >
                  <div className="space-y-5">
                    <p className="text-4xl font-black tracking-tight">Titre principal</p>
                    <p className="text-2xl font-bold">Titre de section</p>
                    <p className="text-lg font-semibold">Sous-titre</p>
                    <p className="leading-7 text-content-muted">
                      Texte courant avec une hauteur de ligne confortable pour la
                      lecture sur écran.
                    </p>
                    <p className="text-sm text-content-muted">Texte secondaire</p>
                  </div>
                </ComponentPreview>

                <ComponentPreview
                  title="Espacements"
                  description="Une échelle basée sur quatre pixels rythme les composants et les pages."
                >
                  <div className="space-y-4">
                    {[
                      ["4", "w-4"],
                      ["8", "w-8"],
                      ["16", "w-16"],
                      ["24", "w-24"],
                      ["32", "w-32"],
                      ["48", "w-48"],
                    ].map(([label, width]) => (
                      <div key={label} className="flex items-center gap-4">
                        <span className="w-8 text-xs text-content-muted">
                          {label}px
                        </span>
                        <span className={`h-3 rounded-full bg-brand ${width}`} />
                      </div>
                    ))}
                  </div>
                </ComponentPreview>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <ComponentPreview
                  title="Radius et ombres"
                  description="Des angles doux et des élévations discrètes structurent l’information."
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-pgys-sm border border-border bg-surface-muted p-6 text-sm">
                      Small
                    </div>
                    <div className="rounded-pgys-md border border-border bg-surface-muted p-6 text-sm shadow-pgys-sm">
                      Medium
                    </div>
                    <div className="rounded-pgys-lg border border-border bg-surface-muted p-6 text-sm shadow-pgys-card">
                      Large
                    </div>
                    <div className="rounded-pgys-xl border border-border bg-surface-muted p-6 text-sm shadow-pgys-elevated">
                      Extra large
                    </div>
                  </div>
                </ComponentPreview>

                <ComponentPreview
                  title="Icônes"
                  description="Jeu SVG interne cohérent, décoratif par défaut et nommable si nécessaire."
                >
                  <div className="flex flex-wrap gap-4">
                    {iconNames.map((name) => (
                      <div
                        key={name}
                        className="grid size-14 place-items-center rounded-pgys-lg bg-brand-soft text-brand"
                        title={name}
                      >
                        <Icon name={name} size="lg" />
                      </div>
                    ))}
                  </div>
                </ComponentPreview>
              </div>
            </div>
          </Container>
        </Section>

        <Section id="composants" aria-labelledby="components-title">
          <Container>
            <Heading
              id="components-title"
              eyebrow="Composants"
              title="Primitives réutilisables"
              description="Chaque composant accepte des données et des variantes sans embarquer de contenu métier."
            />

            <div className="mt-12 grid gap-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <ComponentPreview
                  title="Button"
                  description="Actions principales, secondaires, discrètes et destructives."
                >
                  <div className="flex flex-wrap gap-3">
                    <Button>Principal</Button>
                    <Button variant="secondary">Secondaire</Button>
                    <Button variant="subtle">Discret</Button>
                    <Button variant="danger">Supprimer</Button>
                    <Button disabled>Désactivé</Button>
                  </div>
                </ComponentPreview>

                <ComponentPreview
                  title="Badge et Avatar"
                  description="Statuts courts et identité utilisateur avec solution de repli."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>Neutre</Badge>
                    <Badge variant="brand">PGYS</Badge>
                    <Badge variant="success">Actif</Badge>
                    <Badge variant="warning">À vérifier</Badge>
                    <Badge variant="danger">Suspendu</Badge>
                    <Avatar alt="Camille Martin" initials="CM" />
                    <Avatar alt="Équipe PGYS" initials="PG" size="lg" />
                  </div>
                </ComponentPreview>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <ComponentPreview
                  title="Input et Textarea"
                  description="Champs associés à leur label, leur aide et leur état d’erreur."
                >
                  <div className="grid gap-5">
                    <Input
                      id="company"
                      label="Entreprise"
                      placeholder="Nom de votre structure"
                      helperText="Utilisé dans les documents PGYS."
                    />
                    <Input
                      id="email"
                      type="email"
                      label="Adresse email"
                      defaultValue="adresse-invalide"
                      error="Saisissez une adresse email valide."
                    />
                    <Textarea
                      id="message"
                      label="Votre besoin"
                      placeholder="Décrivez votre projet en quelques lignes"
                    />
                  </div>
                </ComponentPreview>

                <ComponentPreview
                  title="Alert"
                  description="Messages contextualisés avec rôle adapté à leur niveau d’urgence."
                >
                  <div className="grid gap-4">
                    <Alert title="Information">
                      La maintenance est planifiée demain matin.
                    </Alert>
                    <Alert title="Sauvegarde terminée" variant="success">
                      Les données sont protégées et vérifiées.
                    </Alert>
                    <Alert title="Action recommandée" variant="warning">
                      Une mise à jour est disponible.
                    </Alert>
                    <Alert title="Service indisponible" variant="danger">
                      Réessayez dans quelques instants.
                    </Alert>
                  </div>
                </ComponentPreview>
              </div>

              <ComponentPreview
                title="Card, Container, Section et Heading"
                description="Les primitives de structure organisent les contenus sans imposer leur métier."
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Card variant="outlined" className="p-5">
                    <p className="font-bold">Outlined</p>
                    <p className="mt-2 text-sm text-content-muted">
                      Pour une séparation légère.
                    </p>
                  </Card>
                  <Card className="p-5">
                    <p className="font-bold">Default</p>
                    <p className="mt-2 text-sm text-content-muted">
                      Pour un contenu mis en avant.
                    </p>
                  </Card>
                  <Card variant="muted" className="p-5">
                    <p className="font-bold">Muted</p>
                    <p className="mt-2 text-sm text-content-muted">
                      Pour une information secondaire.
                    </p>
                  </Card>
                </div>
              </ComponentPreview>

              <ComponentPreview
                title="Logo, Navbar et Footer"
                description="Les composants de marque et de navigation acceptent uniquement des données."
              >
                <div className="flex flex-wrap items-center gap-8 rounded-pgys-lg bg-surface-muted p-6">
                  <Logo />
                  <div className="rounded-pgys-lg bg-slate-950 p-4">
                    <Logo inverse />
                  </div>
                </div>
              </ComponentPreview>
            </div>
          </Container>
        </Section>

        <Section
          id="mode-sombre"
          aria-labelledby="dark-title"
          tone="muted"
        >
          <Container>
            <Heading
              id="dark-title"
              eyebrow="Mode sombre"
              title="Prêt, sans activation forcée"
              description="La classe dark remplace les tokens sémantiques. Chaque application pourra choisir quand et comment l’activer."
            />
            <div className="dark mt-12 rounded-pgys-xl bg-background p-6 sm:p-10">
              <Card className="max-w-xl p-6">
                <Badge variant="brand">Aperçu sombre</Badge>
                <h3 className="mt-5 text-2xl font-bold text-content">
                  Les mêmes composants, un autre contexte
                </h3>
                <p className="mt-3 leading-7 text-content-muted">
                  Les couleurs de surface, de texte et de bordure s’adaptent sans
                  modifier l’API des composants.
                </p>
                <Button className="mt-6">Action principale</Button>
              </Card>
            </div>
          </Container>
        </Section>
      </main>

      <Footer
        brandLabel="PGYS UI"
        description="Design System partagé des produits numériques PGYS."
        columns={[
          { title: "Documentation", links: navigation },
          { title: "Projet", links: [{ label: "Accueil PGYS", href: "/" }] },
        ]}
        contact={{
          title: "Contact",
          email: "contact@pgys.fr",
          location: "France",
        }}
        copyright={`© ${currentYear} PGYS. Tous droits réservés.`}
        legalNote="Composants accessibles et sans dépendance UI externe."
      />
    </div>
  );
}
