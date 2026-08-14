import type { ReactNode } from "react";
import { adminPortal } from "@/lib/admin";
import { AdminSidebar } from "./admin-sidebar";
import { Topbar } from "./topbar";

type PortalShellProps = {
  children: ReactNode;
};

export function PortalShell({ children }: PortalShellProps) {
  return (
    <div className="portal-grid min-h-screen bg-background">
      <AdminSidebar navigation={adminPortal.navigation} />
      <div className="min-w-0">
        <Topbar
          customer={adminPortal.operator}
          navigation={adminPortal.navigation}
        />
        <main
          id="portal-content"
          className="portal-backdrop min-h-[calc(100vh-5rem)]"
        >
          <div className="mx-auto w-full max-w-[96rem] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
