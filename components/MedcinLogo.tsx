"use client";

import React from "react";
import Link from "next/link";
import { useBranding } from "@/lib/branding";

interface MedcinLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
}

export function MedcinLogo({
  className = "",
  size = "md",
  withLink = true,
}: MedcinLogoProps) {
  const { branding } = useBranding();
  const logoText = branding?.assets?.logoText || branding?.client?.name || "Medcin";

  const sizeClasses = {
    sm: "text-base gap-1.5",
    md: "text-lg md:text-xl gap-2",
    lg: "text-2xl md:text-3xl gap-2.5",
  };

  const markSizes = {
    sm: { box: "w-3.5 h-3.5", h: "w-3.5 h-[3px] top-[5.5px]", v: "w-[3px] h-3.5 left-[5.5px]" },
    md: { box: "w-[18px] h-[18px]", h: "w-[18px] h-[4px] top-[7px]", v: "w-[4px] h-[18px] left-[7px]" },
    lg: { box: "w-6 h-6", h: "w-6 h-[5px] top-[9.5px]", v: "w-[5px] h-6 left-[9.5px]" },
  };

  const content = (
    <span
      className={`inline-flex items-center font-bold tracking-tight text-[var(--ink)] select-none ${sizeClasses[size]} ${className}`}
    >
      <span className={`relative flex-none ${markSizes[size].box}`}>
        <span
          className={`absolute bg-[var(--clay)] rounded-[1px] ${markSizes[size].h}`}
        />
        <span
          className={`absolute bg-[var(--clay)] rounded-[1px] ${markSizes[size].v}`}
        />
      </span>
      <span className="font-sans-ledger font-semibold tracking-[-0.02em]">
        {logoText}
      </span>
    </span>
  );

  if (withLink) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
