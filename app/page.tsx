import { getCurrentUser, getClientJobs, getOpenJobs } from "@/app/actions"
import { ClientDashboard } from "@/components/client-dashboard"
import { CleanerDashboard } from "@/components/cleaner-marketplace"
import AuthPageContent from "./auth/auth-content"

export default async function Home() {
  const user = await getCurrentUser()
  
  // If not logged in, show auth page content directly
  if (!user) {
    return <AuthPageContent />
  }
  
  // Show different dashboard based on user role
  if (user.role === "client") {
    const jobs = await getClientJobs()
    return <ClientDashboard user={user} jobs={jobs} />
  } else {
    const jobs = await getOpenJobs()
    return <CleanerDashboard user={user} jobs={jobs} />
  }
}
