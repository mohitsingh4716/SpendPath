"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";
import ThemeToggle from "./theme/themeToggle";
import { useEffect, useState } from "react";

export default function ClientHeader() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      
      <div className="hidden md:flex items-center space-x-8">
        <SignedOut>
          <a
            href="#features"
            className="text-gray-600 hover:text-blue-600"
          >
            Features
          </a>
          <a
            href="#testimonials"
            className="text-gray-600 hover:text-blue-600"
          >
            Testimonials
          </a>
        </SignedOut>
      </div>

    
      <div className="flex items-center md:space-x-4 space-x-1">
        <ThemeToggle />

        <SignedIn>
          <Link href="/dashboard">
            <Button variant="outline" className="flex gap-2 text-gray-600  items-center">
              <LayoutDashboard size={18} />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
          </Link>

          <Link href="/transaction/create">
            <Button className="flex items-center gap-2">
              <PenBox size={18} />
              <span className="hidden md:inline">Add Transaction</span>
            </Button>
          </Link>
        </SignedIn>

        <SignedOut>
          <SignInButton forceRedirectUrl="/dashboard">
            <Button variant="outline">Login</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-10 h-10",
              },
            }}
          />
        </SignedIn>
      </div>
    </>
  );
}
