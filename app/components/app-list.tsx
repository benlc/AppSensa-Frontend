"use client"

import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ChevronRight, Package } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

type AppVersion = {
  id: number
  package_name: string
  version_code: string
  version_name: string
  hash: string
  permissions: string[]
  libraries: string[]
  extracted_at: string
  app_name?: string
}

type AppInfo = {
  packageName: string
  versions: AppVersion[]
}

export function AppList() {
  const [apps, setApps] = useState<AppInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredApps = apps.filter((app) => {
    const query = searchQuery.toLowerCase()
    return (
      app.packageName.toLowerCase().includes(query) ||
      app.versions[0]?.app_name?.toLowerCase().includes(query)
    )
  })

  useEffect(() => {
    async function fetchApps() {
      try {
        setLoading(true)

        // Fetch all app versions
        const { data, error } = await supabase
          .from("app_versions")
          .select("*")
          .order("extracted_at", { ascending: false })

        if (error) throw error

        // Group by package name
        const appMap = new Map<string, AppInfo>()

        data?.forEach((version: AppVersion) => {
          if (!appMap.has(version.package_name)) {
            appMap.set(version.package_name, {
              packageName: version.package_name,
              versions: [],
            })
          }

          appMap.get(version.package_name)?.versions.push(version)
        })

        setApps(Array.from(appMap.values()))
      } catch (err) {
        console.error("Error fetching apps:", err)
        setError("Failed to load apps")
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8">Loading apps...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  if (apps.length === 0) {
    return <div className="text-center p-8">No apps found. Use the App Puller and App Extractor to analyze apps.</div>
  }

  return (
    <>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by package name or app name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid gap-6 p-4">
        {filteredApps.map((app) => (
          <Card key={app.packageName}>
            <CardHeader>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{app.versions[0]?.app_name || app.packageName}</CardTitle>
                    <CardDescription>{app.packageName}</CardDescription>
                    <CardDescription>
                      {app.versions.length} version{app.versions.length !== 1 ? "s" : ""} analyzed
                    </CardDescription>
                  </div>
                  <Link href={`/${app.packageName}`} className="self-start">
                    <Button variant="outline">
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="versions">
                <TabsList>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <TabsContent value="versions" className="mt-4">
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {app.versions.slice(0, 5).map((version) => (
                        <Badge key={version.id} variant="outline">
                          <Package className="mr-1 h-3 w-3" />
                          {version.version_name} ({version.version_code})
                        </Badge>
                      ))}
                      {app.versions.length > 5 && <Badge variant="outline">+{app.versions.length - 5} more</Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(app.versions[0]?.extracted_at))} ago
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="permissions" className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {app.versions[0]?.permissions?.slice(0, 5).map((permission, index) => (
                      <Badge key={index} variant="secondary">
                        {permission.split(".").pop()}
                      </Badge>
                    ))}
                    {app.versions[0]?.permissions?.length > 5 && (
                      <Badge variant="secondary">+{app.versions[0].permissions.length - 5} more</Badge>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
