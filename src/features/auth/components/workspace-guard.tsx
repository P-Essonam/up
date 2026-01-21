import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export const WorkspaceGuard = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { organizationId } = await withAuth({ ensureSignedIn: true });

  if (!organizationId) {
    return redirect("/onboarding");
  }

  return <>{children}</>;
};
