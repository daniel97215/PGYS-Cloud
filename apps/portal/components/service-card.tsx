import { Badge, Card, Icon } from "@pgys/ui";
import type { PortalService } from "@/lib/mock";

type ServiceCardProps = {
  service: PortalService;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const statusVariant = service.status === "Disponible" ? "brand" : "success";

  return (
    <Card
      as="article"
      className="group flex min-h-64 flex-col p-6 transition duration-300 hover:-translate-y-1 hover:border-brand/30"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-12 place-items-center rounded-pgys-lg bg-brand-soft text-brand">
          <Icon name={service.icon} size="lg" />
        </span>
        <Badge variant={statusVariant}>{service.status}</Badge>
      </div>
      <h3 className="mt-6 text-xl font-bold text-content">{service.title}</h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-content-muted">
        {service.description}
      </p>
      <p className="mt-6 border-t border-border pt-4 text-xs font-semibold text-content-muted">
        {service.detail}
      </p>
    </Card>
  );
}
