"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function AccountError({ error, reset }) {
  useEffect(() => {
    console.error("Account page error:", error);
  }, [error]);

  return (
    <div className="space-y-4 px-5 text-center">
      <h1 className="text-3xl font-bold gradient-title">Unable to load account</h1>
      <p className="text-muted-foreground">
        Refreshing this account hit a recoverable error.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
