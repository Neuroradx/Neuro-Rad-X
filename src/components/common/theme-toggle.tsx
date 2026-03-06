
"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/hooks/use-translation"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 relative"
          aria-label={t("themeToggle.ariaLabel")}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem onClick={() => setTheme("light")} className="justify-between">
          <span className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            {t("themeToggle.light")}
          </span>
          {theme === "light" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="justify-between">
          <span className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            {t("themeToggle.dark")}
          </span>
          {theme === "dark" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="justify-between">
          <span className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            {t("themeToggle.system")}
          </span>
          {theme === "system" && <Check className="h-4 w-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
