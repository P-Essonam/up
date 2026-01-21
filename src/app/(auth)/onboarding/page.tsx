import { withAuth } from "@workos-inc/authkit-nextjs";
import { OnboardingWizard } from "@/features/auth/components/onboarding-wizard";

const OnboardingPage = async () => {
  const { user } = await withAuth({
    ensureSignedIn: true,
  });

  return (
    <OnboardingWizard
      userFirstName={user?.firstName}
      userLastName={user?.lastName}
    />
  );
};

export default OnboardingPage;
