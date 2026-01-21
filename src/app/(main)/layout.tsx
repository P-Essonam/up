import React from "react";
import AuthGuard from "@/features/auth/components/auth-guard";
import { WorkspaceGuard } from "@/features/auth/components/workspace-guard";
import DashboardSidebar from "@/components/dashboard-sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <WorkspaceGuard>
        <DashboardSidebar>
          {children}
        </DashboardSidebar>
      </WorkspaceGuard>
    </AuthGuard>
  );
};

export default Layout;
