"use client";

import React, { useState } from "react";
import { useMutation as useConvexMutation } from "convex/react";
import { useTRPC } from "@/trpc/client";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import Image from "next/image";
import { ArrowLeft, ChevronRight, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WORKSPACE_TYPES, MANAGE_TYPES } from "@/features/auth/lib/utils";

export interface OnboardingWizardProps {
  userFirstName?: string | null;
  userLastName?: string | null;
}

export const OnboardingWizard = ({
  userFirstName,
  userLastName,
}: OnboardingWizardProps) => {
  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState<string | null>(null);
  const [manageType, setManageType] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const startOnboarding = useConvexMutation(api.onboarding.startOnboarding);
  const createOrganization = useMutation(
    trpc.organization.createOrganization.mutationOptions({
      onSuccess: async (organization) => {
        await queryClient.invalidateQueries();
        await startOnboarding({
          organizationId: organization.id,
          workspaceType: workspaceType || "unknown",
          manageType: manageType || "unknown",
        });

        await refreshAuth({
          organizationId: organization.id,
        });
        router.push("/dashboard");
      },
      onError: (error) => {
        console.error("Failed to create workspace:", error);
        toast.error("Failed to create workspace. Please try again.");
        setIsLoading(false);
      },
    }),
  );

  const handleNext = () => {
    if (step === 1 && !workspaceType) return;
    if (step === 2 && !manageType) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setIsLoading(true);
    createOrganization.mutate({
      name: workspaceName,
    });
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between p-6 sm:px-10 h-20">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={24}
            height={32}
            className="dark:brightness-125"
          />
          <span className="font-bold text-xl tracking-tight">ClickUp</span>
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          Welcome,{" "}
          <span className="text-foreground">
            {userFirstName} {userLastName}!
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="w-full max-w-5xl relative z-10">
          {/* Step 1: Workspace Type */}
          {step === 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-700 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-12 tracking-tight">
                What will you use this Workspace for?
              </h1>
              <div className="flex flex-wrap justify-center gap-6">
                {WORKSPACE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setWorkspaceType(type.id);
                      setTimeout(() => setStep(2), 400);
                    }}
                    className={cn(
                      "px-10 py-4 rounded-full text-lg font-medium transition-all duration-200",
                      "bg-secondary/20 border border-border hover:bg-secondary/40",
                      workspaceType === type.id &&
                        "bg-secondary border-muted-foreground/50",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Manage Type */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight">
                What would you like to manage?
              </h1>
              <p className="text-muted-foreground mb-12 text-lg">
                Don't worry, you can always add more in the future.
              </p>
              <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
                {MANAGE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setManageType(type.id)}
                    className={cn(
                      "px-6 py-3 rounded-full text-sm font-medium transition-all duration-200",
                      "bg-secondary/20 border border-border/60 hover:bg-secondary/40",
                      manageType === type.id && "border-muted-foreground",
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Workspace Name */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 text-center max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl font-bold mb-6 tracking-tight">
                Name your workspace
              </h1>

              <form onSubmit={handleSubmit} className="mt-16 space-y-10">
                <div className="relative">
                  <Input
                    placeholder="e.g Acme Inc."
                    value={workspaceName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setWorkspaceName(e.target.value)
                    }
                    className="h-14 text-xl px-6 rounded-xl text-center sm:text-left"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="p-6 sm:px-10 flex flex-col gap-8 bg-background">
        {/* Progress Line */}
        <div className="w-full bg-secondary/50 h-[3px] rounded-full overflow-hidden">
          <div
            className="bg-foreground h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto w-full">
          <div>
            {step > 1 && (
              <Button
                variant={"outline"}
                size="lg"
                onClick={handleBack}
                disabled={isLoading}
                className="px-8"
              >
                <ArrowLeft />
                <span>Back</span>
              </Button>
            )}
          </div>

          <div className="flex gap-4">
            {step === 2 && (
              <Button
                size="lg"
                onClick={handleNext}
                disabled={!manageType}
                className=" px-8"
                variant={"outline"}
              >
                <span>Next</span>
                <ChevronRight />
              </Button>
            )}

            {step === 3 && (
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isLoading || !workspaceName.trim()}
                className=" px-8"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span>Finish</span>
                    <Check strokeWidth={3} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
