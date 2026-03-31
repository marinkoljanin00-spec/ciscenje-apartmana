import { redirect } from "next/navigation"

// This page just redirects to the main page which handles role-based dashboards
export default function DashboardPage() {
  redirect("/")
}
