import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { ModeToggle } from "@/components/toggle-theme";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>
        <Link href="/dashboard">Dashboard</Link>
      </Button>
      <ModeToggle />
    </div>
  );
};

export default page;
