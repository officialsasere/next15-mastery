// src/components/Navbar.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Logo from "../../public/logoblack.png"

export default async function Navbar() {
  const user = await currentUser();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-50  ">
      <div className="container flex h-16 items-center justify-between px-4 max-w-6xl mx-auto">
        <Link href="/" className="font-bold text-xl hover:opacity-80 transition-opacity">
          <Image
          src={Logo}
          alt="Brand Identifier"
          width={50}
          height={50}
          loading="eager"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignInButton mode="modal">
              <Button>Sign Up</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            {user && (
              <>
             
                <Button asChild size="sm">
                  <Link href="/dashboard">Create Post</Link>
                </Button>
              </>
            )}
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}