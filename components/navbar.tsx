"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Library", href: "/" },
  { label: "Add new", href: "/books/create" },
];

const Navbar = () => {
  const pathName = usePathname();
  return (
    <header className="w-full fixed z-50 bg-(--bg-primary)">
      <div className="wrapper navbar-height py-4 flex justify-between items-center">
        <Link href={"/"} className="flex gap-0.5 items-center">
          <Image
            src="/assets/logo.png"
            alt="Bookified Logo"
            width={42}
            height={26}
            priority
          />
          <p className="logo-text">Bookified</p>
        </Link>
        <nav className="w-fit flex gap-7.5 items-center">
          {navItems.map(({ label, href }) => {
            // if pathname eq "/", highlight very first link.
            // if pathname !eq "/". check other navs find "href startwith the current pathname" then activate it.
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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
