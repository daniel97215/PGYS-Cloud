import type { ReactNode } from "react";
import { portalMock } from "@/lib/mock";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type PortalShellProps = {
  children: ReactNode;
};

export function PortalShell({ children }: PortalShellProps) {
  return (
    <div className="portal-grid min-h-screen bg-background">
      <Sidebar navigation={portalMock.navigation} />
      <div className="min-w-0">
        <Topbar
          customer={portalMock.customer}
          navigation={portalMock.navigation}
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
