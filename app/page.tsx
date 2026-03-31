import { getCurrentUser, getClientJobs, getOpenJobs } from "@/app/actions"
import { ClientDashboard } from "@/components/client-dashboard"
import { CleanerDashboard } from "@/components/cleaner-marketplace"
import AuthPage from "./auth/page"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    return <AuthPage />
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
