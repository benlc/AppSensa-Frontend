"use client"

import { ModeToggle } from "@/app/components/mode-toggle"
import { Search } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function AppHeader({ packageName }: { packageName?: string } = {}) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="border-b dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AppDiff
        </Link>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search apps..."
              className="h-9 w-[200px] sm:w-[300px] rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
