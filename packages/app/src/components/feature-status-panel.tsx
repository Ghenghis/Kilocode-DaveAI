import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Tag } from "@opencode-ai/ui/tag"
import { Button } from "@opencode-ai/ui/button"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"

export interface FeatureStatus {
  id: string
  name: string
  description: string
  enabled: boolean
  working: boolean
  lastChecked: Date
  error?: string
  category: "provider" | "tool" | "ui" | "integration"
  configRequired?: boolean
  microSave?: () => void
}

interface FeatureStatusPanelProps {
  features: FeatureStatus[]
  onFeatureToggle: (id: string) => void
  onSaveAll: () => void
}

export const FeatureStatusPanel: Component<FeatureStatusPanelProps> = (props) => {
  const [filter, setFilter] = createSignal<string>("all")
  
  const filteredFeatures = createMemo(() => {
    const f = filter()
    if (f === "all") return props.features
    return props.features.filter(feature => feature.category === f)
  })

  const getStatusColor = (feature: FeatureStatus) => {
    if (!feature.enabled) return "bg-gray-500"
    if (feature.working) return "bg-green-500"
    return "bg-red-500"
  }

  const getStatusText = (feature: FeatureStatus) => {
    if (!feature.enabled) return "Disabled"
    if (feature.working) return "Working"
    return "Broken"
  }

  return (
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Feature Status Dashboard</h2>
        <div class="flex gap-2">
          <select 
            value={filter()} 
            onInput={(e) => setFilter(e.target.value)}
            class="px-3 py-1 border rounded"
          >
            <option value="all">All Features</option>
            <option value="provider">Providers</option>
            <option value="tool">Tools</option>
            <option value="ui">UI</option>
            <option value="integration">Integrations</option>
          </select>
          <Button onClick={props.onSaveAll} class="px-4 py-2 bg-blue-500 text-white rounded">
            Save All Changes
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={filteredFeatures()}>
          {(feature) => (
            <Card class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class={`w-3 h-3 rounded-full ${getStatusColor(feature)}`} />
                  <h3 class="font-medium">{feature.name}</h3>
                  <Tag>
                    {feature.category}
                  </Tag>
                </div>
                <div class="flex items-center gap-2">
                  <Show when={feature.microSave}>
                    <Tooltip value="Micro save this feature">
                      <Button 
                        size="small" 
                        variant="ghost"
                        onClick={feature.microSave}
                        class="p-1"
                      >
                        <Icon name="edit-small-2" class="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </Show>
                  <Switch
                    checked={feature.enabled}
                    onChange={() => props.onFeatureToggle(feature.id)}
                  />
                </div>
              </div>

              <p class="text-sm text-gray-600">{feature.description}</p>

              <div class="flex items-center justify-between text-xs">
                <span class={`font-medium ${
                  feature.working ? "text-green-600" : "text-red-600"
                }`}>
                  {getStatusText(feature)}
                </span>
                <span class="text-gray-500">
                  Last checked: {feature.lastChecked.toLocaleTimeString()}
                </span>
              </div>

              <Show when={feature.error}>
                <div class="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {feature.error}
                </div>
              </Show>

              <Show when={feature.configRequired && !feature.working}>
                <div class="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                  ⚠️ Configuration required
                </div>
              </Show>
            </Card>
          )}
        </For>
      </div>

      <div class="mt-6 p-4 bg-gray-50 rounded">
        <h3 class="font-medium mb-2">Legend</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500" />
            <span>Working</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-500" />
            <span>Broken</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-gray-500" />
            <span>Disabled</span>
          </div>
          <div class="flex items-center gap-2">
            <Icon name="edit-small-2" class="w-4 h-4" />
            <span>Micro save</span>
          </div>
        </div>
      </div>
    </div>
  )
}
