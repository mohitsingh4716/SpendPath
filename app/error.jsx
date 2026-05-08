"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application route error:", error);
  }, [error]);

  return (
    <div className="container mx-auto my-32 px-5 text-center space-y-4">
      <h1 className="text-3xl font-bold gradient-title">Something went wrong</h1>
      <p className="text-muted-foreground">
        SpendPath could not finish loading this page. Please try again.
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
