import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opencode-ai/ui/tabs"
import { Input } from "@opencode-ai/ui/input"
import { Label } from "@opencode-ai/ui/label"
import { Textarea } from "@opencode-ai/ui/textarea"
import { FeatureStatusPanel, type FeatureStatus } from "./feature-status-panel"
import { ProviderConfigPanel, type ProviderConfig } from "./provider-config-panel"
import { createFeatureManager } from "./feature-manager"

interface ComprehensiveSettingsProps {
  className?: string
}

export const ComprehensiveSettings: Component<ComprehensiveSettingsProps> = (props) => {
  const featureManager = createFeatureManager()
  const [activeTab, setActiveTab] = createSignal("features")
  const [saving, setSaving] = createSignal<string | null>(null)

  // Convert feature manager store to FeatureStatus array
  const features = createMemo(() => {
    return Object.values(featureManager.store.features)
  })

  // Provider configurations
  const [providers, setProviders] = createSignal<ProviderConfig[]>([
    {
      id: "openai",
      name: "OpenAI",
      type: "openai",
      status: "disconnected",
      description: "GPT-4, GPT-3.5, and other OpenAI models",
      documentation: "https://platform.openai.com/docs",
      fields: [
        {
          name: "api_key",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "sk-...",
          validation: (value) => {
            if (!value.startsWith("sk-")) return "API key must start with 'sk-'"
            if (value.length < 20) return "API key seems too short"
            return null
          }
        },
        {
          name: "organization",
          label: "Organization ID (optional)",
          type: "text",
          required: false,
          placeholder: "org-..."
        }
      ]
    },
    {
      id: "anthropic",
      name: "Anthropic Claude",
      type: "anthropic",
      status: "disconnected",
      description: "Claude 3.5, Claude 3, and other Anthropic models",
      documentation: "https://docs.anthropic.com",
      fields: [
        {
          name: "api_key",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "sk-ant-...",
          validation: (value) => {
            if (!value.startsWith("sk-ant-")) return "API key must start with 'sk-ant-'"
            if (value.length < 20) return "API key seems too short"
            return null
          }
        }
      ]
    },
    {
      id: "openrouter",
      name: "OpenRouter",
      type: "openrouter",
      status: "disconnected",
      description: "Access to 100+ AI models via OpenRouter",
      documentation: "https://openrouter.ai/docs",
      fields: [
        {
          name: "api_key",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "sk-or-...",
          validation: (value) => {
            if (!value.startsWith("sk-or-")) return "API key must start with 'sk-or-'"
            if (value.length < 20) return "API key seems too short"
            return null
          }
        }
      ]
    },
    {
      id: "openhands",
      name: "OpenHands",
      type: "local",
      status: "disconnected",
      description: "AI agent for coding and automation tasks",
      documentation: "https://github.com/OpenHands/openhands",
      fields: [
        {
          name: "endpoint",
          label: "Endpoint URL",
          type: "text",
          required: true,
          placeholder: "http://localhost:3000",
          validation: (value) => {
            try {
              new URL(value)
              return null
            } catch {
              return "Please enter a valid URL"
            }
          }
        },
        {
          name: "api_key",
          label: "API Key (optional)",
          type: "password",
          required: false,
          placeholder: "Optional API key"
        }
      ]
    },
    {
      id: "google-ai",
      name: "Google AI",
      type: "google",
      status: "disconnected",
      description: "Gemini, PaLM, and other Google AI models",
      documentation: "https://ai.google.dev/docs",
      fields: [
        {
          name: "api_key",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "AIza...",
          validation: (value) => {
            if (!value.startsWith("AIza")) return "API key must start with 'AIza'"
            if (value.length < 20) return "API key seems too short"
            return null
          }
        }
      ]
    },
    {
      id: "azure-openai",
      name: "Azure OpenAI",
      type: "azure",
      status: "disconnected",
      description: "OpenAI models hosted on Azure",
      documentation: "https://learn.microsoft.com/en-us/azure/cognitive-services/openai/",
      fields: [
        {
          name: "endpoint",
          label: "Azure Endpoint",
          type: "text",
          required: true,
          placeholder: "https://your-resource.openai.azure.com",
          validation: (value) => {
            if (!value.includes("openai.azure.com")) return "Must be an Azure OpenAI endpoint"
            return null
          }
        },
        {
          name: "api_key",
          label: "API Key",
          type: "password",
          required: true,
          placeholder: "Azure API key"
        },
        {
          name: "api_version",
          label: "API Version",
          type: "select",
          required: true,
          options: ["2023-12-01-preview", "2023-07-01-preview", "2023-05-15"],
          value: "2023-12-01-preview"
        }
      ]
    },
    {
      id: "github",
      name: "GitHub",
      type: "integration",
      status: "disconnected",
      description: "Connect to GitHub repositories",
      documentation: "https://docs.github.com",
      fields: [
        {
          name: "token",
          label: "Personal Access Token",
          type: "password",
          required: true,
          placeholder: "ghp_...",
          validation: (value) => {
            if (!value.startsWith("ghp_")) return "Token must start with 'ghp_'"
            if (value.length < 20) return "Token seems too short"
            return null
          }
        }
      ]
    }
  ])

  const handleFeatureToggle = (id: string) => {
    featureManager.toggleFeature(id)
  }

  const handleProviderSave = (providerId: string, config: Record<string, string>) => {
    setSaving(providerId)
    
    // Save to localStorage
    Object.entries(config).forEach(([key, value]) => {
      const storageKey = `${providerId}_${key}`
      localStorage.setItem(storageKey, value)
    })

    // Update feature status
    const feature = featureManager.store.features[providerId]
    if (feature) {
      featureManager.updateFeature(providerId, {
        hasApiKey: true,
        configRequired: false
      })
    }

    // Update provider status
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, status: "connected" as const }
        : p
    ))

    setTimeout(() => setSaving(null), 1000)
  }

  const handleProviderTest = async (providerId: string) => {
    const success = await featureManager.testFeature(providerId)
    
    // Update provider status
    setProviders(prev => prev.map(p => 
      p.id === providerId 
        ? { ...p, status: success ? "connected" as const : "error" as const }
        : p
    ))

    return success
  }

  const handleSaveAll = () => {
    featureManager.saveAll()
  }

  return (
    <div class={`comprehensive-settings ${props.className || ""}`}>
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold">Kilo Code Settings</h1>
            <p class="text-gray-600">Configure providers, features, and integrations</p>
          </div>
          <Button onClick={handleSaveAll} class="px-6 py-2 bg-blue-500 text-white rounded">
            Save All Changes
          </Button>
        </div>

        <Tabs value={activeTab()} onChange={setActiveTab}>
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="features" class="space-y-4">
            <FeatureStatusPanel 
              features={features()}
              onFeatureToggle={handleFeatureToggle}
              onSaveAll={handleSaveAll}
            />
          </TabsContent>

          <TabsContent value="providers" class="space-y-4">
            <ProviderConfigPanel 
              providers={providers()}
              onSave={handleProviderSave}
              onTest={handleProviderTest}
            />
          </TabsContent>

          <TabsContent value="tools" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <For each={features().filter(f => f.category === "tool" || f.category === "terminal")}>
                {(feature) => (
                  <Card class="p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class={`w-3 h-3 rounded-full ${
                          feature.working ? "bg-green-500" : 
                          feature.enabled ? "bg-red-500" : "bg-gray-500"
                        }`} />
                        <h3 class="font-medium">{feature.name}</h3>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onChange={() => handleFeatureToggle(feature.id)}
                      />
                    </div>
                    <p class="text-sm text-gray-600">{feature.description}</p>
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        {feature.working ? "Working" : feature.enabled ? "Broken" : "Disabled"}
                      </span>
                      <Show when={feature.microSave}>
                        <Tooltip text="Micro save this tool">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={feature.microSave}
                            class="p-1"
                          >
                            <Icon name="save" class="w-4 h-4" />
                          </Button>
                        </Tooltip>
                      </Show>
                    </div>
                  </Card>
                )}
              </For>
            </div>
          </TabsContent>

          <TabsContent value="integrations" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={features().filter(f => f.category === "integration")}>
                {(feature) => (
                  <Card class="p-4 space-y-3">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class={`w-3 h-3 rounded-full ${
                          feature.working ? "bg-green-500" : 
                          feature.enabled ? "bg-red-500" : "bg-gray-500"
                        }`} />
                        <h3 class="font-medium">{feature.name}</h3>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onChange={() => handleFeatureToggle(feature.id)}
                      />
                    </div>
                    <p class="text-sm text-gray-600">{feature.description}</p>
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
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-gray-500">
                        {feature.working ? "Connected" : feature.enabled ? "Disconnected" : "Disabled"}
                      </span>
                      <Show when={feature.configRequired && !feature.hasApiKey}>
                        <Badge variant="outline" class="text-xs">
                          ⚠️ Config Required
                        </Badge>
                      </Show>
                    </div>
                  </Card>
                )}
              </For>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
