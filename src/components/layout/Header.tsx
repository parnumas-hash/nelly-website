"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";
import SearchModal from "./SearchModal";
import CartDrawer from "./CartDrawer";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#brands", label: "Brands" },
  { href: "/shop?sort=newest", label: "New" },
  { href: "/#about", label: "About" },
  { href: "/#stores", label: "Stores" },
];

function isNavLinkActive(
  pathname: string,
  searchParams: URLSearchParams,
  currentHash: string,
  href: string
): boolean {
  const hashIndex = href.indexOf("#");
  const beforeHash = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const linkHash = hashIndex >= 0 ? href.slice(hashIndex) : "";

  const queryIndex = beforeHash.indexOf("?");
  const linkPath =
    queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash || "/";
  const linkQuery = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : "";

  const pathMatches =
    linkPath === "/"
      ? pathname === "/"
      : pathname === linkPath || pathname.startsWith(`${linkPath}/`);

  if (linkHash) {
    return pathMatches && currentHash === linkHash;
  }

  if (!pathMatches) return false;

  if (linkQuery) {
    const expected = new URLSearchParams(linkQuery);
    for (const [key, value] of expected.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  }

  if (linkPath === "/shop") {
    return searchParams.get("sort") !== "newest";
  }

  if (linkPath === "/" && pathname === "/") {
    return currentHash === "";
  }

  return true;
}

export default function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");
  const { totalItems, setIsOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();
  const isHome = pathname === "/";

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleHomeNav = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-40 w-full transition-all duration-500",
          scrolled
            ? "bg-white/90 shadow-sm backdrop-blur-xl dark:bg-neutral-950/90"
            : isHome
              ? "bg-white/55 backdrop-blur-md dark:bg-neutral-950/45"
              : "bg-white/80 backdrop-blur-md dark:bg-neutral-950/80"
        )}
      >
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
          <Logo
            size="md"
            priority
            framed={false}
            className=""
          />

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={link.href === "/" ? handleHomeNav : undefined}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors hover:text-primary",
                  isNavLinkActive(pathname, searchParams, currentHash, link.href)
                    ? "text-primary"
                    : "text-neutral-600 dark:text-neutral-400"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <ThemeToggle />
            <Link
              href="/wishlist"
              className="relative hidden h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 sm:flex"
            >
              <Heart className="h-4 w-4" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              href="/login"
              className="hidden h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 sm:flex"
            >
              <User className={cn("h-4 w-4", isAuthenticated && "text-primary")} />
            </Link>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
              aria-label="Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 flex h-full w-72 flex-col bg-white p-6 dark:bg-neutral-950 md:hidden"
            >
              <div className="mb-8 flex items-center justify-between">
                <Logo size="md" href="/" />
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {[...navLinks, { href: "/login", label: "Account" }].map(
                  (link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={link.href === "/" ? handleHomeNav : undefined}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        isNavLinkActive(pathname, searchParams, currentHash, link.href)
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <CartDrawer />
    </>
  );
}
