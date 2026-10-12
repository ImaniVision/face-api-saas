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
  { label: "Live Test", href: "/dashboard/live-test", icon: Aperture },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
];

const manageItems = [{ label: "Usage", href: "/dashboard/usage", icon: BarChart3 }];

interface SidebarContentProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
  isActive: (href: string) => boolean;
}

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Imani Vision" width={26} height={26} className="h-[26px] w-[26px]" />
          {!collapsed && (
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              Imani Vision{" "}
              <span className="font-normal text-ink/50">Console</span>
            </span>
          )}
        </Link>

        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden h-7 w-7 items-center justify-center rounded-md text-ink/50 transition-colors hover:bg-mist hover:text-ink lg:flex"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <button
          onClick={onMobileClose}
          aria-label="Close menu"
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink/50 hover:text-ink lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-mist text-ink"
                  : "text-ink/60 hover:bg-mist/60 hover:text-ink",
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div>
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-ink/40">
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-mist text-ink"
                    : "text-ink/60 hover:bg-mist/60 hover:text-ink",
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}

export function DashboardSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-white transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {renderSidebarContent()}
      </aside>

      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border bg-white transition-all duration-300 lg:flex",
          collapsed ? "w-[60px]" : "w-[240px]",
        )}
      >
        {renderSidebarContent()}
      </aside>
    </>
  );
}
