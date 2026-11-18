"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { DESKTOP_QUERY, closeWhenDesktop } from "@/lib/nav/mobile-menu";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { HeaderBar, type PhoneMenuProps } from "./HeaderBar";
import { MenuBurger } from "./MenuBurger";

/** The sheet itself is a separate chunk, loaded only by headers that draw this menu. */
const MobileMenu = dynamic(() => import("./MobileMenu").then((module) => module.MobileMenu), { ssr: false });

/** The header bar with the sheet menu: a burger that opens a full-screen layer, closed by itself at the desktop width. */
export function SheetMenu({ open, onToggle, scrolled, children, ...menu }: Readonly<PhoneMenuProps>) {
  const burger = useRef<HTMLButtonElement>(null);
  const { onClose } = menu;

  useEffect(() => (open ? closeWhenDesktop(window.matchMedia(DESKTOP_QUERY), onClose) : undefined), [open, onClose]);

  return (
    <>
      <HeaderBar
        scrolled={scrolled}
        extra={open ? " max-lg:bg-[var(--cream)] max-lg:border-[var(--border)]" : ""}
        burger={<MenuBurger open={open} onToggle={onToggle} buttonRef={burger} />}
      >
        {children}
      </HeaderBar>
      <MobileMenu open={open} burgerRef={burger} language={<LanguageSwitcher />} {...menu} />
    </>
  );
}
