"use client";

import { ReactNode, useEffect, useState } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

interface SignInLayoutProps {
  children: ReactNode;
}

export default function SignInLayout({ children }: SignInLayoutProps) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 ${inter.className}`}
    >
      <main className="w-full max-w-md">{children}</main>
    </div>
  );
}
