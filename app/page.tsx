"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { AuthScreen } from "@/components/auth-screen"
import { EmailVerification } from "@/components/email-verification"
import { AppSidebar, type ViewType } from "@/components/app-sidebar"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { CleanerDashboard } from "@/components/cleaner-dashboard"
import { HistoryView } from "@/components/history-view"
import { MyJobsView } from "@/components/my-jobs-view"
import { TermsOfService } from "@/components/terms-of-service"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { AdminPanel } from "@/components/admin-panel"
import { DeviceSelector } from "@/components/device-selector"
import { ADMIN_EMAIL } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Menu, Monitor } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"

export default function Home() {
  const { isAuthenticated, user, devicePreference, setDevicePreference } = useAppStore()
  const [activeView, setActiveView] = useState<ViewType>("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const screenIsMobile = useIsMobile()
  
  // Use device preference if set, otherwise fall back to screen detection
  const isMobile = devicePreference === "mobile" || (devicePreference === null && screenIsMobile)

  if (!isAuthenticated) {
    return (
      <>
        <DeviceSelector />
        <AuthScreen />
      </>
    )
  }

  // Check if email is verified
  if (!user?.emailVerificiran) {
    return <EmailVerification />
  }

  const MainContent = () => {
    if (activeView === "terms") {
      return <TermsOfService onBack={() => setActiveView("home")} />
    }

    if (activeView === "privacy") {
      return <PrivacyPolicy onBack={() => setActiveView("home")} />
    }

    if (activeView === "history") {
      return <HistoryView />
    }

    if (activeView === "my-jobs" && user?.tip === "cistacica") {
      return <MyJobsView />
    }

    if (activeView === "admin" && user?.email === ADMIN_EMAIL) {
      return <AdminPanel />
    }

    if (user?.tip === "vlasnik") {
      return <OwnerDashboard />
    }

    return <CleanerDashboard />
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AppSidebar
                activeView={activeView}
                onViewChange={(view) => {
                  setActiveView(view)
                  setMobileMenuOpen(false)
                }}
                collapsed={false}
                onToggleCollapse={() => {}}
              />
            </SheetContent>
          </Sheet>
          <span className="font-bold text-lg">sjaj.hr</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setDevicePreference("desktop")}
            title="Prebaci na desktop prikaz"
          >
            <Monitor className="h-5 w-5" />
            <span className="sr-only">Desktop prikaz</span>
          </Button>
        </header>

        {/* Main Content */}
        <main className="pb-safe">
          <MainContent />
        </main>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 overflow-auto">
        <MainContent />
      </main>
    </div>
  )
}
