import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { Progress } from "@opencode-ai/ui/progress"
import { Alert, AlertDescription } from "@opencode-ai/ui/alert"

export interface SystemStatus {
  category: string
  total: number
  working: number
  broken: number
  disabled: number
  configured: number
}

export interface DetailedFeatureStatus {
  id: string
  name: string
  category: "provider" | "tool" | "ui" | "integration" | "terminal" | "prompt" | "context"
  enabled: boolean
  working: boolean
  configured: boolean
  lastChecked: Date
  error?: string
  version?: string
  endpoint?: string
  hasApiKey?: boolean
  dependencies?: string[]
  documentation?: string
  actions?: {
    test?: () => Promise<boolean>
    configure?: () => void
    save?: () => void
    reset?: () => void
  }
}

interface SystemStatusDashboardProps {
  features: DetailedFeatureStatus[]
  onFeatureToggle: (id: string) => void
  onFeatureAction: (id: string, action: string) => void
}

export const SystemStatusDashboard: Component<SystemStatusDashboardProps> = (props) => {
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all")
  const [testing, setTesting] = createSignal<string | null>(null)
  const [expandedFeature, setExpandedFeature] = createSignal<string | null>(null)

  const filteredFeatures = createMemo(() => {
    const category = selectedCategory()
    if (category === "all") return props.features
    return props.features.filter(f => f.category === category)
  })

  const systemStatus = createMemo(() => {
    const features = props.features
    const categories = ["provider", "tool", "ui", "integration", "terminal", "prompt", "context"]
    
    return categories.map(cat => {
      const catFeatures = features.filter(f => f.category === cat)
      return {
        category: cat,
        total: catFeatures.length,
        working: catFeatures.filter(f => f.working).length,
        broken: catFeatures.filter(f => f.enabled && !f.working).length,
        disabled: catFeatures.filter(f => !f.enabled).length,
        configured: catFeatures.filter(f => f.configured).length
      } as SystemStatus
    })
  })

  const overallHealth = createMemo(() => {
    const total = props.features.length
    const working = props.features.filter(f => f.working).length
    return total > 0 ? (working / total) * 100 : 0
  })

  const handleTestFeature = async (featureId: string) => {
    setTesting(featureId)
    try {
      const feature = props.features.find(f => f.id === featureId)
      if (feature?.actions?.test) {
        const success = await feature.actions.test()
        // Update would be handled by parent
      }
    } finally {
      setTesting(null)
    }
  }

  const getStatusIcon = (feature: DetailedFeatureStatus) => {
    if (!feature.enabled) return "circle-slash"
    if (feature.working) return "check-circle"
    return "x-circle"
  }

  const getStatusColor = (feature: DetailedFeatureStatus) => {
    if (!feature.enabled) return "text-gray-400"
    if (feature.working) return "text-green-500"
    return "text-red-500"
  }

  const getProgressValue = (status: SystemStatus) => {
    return status.total > 0 ? (status.working / status.total) * 100 : 0
  }

  return (
    <div class="p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">System Status Dashboard</h1>
          <p class="text-gray-600">Monitor and manage all Kilo Code features and integrations</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-2xl font-bold text-green-600">{overallHealth().toFixed(1)}%</div>
            <div class="text-sm text-gray-600">Overall Health</div>
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <For each={systemStatus()}>
          {(status) => (
            <Card class="p-4">
              <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium capitalize">{status.category}</h3>
                <Badge variant="outline">{status.total}</Badge>
              </div>
              <Progress value={getProgressValue(status)} class="mb-2" />
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-green-500" />
                  <span>{status.working} working</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-red-500" />
                  <span>{status.broken} broken</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-gray-500" />
                  <span>{status.disabled} disabled</span>
                </div>
                <div class="flex items-center gap-1">
                  <div class="w-2 h-2 rounded-full bg-blue-500" />
                  <span>{status.configured} configured</span>
                </div>
              </div>
            </Card>
          )}
        </For>
      </div>

      {/* Category Filter */}
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">Filter:</span>
        <div class="flex gap-2">
          <Button
            variant={selectedCategory() === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All ({props.features.length})
          </Button>
          <For each={systemStatus()}>
            {(status) => (
              <Button
                variant={selectedCategory() === status.category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(status.category)}
              >
                {status.category} ({status.total})
              </Button>
            )}
          </For>
        </div>
      </div>

      {/* Alerts */}
      <Show when={props.features.some(f => f.enabled && !f.working)}>
        <Alert class="border-red-200 bg-red-50">
          <Icon name="alert-triangle" class="h-4 w-4 text-red-600" />
          <AlertDescription>
            Some enabled features are not working properly. Check the detailed status below.
          </AlertDescription>
        </Alert>
      </Show>

      {/* Detailed Feature List */}
      <div class="space-y-4">
        <For each={filteredFeatures()}>
          {(feature) => (
            <Card class="p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3">
                  <Icon 
                    name={getStatusIcon(feature)} 
                    class={`w-5 h-5 ${getStatusColor(feature)}`} 
                  />
                  <div>
                    <h3 class="font-medium">{feature.name}</h3>
                    <p class="text-sm text-gray-600">{feature.category}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <Switch
                    checked={feature.enabled}
                    onChange={() => props.onFeatureToggle(feature.id)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedFeature(expandedFeature() === feature.id ? null : feature.id)}
                  >
                    <Icon name="chevron-down" class={`w-4 h-4 transition-transform ${expandedFeature() === feature.id ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>

              {/* Status Bar */}
              <div class="flex items-center gap-4 text-sm mb-3">
                <div class="flex items-center gap-1">
                  <div class={`w-2 h-2 rounded-full ${feature.working ? "bg-green-500" : feature.enabled ? "bg-red-500" : "bg-gray-500"}`} />
                  <span>{feature.working ? "Working" : feature.enabled ? "Broken" : "Disabled"}</span>
                </div>
                <Show when={feature.configured}>
                  <Badge variant="default" class="text-xs">Configured</Badge>
                </Show>
                <Show when={!feature.configured && feature.enabled}>
                  <Badge variant="outline" class="text-xs">Not Configured</Badge>
                </Show>
                <Show when={feature.version}>
                  <span class="text-gray-500">v{feature.version}</span>
                </Show>
                <span class="text-gray-500">
                  Last checked: {feature.lastChecked.toLocaleTimeString()}
                </span>
              </div>

              {/* Expanded Details */}
              <Show when={expandedFeature() === feature.id}>
                <div class="border-t pt-3 space-y-3">
                  <Show when={feature.error}>
                    <div class="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Error: {feature.error}
                    </div>
                  </Show>

                  <Show when={feature.endpoint}>
                    <div class="text-sm">
                      <span class="font-medium">Endpoint:</span> {feature.endpoint}
                    </div>
                  </Show>

                  <Show when={feature.dependencies && feature.dependencies.length > 0}>
                    <div class="text-sm">
                      <span class="font-medium">Dependencies:</span>
                      <div class="flex gap-1 mt-1">
                        <For each={feature.dependencies}>
                          {(dep) => <Badge variant="outline" class="text-xs">{dep}</Badge>}
                        </For>
                      </div>
                    </div>
                  </Show>

                  <Show when={feature.documentation}>
                    <div class="text-sm">
                      <a 
                        href={feature.documentation} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:underline"
                      >
                        📚 Documentation
                      </a>
                    </div>
                  </Show>

                  {/* Actions */}
                  <div class="flex gap-2 pt-2">
                    <Show when={feature.actions?.test}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={testing() === feature.id}
                        onClick={() => handleTestFeature(feature.id)}
                      >
                        <Show when={testing() === feature.id}>
                          Testing...
                        </Show>
                        <Show when={testing() !== feature.id}>
                          Test
                        </Show>
                      </Button>
                    </Show>
                    <Show when={feature.actions?.configure}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => props.onFeatureAction(feature.id, "configure")}
                      >
                        Configure
                      </Button>
                    </Show>
                    <Show when={feature.actions?.save}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => props.onFeatureAction(feature.id, "save")}
                      >
                        Save
                      </Button>
                    </Show>
                    <Show when={feature.actions?.reset}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => props.onFeatureAction(feature.id, "reset")}
                      >
                        Reset
                      </Button>
                    </Show>
                  </div>
                </div>
              </Show>
            </Card>
          )}
        </For>
      </div>
    </div>
  )
}
