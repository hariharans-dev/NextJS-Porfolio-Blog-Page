"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { config } from "@/config";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { FunctionComponent } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface MenuItem {
  name: string;
  href: string;
  openInNewTab?: boolean;
}

const homeMenuItems: MenuItem[] = [
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

const defaultMenuItems: MenuItem[] = [
  { name: "Home", href: "/" },
  { name: "About", href: "/blog/about" },
  { name: "Contact", href: "/blog/contact" },
  { name: "Admin", href: "/blog/admin/signin", openInNewTab: true },
];

const adminMenuItems: MenuItem[] = [
  { name: "Home", href: "/blog/admin/dashboard" },
  { name: "All Messages", href: "/blog/admin/dashboard/allMessages" },
  { name: "Unread Messages", href: "/blog/admin/dashboard/unreadMessages" },
  { name: "Mail", href: "/blog/admin/dashboard/mail" },
];

export const Navigation: FunctionComponent<{ menuItems: MenuItem[] }> = ({
  menuItems,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigation = (href: string, openInNewTab: boolean) => {
    if (openInNewTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }
    router.push(href);
  };

  return (
    <nav>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center">
        {menuItems.map((item) => (
          <div key={item.href} className="ml-4 md:ml-8">
            <button
              onClick={() =>
                handleNavigation(item.href, item.openInNewTab || false)
              }
              className={cn(
                "hover:text-gray-500 transition-colors",
                pathname === item.href && "font-semibold"
              )}
            >
              {item.name}
            </button>
          </div>
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger aria-label="Open Menu">
            <Menu size={24} />
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <VisuallyHidden>
                <SheetTitle>Navigation Menu</SheetTitle>
              </VisuallyHidden>
            </SheetHeader>

            <nav className="flex flex-col space-y-4 mt-4 px-4">
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() =>
                    handleNavigation(item.href, item.openInNewTab || false)
                  }
                  className={cn(
                    "text-lg hover:text-gray-500 transition-colors text-left",
                    pathname === item.href && "font-semibold"
                  )}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export const Header: FunctionComponent = () => {
  const pathname = usePathname();
  const router = useRouter();

  const isAdminPath = pathname.startsWith("/blog/admin");
  const isAdminSignin = pathname === "/blog/admin/signin";

  if (isAdminSignin) return null;

  const menuItems = isAdminPath
    ? adminMenuItems
    : pathname.startsWith("/blog")
    ? defaultMenuItems
    : homeMenuItems;

  const blogName = isAdminPath
    ? "Admin Panel"
    : pathname.startsWith("/blog")
    ? config.blog.name
    : config.home?.name || "Hariharan";

  const blogNameRedirection = isAdminPath
    ? "/blog/admin/dashboard"
    : pathname.startsWith("/blog")
    ? "/blog"
    : "/";

  const handleLogoClick = () => {
    router.push(blogNameRedirection);
  };

  return (
    <section
      key={
        isAdminPath ? "admin" : pathname.startsWith("/blog") ? "blog" : "home"
      }
      className="flex items-center justify-between mt-8 md:mt-16 mb-12 
               px-4 md:px-0"
    >
      <button onClick={handleLogoClick}>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
          {blogName}
        </h1>
      </button>
      {menuItems.length > 0 && <Navigation menuItems={menuItems} />}
    </section>
  );
};
