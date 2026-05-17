"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Профиль", icon: User },
  { href: "/groups", label: "Группы", icon: Users },
];

export function TabBar() {
  const pathname = usePathname();

  const activeTab = tabs.findIndex((t) => {
    if (t.href === "/") return pathname === "/";
    return pathname.startsWith(t.href);
  });

  return (
    <nav className="sticky bottom-0 z-50 border-t border-graphite-light/30 bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg">
        {tabs.map((tab, i) => {
          const isActive = i === activeTab;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs transition-colors",
                isActive
                  ? "text-orange-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
