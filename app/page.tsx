import { redirect } from "next/navigation"
import { getCurrentUser, getClientJobs, getOpenJobs } from "@/app/actions"
import { ClientDashboard } from "@/components/client-dashboard"
import { CleanerMarketplace } from "@/components/cleaner-marketplace"

export default async function Home() {
  const user = await getCurrentUser()
  
  // If not logged in, redirect to auth page
  if (!user) {
    redirect("/auth")
  }
  
  // Show different dashboard based on user role
  if (user.role === "client") {
    const jobs = await getClientJobs()
    return <ClientDashboard user={user} jobs={jobs} />
  } else {
    const jobs = await getOpenJobs()
    return <CleanerMarketplace user={user} jobs={jobs} />
  }
}
