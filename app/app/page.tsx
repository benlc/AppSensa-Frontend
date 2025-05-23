import { AppList } from "@/app/components/app-list"
import { AppHeader } from "@/app/components/app-header"

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">App Analysis Dashboard</h1>
        <AppList />
      </div>
    </main>
  )
}
