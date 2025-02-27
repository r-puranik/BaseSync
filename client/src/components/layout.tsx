import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { SiGithub } from "react-icons/si";
import { LayoutDashboard, Settings, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard
  },
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 border-b bg-card z-50">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <SiGithub className="h-6 w-6" />
            <span className="font-semibold">BaseSync</span>
          </div>

          <div className="flex items-center space-x-6 ml-8">
            {NAV_ITEMS.map(item => (
              <Link key={item.href} href={item.href}>
                <a className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary",
                  location === item.href ? "text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <main className="container pt-20 pb-8 px-4">
        {children}
      </main>
    </div>
  );
}