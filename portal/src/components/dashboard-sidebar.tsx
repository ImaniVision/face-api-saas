"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Aperture,
  Key,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  {
    label: "Live Test",
    href: "/dashboard/chat",
    icon: Aperture,
  },
  {
    label: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
];

const manageItems = [
  {
    label: "Usage",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
];

export function DashboardSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-border/40">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="FaceAuth"
            width={26}
            height={26}
            className="h-[26px] w-[26px]"
          />
          {!collapsed && (
            <span className="text-[15px] font-semibold tracking-tight text-foreground">
              FaceAuth{" "}
              <span className="text-muted-foreground font-normal">
                Platform
              </span>
            </span>
          )}
        </Link>

        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
        >
          {collapsed ?
            <PanelLeft className="h-4 w-4" />
          : <PanelLeftClose className="h-4 w-4" />}
        </button>

        {/* Mobile close */}
        <button
          onClick={onMobileClose}
          className="lg:hidden h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Main items */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive(item.href) ?
                  "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  isActive(item.href) ? "text-foreground" : (
                    "text-muted-foreground"
                  ),
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* Manage Section */}
        <div>
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Manage
            </p>
          )}
          <div className="space-y-1">
            {manageItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive(item.href) ?
                    "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
                )}
              >
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0",
                    isActive(item.href) ? "text-foreground" : (
                      "text-muted-foreground"
                    ),
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {renderSidebarContent()}
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
