import { createClient } from "@supabase/supabase-js"
import { AppHeader } from "@/app/components/app-header"
import { AppDetails } from "@/app/components/app-details"
import { notFound } from "next/navigation"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function AppPage({ params }: { params: { packageName: string } }) {
  const { packageName } = params

  // Fetch app versions
  const { data: versions, error } = await supabase
    .from("app_versions")
    .select("*")
    .eq("package_name", packageName)
    .order("version_code", { ascending: false })

  if (error || !versions || versions.length === 0) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <AppDetails packageName={packageName} />
      </div>
    </main>
  )
}
