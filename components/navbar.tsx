"use client";
import { cn } from "@/lib/utils";
import {
  ClerkLoaded,
  Show,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add new", href: "/books/new" },
];

const Navbar = () => {
  const pathName = usePathname();
  const { user } = useUser();
  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href={"/"} className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified Logo"
            width={42}
            height={26}
            style={{ width: 42, height: 26 }} // TODO: remove this style when deployment
          />
          <p className="logo-text">Bookified</p>
        </Link>
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            const isActive =
              pathName === href || (href !== "/" && pathName.startsWith(href));
            return (
              <Link
                key={label}
                href={href}
                className={cn(
                  "nav-link-base",
                  isActive ? "nav-link-active" : "hover:text-(--warning)"
                )}
              >
                {label}
              </Link>
            );
          })}
          <ClerkLoaded>
            <div className="flex gap-7.5 items-center">
              <Show when="signed-out">
                <SignInButton mode="modal" />
              </Show>
              <Show when="signed-in">
                <div className="nav-user-link">
                  <UserButton />
                  {user?.firstName && (
                    <Link href={"/subscriptions"} className="nav-user-name">
                      {user.firstName}
                    </Link>
                  )}
                </div>
              </Show>
            </div>
          </ClerkLoaded>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
