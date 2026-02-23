"use client"

import { useMemo } from "react"
import Link from "next/link"
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Plus,
  Inbox,
  CalendarDays,
  Send,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusChip } from "@/components/status-chip"
import { PriorityIndicator } from "@/components/priority-indicator"
import { useApp } from "@/lib/app-context"
import { ROLE_LABELS, type Status } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Dashboard() {
  const { currentRole, requests } = useApp()

  const stats = useMemo(() => {
    const byStatus = (s: Status) => requests.filter((r) => r.status === s).length
    return {
      draft: byStatus("draft"),
      submitted: byStatus("submitted"),
      review: byStatus("review"),
      needsMoreInfo: byStatus("needs_more_info"),
      approved: byStatus("approved"),
      ready: byStatus("ready"),
      completed: byStatus("completed"),
      total: requests.length,
    }
  }, [requests])

  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    [requests]
  )

  const isReviewer = currentRole === "controlroom" || currentRole === "shiftlead1" || currentRole === "shiftlead2"

  return (
    <div className="p-6">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Oversikt som {ROLE_LABELS[currentRole]}
          </p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Skapa Arbetsorder
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      {isReviewer ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Nya idag"
            value={stats.submitted}
            icon={Inbox}
            variant="blue"
          />
          <StatCard
            title="Vantar granskning"
            value={stats.review}
            icon={Clock}
            variant="amber"
          />
          <StatCard
            title="Komplettering skickad"
            value={stats.needsMoreInfo}
            icon={AlertTriangle}
            variant="orange"
          />
          <StatCard
            title="Redo denna vecka"
            value={stats.ready}
            icon={CalendarDays}
            variant="emerald"
          />
        </div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Mina utkast"
            value={stats.draft}
            icon={FileText}
            variant="default"
          />
          <StatCard
            title="Inskickade"
            value={stats.submitted + stats.review}
            icon={Send}
            variant="blue"
          />
          <StatCard
            title="Komplettering kravs"
            value={stats.needsMoreInfo}
            icon={AlertTriangle}
            variant="orange"
          />
          <StatCard
            title="Redo"
            value={stats.ready}
            icon={CheckCircle2}
            variant="emerald"
          />
        </div>
      )}

      {/* Status flow visualization */}
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Statusflode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(
              [
                { status: "draft" as Status, count: stats.draft },
                { status: "submitted" as Status, count: stats.submitted },
                { status: "review" as Status, count: stats.review },
                { status: "needs_more_info" as Status, count: stats.needsMoreInfo },
                { status: "approved" as Status, count: stats.approved },
                { status: "ready" as Status, count: stats.ready },
                { status: "completed" as Status, count: stats.completed },
              ] as const
            ).map((item, i) => (
              <div key={item.status} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 min-w-[100px]">
                  <StatusChip status={item.status} />
                  <span className="text-lg font-bold text-foreground">{item.count}</span>
                </div>
                {i < 6 && (
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">Senaste arenden</CardTitle>
          <Link href="/inbox">
            <Button variant="ghost" size="sm">
              Visa alla
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="flex items-center gap-4 px-6 py-3 hover:bg-accent transition-colors"
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{req.id}</span>
                    <PriorityIndicator priority={req.priority} />
                  </div>
                  <span className="text-sm font-medium text-foreground truncate">
                    {req.title}
                  </span>
                  <span className="text-xs text-muted-foreground">{req.facility}</span>
                </div>
                <StatusChip status={req.status} />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(req.updatedAt).toLocaleDateString("sv-SE")}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = "default",
}: {
  title: string
  value: number
  icon: React.ElementType
  variant?: "default" | "blue" | "amber" | "orange" | "emerald"
}) {
  const iconColors = {
    default: "text-muted-foreground",
    blue: "text-blue-600",
    amber: "text-amber-600",
    orange: "text-orange-600",
    emerald: "text-emerald-600",
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("rounded-lg bg-muted p-2.5", iconColors[variant])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{title}</span>
        </div>
      </CardContent>
    </Card>
  )
}
