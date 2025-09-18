"use client";
import { config } from "@/config";
import { Rss, Github, Twitter, Linkedin, X } from "lucide-react";
import Link from "next/link";
import { FunctionComponent } from "react";
import { DarkModeToggle } from "./DarkModeToggle";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export const Footer: FunctionComponent = () => {
  const pathname = usePathname();

  const socials = [
    {
      href: "https://github.com/admin",
      icon: <Github className="w-4 h-4" />,
      label: "GitHub",
    },
    {
      href: "https://x.com/admin",
      icon: <Twitter className="w-4 h-4" />,
      label: "Twitter",
    },
    {
      href: "https://www.linkedin.com/in/admin/",
      icon: <Linkedin className="w-4 h-4" />,
      label: "LinkedIn",
    },
  ];

  // Determine copyright based on path
  let copyright = config.home.copyright; // default
  if (pathname.startsWith("/blog")) {
    copyright = config.blog.copyright;
  } else if (pathname.startsWith("/admin")) {
    copyright = config.admin?.copyright || config.home.copyright;
  }

  return (
    <section className="mt-8 md:mt-16 mb-12">
      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* Copyright */}
        <div className="text-sm text-muted-foreground">
          © {copyright} {new Date().getFullYear()}
        </div>

        {/* Social buttons + Dark mode */}
        <div className="flex items-center space-x-2">
          {socials.map((social) => (
            <Link
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="p-2" aria-label={social.label}>
                {social.icon}
              </Button>
            </Link>
          ))}

          {/* Dark Mode Toggle */}
          <DarkModeToggle />
        </div>
      </div>
    </section>
  );
};
