"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Shield, Library } from "lucide-react"
import Link from "next/link"

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
  strings: Record<string, string>
  extracted_at: string
  security_issues?: { type: string; file: string }[]
}

interface AppDetailsProps {
  packageName: string
}

export function AppDetails({ packageName }: AppDetailsProps) {
  const [versions, setVersions] = useState<AppVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0)
  const [compareVersionIndex, setCompareVersionIndex] = useState(1)
  const [showDiff, setShowDiff] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const stringsPerPage = 20
  const [appName, setAppName] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAppName() {
      try {
        // Fetch the app name for the given package name
        const { data, error } = await supabase
          .from("app_versions")
          .select("app_name")
          .eq("package_name", packageName)
          .limit(1)
          .single()

        if (error) throw error

        setAppName(data?.app_name || null)
      } catch (err) {
        console.error("Error fetching app name:", err)
        setAppName(null)
      }
    }

    fetchAppName()
  }, [packageName])

  useEffect(() => {
    async function fetchVersions() {
      try {
        setLoading(true)

        // Fetch app versions sorted by version_code in ascending order (older to newer)
        const { data, error } = await supabase
          .from("app_versions")
          .select("*")
          .eq("package_name", packageName)
          .order("version_code", { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setVersions(data)
          setCompareVersionIndex(data.length > 1 ? 1 : 0)
        }
      } catch (err) {
        console.error("Error fetching versions:", err)
        setError("Failed to load app versions")
      } finally {
        setLoading(false)
      }
    }

    fetchVersions()
  }, [packageName])

  // Ensure filteredStrings and paginatedStrings update when selectedVersionIndex changes
  useEffect(() => {
    setCurrentPage(1); // Reset to the first page
  }, [selectedVersionIndex, searchQuery]);

  if (loading) {
    return <div className="flex justify-center p-8">Loading app details...</div>
  }

  if (error) {
    return <div className="text-red-500 p-8">{error}</div>
  }

  if (versions.length === 0) {
    return <div className="text-center p-8">No versions found for this app.</div>
  }

  const selectedVersion = versions[selectedVersionIndex]
  const compareVersion = versions[compareVersionIndex]

  // Calculate differences between versions
  const getAddedItems = (current: string[], previous: string[]) => {
    return current.filter((item) => !previous.includes(item))
  }

  const getRemovedItems = (current: string[], previous: string[]) => {
    return previous.filter((item) => !current.includes(item))
  }

  const addedPermissions = showDiff
    ? getAddedItems(selectedVersion.permissions || [], compareVersion.permissions || [])
    : []

  const removedPermissions = showDiff
    ? getRemovedItems(selectedVersion.permissions || [], compareVersion.permissions || [])
    : []

  const addedLibraries = showDiff ? getAddedItems(selectedVersion.libraries || [], compareVersion.libraries || []) : []

  const removedLibraries = showDiff
    ? getRemovedItems(selectedVersion.libraries || [], compareVersion.libraries || [])
    : []

  const filteredStrings = Object.entries(selectedVersion.strings || {}).filter(([key, value]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredStrings.length / stringsPerPage)
  const paginatedStrings = filteredStrings.slice(
    (currentPage - 1) * stringsPerPage,
    currentPage * stringsPerPage
  )

  const addedStrings = showDiff
    ? Object.entries(selectedVersion.strings || {}).filter(
        ([key]) => !(compareVersion.strings || {})[key]
      )
    : []

  const removedStrings = showDiff
    ? Object.entries(compareVersion.strings || {}).filter(
        ([key]) => !(selectedVersion.strings || {})[key]
      )
    : []

  // Update the search logic to filter added and removed strings
  const filteredAddedStrings = addedStrings.filter(([key, value]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRemovedStrings = removedStrings.filter(([key, value]) =>
    key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{appName || packageName}</h1>
          <p className="text-muted-foreground">{packageName}</p>
          <p className="text-muted-foreground">
            {versions.length} version{versions.length !== 1 ? "s" : ""} analyzed
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Apps
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Version Analysis</CardTitle>
              <CardDescription>{showDiff ? "Comparing versions" : "Viewing single version"}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedVersionIndex.toString()}
                onValueChange={(value) => setSelectedVersionIndex(Number.parseInt(value))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((version, index) => (
                    <SelectItem key={version.id} value={index.toString()}>
                      {version.version_name} ({version.version_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {versions.length > 1 && (
                <>
                  <Button variant="outline" size="icon" onClick={() => {
                    setShowDiff(!showDiff);
                    if (!showDiff) {
                      // Swap selectedVersionIndex and compareVersionIndex to reverse the logic
                      setSelectedVersionIndex(compareVersionIndex);
                      setCompareVersionIndex(selectedVersionIndex);
                    }
                  }}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {showDiff && (
                    <Select
                      value={compareVersionIndex.toString()}
                      onValueChange={(value) => setCompareVersionIndex(Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Compare with" />
                      </SelectTrigger>
                      <SelectContent>
                        {versions.map((version, index) => (
                          <SelectItem
                            key={version.id}
                            value={index.toString()}
                            disabled={index === selectedVersionIndex}
                          >
                            {version.version_name} ({version.version_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="permissions">
            <TabsList>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="libraries">Libraries</TabsTrigger>
              <TabsTrigger value="strings">Strings</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="permissions" className="mt-4 space-y-4">
              {showDiff && (
                <>
                  {addedPermissions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-green-600">Added Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {addedPermissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-green-600 border-green-600">
                            <Shield className="mr-1 h-3 w-3" />
                            {permission.split(".").pop()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {removedPermissions.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-600">Removed Permissions</h3>
                      <div className="flex flex-wrap gap-2">
                        {removedPermissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                            <Shield className="mr-1 h-3 w-3" />
                            {permission.split(".").pop()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-medium">Unchanged Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.permissions
                        .filter((p) => !addedPermissions.includes(p) && !removedPermissions.includes(p))
                        .map((permission, index) => (
                          <Badge key={index} variant="outline">
                            <Shield className="mr-1 h-3 w-3" />
                            {permission.split(".").pop()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {!showDiff && (
                <div className="flex flex-wrap gap-2">
                  {selectedVersion.permissions?.map((permission, index) => (
                    <Badge key={index} variant="outline">
                      <Shield className="mr-1 h-3 w-3" />
                      {permission.split(".").pop()}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="libraries" className="mt-4 space-y-4">
              {showDiff && (
                <>
                  {addedLibraries.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-green-600">Added Libraries</h3>
                      <div className="flex flex-wrap gap-2">
                        {addedLibraries.map((library, index) => (
                          <Badge key={index} variant="outline" className="text-green-600 border-green-600">
                            <Library className="mr-1 h-3 w-3" />
                            {library}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {removedLibraries.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-600">Removed Libraries</h3>
                      <div className="flex flex-wrap gap-2">
                        {removedLibraries.map((library, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-600">
                            <Library className="mr-1 h-3 w-3" />
                            {library}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-medium">Unchanged Libraries</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVersion.libraries
                        .filter((l) => !addedLibraries.includes(l) && !removedLibraries.includes(l))
                        .map((library, index) => (
                          <Badge key={index} variant="outline">
                            <Library className="mr-1 h-3 w-3" />
                            {library}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </>
              )}

              {!showDiff && (
                <div className="flex flex-wrap gap-2">
                  {selectedVersion.libraries?.map((library, index) => (
                    <Badge key={index} variant="outline">
                      <Library className="mr-1 h-3 w-3" />
                      {library}
                    </Badge>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="strings" className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search strings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border rounded-md px-4 py-2"
                />
              </div>

              {showDiff && (
                <>
                  {filteredAddedStrings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-green-600">Added Strings</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Key
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                            {filteredAddedStrings.map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-4 py-2 text-sm font-medium text-green-600">{key}</td>
                                <td className="px-4 py-2 text-sm text-green-600">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {filteredRemovedStrings.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-red-600">Removed Strings</h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Key
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-border">
                            {filteredRemovedStrings.map(([key, value]) => (
                              <tr key={key}>
                                <td className="px-4 py-2 text-sm font-medium text-red-600">{key}</td>
                                <td className="px-4 py-2 text-sm text-red-600">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Key
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {paginatedStrings.map(([key, value]) => (
                      <tr key={key}>
                        <td className="px-4 py-2 text-sm font-medium">{key}</td>
                        <td className="px-4 py-2 text-sm">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredStrings.length > stringsPerPage && (
                  <div className="flex justify-between items-center px-4 py-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-4 space-y-4">
              {selectedVersion.security_issues?.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-medium">Security Issues</h3>
                  <ul className="list-disc pl-5">
                    {selectedVersion.security_issues.map((issue, index) => (
                      <li key={index} className="text-red-600">
                        {issue.type}: {issue.file}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No security issues detected.</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
