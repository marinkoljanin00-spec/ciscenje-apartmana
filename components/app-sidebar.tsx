"use client"

import { useAppStore, ADMIN_EMAIL } from "@/lib/store"
import { cn } from "@/lib/utils"
import {
  Sparkles,
  Home,
  History,
  LogOut,
  User,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Bug,
  ShieldCheck,
  Monitor,
  Smartphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { BugReportDialog } from "@/components/bug-report-dialog"

export type ViewType = "home" | "history" | "my-jobs" | "admin"

interface AppSidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({
  activeView,
  onViewChange,
  collapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const { user, logout, devicePreference, setDevicePreference } = useAppStore()

  const baseNavItems = [
    { id: "home" as const, label: "Početna", icon: Home },
  ]

  const cleanerNavItems = [
    { id: "my-jobs" as const, label: "Moji Poslovi", icon: CalendarCheck },
  ]

  const commonNavItems = [
    { id: "history" as const, label: "Povijest", icon: History },
  ]

  const adminNavItems = [
    { id: "admin" as const, label: "Admin Panel", icon: ShieldCheck },
  ]

  // Build nav items based on user type and admin status
  let navItems = user?.tip === "cistacica" 
    ? [...baseNavItems, ...cleanerNavItems, ...commonNavItems]
    : [...baseNavItems, ...commonNavItems]

  // Add admin panel for admin user
  if (user?.email === ADMIN_EMAIL) {
    navItems = [...navItems, ...adminNavItems]
  }

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <span className="font-bold text-xl text-sidebar-foreground">
              CLEANUP
            </span>
          )}
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <UserAvatar user={user ?? {}} size="md" showBadge={true} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-medium text-sidebar-foreground truncate">
                {user?.ime}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {user?.tip === "vlasnik" ? (
                  <>
                    <Briefcase className="w-3 h-3" />
                    Vlasnik
                  </>
                ) : (
                  <>
                    <User className="w-3 h-3" />
                    Čistač/ica
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  activeView === item.id
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        {/* Device Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDevicePreference(devicePreference === "mobile" ? "desktop" : "mobile")}
          className={cn(
            "w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
            collapsed ? "justify-center" : "justify-start"
          )}
          title={devicePreference === "mobile" ? "Prebaci na desktop prikaz" : "Prebaci na mobilni prikaz"}
        >
          {devicePreference === "mobile" ? (
            <>
              <Smartphone className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Mobilni prikaz</span>}
            </>
          ) : (
            <>
              <Monitor className="w-4 h-4" />
              {!collapsed && <span className="ml-2">Desktop prikaz</span>}
            </>
          )}
        </Button>

        {/* Bug Report Button */}
        <BugReportDialog>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50",
              collapsed ? "justify-center" : "justify-start"
            )}
          >
            <Bug className="w-4 h-4" />
            {!collapsed && <span className="ml-2">Prijavi problem</span>}
          </Button>
        </BugReportDialog>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            "w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent/50",
            !collapsed && "justify-start"
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Smanji
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className={cn(
            "w-full text-destructive hover:text-destructive hover:bg-destructive/10",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Odjava</span>}
        </Button>
      </div>
    </aside>
  )
}
