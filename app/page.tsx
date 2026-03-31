import { getCurrentUser } from "@/app/actions"
import { redirect } from "next/navigation"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth")
  }

  redirect("/dashboard")
}
