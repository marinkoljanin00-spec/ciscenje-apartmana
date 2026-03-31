import { getAccounts, getCurrentUser, type Account } from "@/app/actions"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, CreditCard, TrendingUp, AlertCircle } from "lucide-react"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/auth")
  }
  
  const accounts = await getAccounts()
  
  // Calculate total balance
  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
  
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Dobrodošli natrag!
          </h1>
          <p className="text-muted-foreground">
            Prijavljeni ste kao: {user.email}
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ukupno stanje</p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalBalance.toFixed(2)} EUR
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Broj računa</p>
                  <p className="text-2xl font-bold text-foreground">
                    {accounts.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-chart-5/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prosječno stanje</p>
                  <p className="text-2xl font-bold text-foreground">
                    {accounts.length > 0 ? (totalBalance / accounts.length).toFixed(2) : "0.00"} EUR
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Vaši računi
            </CardTitle>
            <CardDescription>
              Pregled svih računa povezanih s vašim korisnikom
            </CardDescription>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nemate otvorenih računa
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Trenutno nemate nijedan račun povezan s vašim korisničkim profilom.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{account.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ID: {account.id} • Kreiran: {new Date(account.created_at).toLocaleDateString("hr-HR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {Number(account.balance).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{account.currency}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
