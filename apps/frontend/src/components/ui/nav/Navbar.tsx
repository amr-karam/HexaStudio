"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useToggle } from "@/hooks/useToggle";
import { useThrottledCallback } from "@/hooks/useThrottledValue";
import dynamic from "next/dynamic";
import { Magnetic } from "@/components/ui/Magnetic";
import { useHEXAMotion } from "@/hooks/useHEXAMotion";

const CurrencySelector = dynamic(() => import("@/features/currency/CurrencySelector").then((m) => ({ default: m.CurrencySelector })), { ssr: false });
const NavbarMobileMenu = dynamic(() => import("./NavbarMobileMenu").then((m) => ({ default: m.NavbarMobileMenu })), { ssr: false });

interface NavDropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface NavDropdown {
  label: string;
  items: NavDropdownItem[];
}

interface NavLinkItem {
  label: string;
  href: string;
  dropdown?: NavDropdown;
  isPremium?: boolean;
}

const NAV_STRUCTURE: NavLinkItem[] = [
  {
    label: "Portfolio",
    href: "/projects",
    dropdown: {
      label: "Portfolio",
      items: [
        { label: "Residential", href: "/projects?category=residential", description: "Luxury homes & villas" },
        { label: "Commercial", href: "/projects?category=commercial", description: "Offices, retail & mixed-use" },
        { label: "Hospitality", href: "/projects?category=hospitality", description: "Hotels, resorts & spas" },
        { label: "Urban Planning", href: "/projects?category=urban", description: "Master planning & landscape" },
        { label: "All Projects", href: "/projects", description: "View complete archive" },
      ],
    },
  },
  {
    label: "Services",
    href: "/services",
    dropdown: {
      label: "Services",
      items: [
        { label: "Architectural Viz", href: "/services#arch-viz", description: "Photorealistic rendering" },
        { label: "3D Modeling", href: "/services#modeling", description: "Detailed digital twins" },
        { label: "Animation", href: "/services#animation", description: "Cinematic walkthroughs" },
        { label: "Interactive 3D", href: "/services#interactive", description: "Real-time WebGL experiences" },
        { label: "360° Tours", href: "/services#tours", description: "Immersive panoramic tours" },
      ],
    },
  },
  { label: "Blog", href: "/blog" },
  {
    label: "Studio",
    href: "/about",
    dropdown: {
      label: "Studio",
      items: [
        { label: "About Us", href: "/about", description: "Our story & philosophy" },
        { label: "Team", href: "/about#team", description: "The people behind the work" },
        { label: "Careers", href: "/careers", description: "Join our creative team" },
      ],
    },
  },
  { label: "Contact", href: "/contact" },
];

/* ── NavDropdownPanel ─────────────────────────────────────────────────── */
const NavDropdownPanel = ({
  dropdown,
  isOpen,
  onClose,
}: {
  dropdown: NavDropdown;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label={`${dropdown.label} submenu`}
      className={cn(
        "absolute top-full left-1/2 -translate-x-1/2 pt-4 w-72 origin-top transition-all duration-300",
        isOpen
          ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
      )}
      onMouseLeave={onClose}
    >
      {/* Gold hairline border */}
      <div className="relative bg-sl-obsidian/95 backdrop-blur-2xl border border-sl-gold-subtle/20 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/40 to-transparent" />
        <div className="p-3 space-y-0.5">
          {dropdown.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="group flex flex-col gap-0.5 rounded-xl px-4 py-3 hover:bg-sl-gold-subtle/5 transition-colors duration-300"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-300">
                {item.label}
              </span>
              {item.description && (
                <span className="text-[10px] text-sl-mist/50 leading-relaxed">
                  {item.description}
                </span>
              )}
            </Link>
          ))}
        </div>
        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-sl-gold-subtle/20 to-transparent" />
      </div>
    </div>
  );
};

/* ── NavItem with Dropdown ─────────────────────────────────────────────── */
const NavItemWithDropdown = ({
  item,
  active,
  onToggle,
  isOpen,
  onClose,
}: {
  item: NavLinkItem;
  active: boolean;
  onToggle: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <div className="relative" onMouseLeave={onClose}>
      <Magnetic>
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className={cn(
            "group relative flex items-center gap-1.5 py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500 cursor-pointer",
            active ? "text-sl-gold-hover" : "text-sl-mist/60 hover:text-sl-alabaster"
          )}
        >
          {item.label}
          {/* Chevron indicator */}
          <svg
            className={cn(
              "w-2.5 h-2.5 transition-transform duration-300",
              isOpen && "rotate-180"
            )}
            viewBox="0 0 10 6"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L5 5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Gold underline on active */}
          <span
            aria-hidden="true"
            className={cn(
              "absolute -bottom-1 inset-x-0 h-[1px] transition-colors duration-500",
              active || isOpen
                ? "bg-sl-gold-subtle"
                : "bg-transparent group-hover:bg-sl-gold-subtle/40"
            )}
          />
        </button>
      </Magnetic>
      {item.dropdown && (
        <NavDropdownPanel
          dropdown={item.dropdown}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </div>
  );
};

/* ── Plain Nav Link ───────────────────────────────────────────────────── */
const NavLink = ({
  item,
  active,
}: {
  item: NavLinkItem;
  active: boolean;
}) => (
  <Magnetic>
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-1.5 py-2 text-xs uppercase tracking-[0.3em] transition-colors duration-500",
        active ? "text-sl-gold-hover" : "text-sl-mist/60 hover:text-sl-alabaster"
      )}
    >
      {item.label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute -bottom-1 inset-x-0 h-[1px] transition-colors duration-500",
          active
            ? "bg-sl-gold-subtle"
            : "bg-transparent group-hover:bg-sl-gold-subtle/40"
        )}
      />
    </Link>
  </Magnetic>
);

/* ── Main Navbar ──────────────────────────────────────────────────────── */
export const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, toggleMenu, , closeMenuRaw] = useToggle(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const lastScrollY = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuTrapRef = useRef<HTMLDivElement>(null);
  const { reduced } = useHEXAMotion();

  const handleScroll = useThrottledCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 20);
    if (currentScrollY < 20) {
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY.current) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  }, 100);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useScrollLock(isMenuOpen, { inertSelector: "#main-content" });

  useKeyboardShortcut("Escape", () => {
    if (isMenuOpen) closeMenuRaw();
    if (openDropdown) setOpenDropdown(null);
  }, { target: "document" });

  useFocusTrap(menuTrapRef, isMenuOpen);

  useEffect(() => {
    if (isMenuOpen) {
      closeMenuRaw();
      triggerRef.current?.focus();
    }
    setOpenDropdown(null);
  }, [pathname]);

  const closeMenu = useCallback(() => {
    closeMenuRaw();
    setOpenDropdown(null);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, [closeMenuRaw]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 sm:px-8 lg:px-16 transition-all duration-700",
          isScrolled
            ? "py-4 bg-sl-void/80 backdrop-blur-2xl border-b border-sl-silver/20"
            : "py-8 bg-transparent",
          isVisible ? "translate-y-0" : "-translate-y-full"
        )}
      >
        {/* Logo */}
        <Magnetic strength={0.25}>
          <Link href="/" className="group flex items-center gap-3">
            <div className="transition-transform duration-500 hover:rotate-90">
              <Image
                src="/logo.svg"
                alt="HexaStudio Logo"
                width={32}
                height={32}
                priority
                className="transition-transform duration-500"
              />
            </div>
            <span className="text-xs sm:text-sm lg:text-base font-medium uppercase tracking-[0.4em] text-sl-alabaster group-hover:text-sl-gold-hover transition-colors duration-500">
              HexaStudio
            </span>
          </Link>
        </Magnetic>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-10">
          {NAV_STRUCTURE.map((item) =>
            item.dropdown ? (
              <NavItemWithDropdown
                key={item.href}
                item={item}
                active={isActive(item.href)}
                onToggle={() =>
                  setOpenDropdown((prev) =>
                    prev === item.href ? null : item.href
                  )
                }
                isOpen={openDropdown === item.href}
                onClose={() => setOpenDropdown(null)}
              />
            ) : (
              <NavLink key={item.href} item={item} active={isActive(item.href)} />
            )
          )}
          {/* Premium CTA */}
          <Magnetic strength={0.25}>
            <Link
              href="/premium-chat"
              aria-label="Premium Chat"
              className="group relative inline-flex items-center gap-2 px-5 py-2 border border-sl-gold-subtle/30 text-xs uppercase tracking-[0.3em] text-sl-gold-hover hover:bg-sl-gold-subtle/10 hover:border-sl-gold-subtle/60 transition-all duration-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 3l1.9 4.1L18 9l-4.1 1.9L12 15l-1.9-4.1L6 9l4.1-1.9z" />
              </svg>
              Premium
            </Link>
          </Magnetic>
          <CurrencySelector />
        </div>

        {/* Mobile hamburger */}
        <Magnetic strength={0.25} className="lg:hidden">
          <button
            ref={triggerRef}
            onClick={toggleMenu}
            className="flex flex-col gap-1.5 py-2"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span
              className={cn(
                "block h-[1px] w-6 bg-sl-alabaster transition-transform duration-300",
                isMenuOpen && "rotate-45 translate-y-[6px]"
              )}
            />
            <span
              className={cn(
                "block h-[1px] w-6 bg-sl-alabaster transition-all duration-300",
                isMenuOpen && "opacity-0 -translate-x-2.5"
              )}
            />
            <span
              className={cn(
                "block h-[1px] w-6 bg-sl-alabaster transition-transform duration-300",
                isMenuOpen && "-rotate-45 -translate-y-[6px]"
              )}
            />
          </button>
        </Magnetic>
      </nav>

      {/* Mobile menu */}
      <div ref={menuTrapRef}>
        <NavbarMobileMenu
          isOpen={isMenuOpen}
          onClose={closeMenu}
          navItems={NAV_STRUCTURE}
          pathname={pathname}
          reduced={reduced}
        />
      </div>
    </>
  );
};
