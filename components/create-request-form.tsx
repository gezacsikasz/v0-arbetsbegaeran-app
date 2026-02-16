"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Save,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useApp } from "@/lib/app-context"
import { FACILITIES } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import type { WorkRequest } from "@/lib/types"

const STEPS = [
  { id: 1, label: "Grundinfo" },
  { id: 2, label: "Risk & Rekvisit" },
  { id: 3, label: "Forhandsgranskning" },
]

const DEFAULT_REQUISITES = [
  "Riskanalys bifogad",
  "Arbetsschema godkant",
  "Reservdelar bestallda",
  "Sakerhetsgenomgang genomford",
  "Berorda system identifierade",
]

export function CreateRequestForm() {
  const router = useRouter()
  const { setRequests, requests } = useApp()
  const [step, setStep] = useState(1)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [facility, setFacility] = useState("")
  const [objectId, setObjectId] = useState("")
  const [requestedStart, setRequestedStart] = useState("")
  const [duration, setDuration] = useState("")
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [riskImpact, setRiskImpact] = useState("")

  const newId = `ARB-${1000 + requests.length + 1}`

  const canProceed = step === 1
    ? title && facility && requestedStart && duration
    : step === 2
      ? riskImpact
      : true

  const handleSaveDraft = () => {
    const newReq: WorkRequest = {
      id: newId,
      title: title || "Nytt utkast",
      description,
      facility,
      object: objectId,
      requestedStart,
      duration,
      riskImpact,
      status: "draft",
      priority,
      createdBy: "Demo-anvandare",
      createdByRole: "applicant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requisites: DEFAULT_REQUISITES.map((label, i) => ({
        id: `r${i + 1}`,
        label,
        fulfilled: false,
      })),
      activityLog: [
        {
          id: "a1",
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: "applicant",
          action: "Skapade utkast",
        },
      ],
      attachments: [],
      documents: [],
      approvers: [],
    }
    setRequests([newReq, ...requests])
    router.push("/inbox")
  }

  const handleSubmit = () => {
    const newReq: WorkRequest = {
      id: newId,
      title,
      description,
      facility,
      object: objectId,
      requestedStart,
      duration,
      riskImpact,
      status: "submitted",
      priority,
      createdBy: "Demo-anvandare",
      createdByRole: "applicant",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requisites: DEFAULT_REQUISITES.map((label, i) => ({
        id: `r${i + 1}`,
        label,
        fulfilled: false,
      })),
      activityLog: [
        {
          id: "a1",
          timestamp: new Date().toISOString(),
          actor: "Demo-anvandare",
          role: "applicant",
          action: "Skapade och skickade in arbetsbegaran",
        },
      ],
      attachments: [],
      documents: [
        {
          id: "doc1",
          name: `ARB.BEG #${newId.replace("ARB-", "")}`,
          version: 1,
          generatedBy: "System",
          generatedAt: new Date().toISOString(),
          format: "pdf",
        },
      ],
      approvers: [
        { role: "shiftlead1", name: "Erik Johansson" },
        { role: "shiftlead2", name: "Maria Svensson" },
      ],
    }
    setRequests([newReq, ...requests])
    router.push("/inbox")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-6 py-4">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push("/inbox")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Tillbaka</span>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Ny arbetsbegaran</h1>
          <p className="text-xs text-muted-foreground">{newId}</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-4 border-b border-border px-6 py-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                step >= s.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s.id}
            </div>
            <span
              className={cn(
                "text-sm",
                step >= s.id ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-2 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Grundlaggande information</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title">Titel *</Label>
                  <Input id="title" placeholder="Beskriv arbetet kort" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="desc">Beskrivning</Label>
                  <Textarea id="desc" placeholder="Detaljerad beskrivning av arbetet..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Anlaggning *</Label>
                    <Select value={facility} onValueChange={setFacility}>
                      <SelectTrigger><SelectValue placeholder="Valj anlaggning" /></SelectTrigger>
                      <SelectContent>
                        {FACILITIES.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="obj">Objekt-ID</Label>
                    <Input id="obj" placeholder="t.ex. V-4021" value={objectId} onChange={(e) => setObjectId(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="start">Onskat startdatum *</Label>
                    <Input id="start" type="date" value={requestedStart} onChange={(e) => setRequestedStart(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="dur">Varaktighet *</Label>
                    <Input id="dur" placeholder="t.ex. 8 timmar" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label>Prioritet</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Lag</SelectItem>
                        <SelectItem value="medium">Medel</SelectItem>
                        <SelectItem value="high">Hog</SelectItem>
                        <SelectItem value="critical">Kritisk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk, konsekvens och rekvisit</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="risk">Risk / Konsekvens *</Label>
                  <Textarea id="risk" placeholder="Beskriv paverkan, risker och konsekvenser..." value={riskImpact} onChange={(e) => setRiskImpact(e.target.value)} rows={4} />
                </div>
                <Separator />
                <div>
                  <Label className="mb-3 block">Rekvisit-checklista (maste uppfyllas innan godkannande)</Label>
                  <div className="flex flex-col gap-2">
                    {DEFAULT_REQUISITES.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md border border-border p-3">
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{req}</span>
                        <span className="ml-auto text-xs text-muted-foreground">Ej uppfyllt</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Rekvisiten verifieras efter inskickning under granskningsprocessen.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Forhandsgranskning</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground">ID:</span> <span className="font-mono font-medium">{newId}</span></div>
                    <div><span className="text-muted-foreground">Prioritet:</span> <span className="font-medium capitalize">{priority}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Titel:</span> <span className="font-medium">{title || "-"}</span></div>
                    <div><span className="text-muted-foreground">Anlaggning:</span> <span className="font-medium">{facility || "-"}</span></div>
                    <div><span className="text-muted-foreground">Objekt:</span> <span className="font-medium">{objectId || "-"}</span></div>
                    <div><span className="text-muted-foreground">Start:</span> <span className="font-medium">{requestedStart || "-"}</span></div>
                    <div><span className="text-muted-foreground">Varaktighet:</span> <span className="font-medium">{duration || "-"}</span></div>
                  </div>
                  <Separator />
                  <div>
                    <span className="text-muted-foreground">Beskrivning:</span>
                    <p className="mt-1 text-foreground">{description || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Risk / Konsekvens:</span>
                    <p className="mt-1 text-foreground">{riskImpact || "-"}</p>
                  </div>
                  <Separator />
                  <p className="text-xs text-muted-foreground">
                    Ett dokument (ARB.BEG #{newId.replace("ARB-", "")}) genereras automatiskt vid inskickning.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-border px-6 py-3">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Tillbaka
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="mr-1.5 h-4 w-4" />
            Spara utkast
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed}>
              Nasta
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Send className="mr-1.5 h-4 w-4" />
              Skicka in
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
