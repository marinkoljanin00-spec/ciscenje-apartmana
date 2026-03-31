import { redirect } from "next/navigation"
import { getCurrentUser, getClientJobs, getOpenJobs, logout } from "@/app/actions"
import { ClientDashboard } from "@/components/client-dashboard"
import { CleanerDashboard } from "@/components/cleaner-marketplace"

export default async function Home() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth")
  }

  if (user.role === "client") {
    const jobs = await getClientJobs()
    return <ClientDashboard user={user} jobs={jobs} />
  }

  // Cleaner
  const jobs = await getOpenJobs()
  return <CleanerDashboard user={user} jobs={jobs} />
}
