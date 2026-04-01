import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opencode-ai/ui/tabs"
import { Button } from "@opencode-ai/ui/button"
import { Card } from "@opencode-ai/ui/card"
import { Badge } from "@opencode-ai/ui/badge"
import { Alert, AlertDescription } from "@opencode-ai/ui/alert"
import { Icon } from "@opencode-ai/ui/icon"
import { SystemStatusDashboard, type DetailedFeatureStatus } from "./system-status-dashboard"
import { ProviderConfigPanel, type ProviderConfig } from "./provider-config-panel"
import { FeatureStatusPanel, type FeatureStatus } from "./feature-status-panel"
import { createFeatureManager } from "./feature-manager"

interface ComprehensiveSettingsPageProps {
  className?: string
}

export const ComprehensiveSettingsPage: Component<ComprehensiveSettingsPageProps> = (props) => {
  const [activeTab, setActiveTab] = createSignal("dashboard")
  const [saving, setSaving] = createSignal<string | null>(null)
  const featureManager = createFeatureManager()

  // Convert feature manager store to detailed status
  const detailedFeatures = createMemo(() => {
    return Object.values(featureManager.store.features).map(feature => ({
      ...feature,
      configured: feature.hasApiKey || false,
      dependencies: getFeatureDependencies(feature.id),
      documentation: feature.documentation,
      actions: {
        test: feature.test,
        configure: () => openProviderConfig(feature.id),
        save: feature.microSave,
        reset: () => resetFeature(feature.id)
      }
    }))
  })

  const simpleFeatures = createMemo(() => {
    return Object.values(featureManager.store.features).map(feature => ({
      id: feature.id,
      name: feature.name,
      description: feature.description,
      category: feature.category,
      enabled: feature.enabled,
      working: feature.working,
      lastChecked: feature.lastChecked,
      error: feature.error,
      configRequired: feature.configRequired,
      microSave: feature.microSave
    }))
  })

  const providers = createMemo(() => {
    return generateProviderConfigs(detailedFeatures())
  })

  const getFeatureDependencies = (featureId: string): string[] => {
    const dependencyMap: Record<string, string[]> = {
      "openai": ["network", "api-key"],
      "anthropic": ["network", "api-key"],
      "openrouter": ["network", "api-key"],
      "openhands": ["network", "endpoint"],
      "google-ai": ["network", "api-key"],
      "azure-openai": ["network", "api-key", "endpoint"],
      "ollama": ["network", "local-service"],
      "terminal": ["system-access"],
      "browser-automation": ["playwright", "system-access"],
      "git-integration": ["git", "system-access"],
      "github-integration": ["network", "api-key"],
      "vscode-integration": ["vscode", "network"]
    }
    return dependencyMap[featureId] || []
  }

  const generateProviderConfigs = (features: DetailedFeatureStatus[]): ProviderConfig[] => {
    const providerFeatures = features.filter(f => f.category === "provider")
    
    return providerFeatures.map(feature => ({
      id: feature.id,
      name: feature.name,
      type: getProviderType(feature.id),
      status: feature.working ? "connected" : feature.enabled ? "error" : "disconnected",
      description: feature.description,
      documentation: feature.documentation,
      fields: getProviderFields(feature.id)
    }))
  }

  const getProviderType = (providerId: string): ProviderConfig["type"] => {
    const typeMap: Record<string, ProviderConfig["type"]> = {
      "openai": "openai",
      "anthropic": "anthropic",
      "openrouter": "openrouter",
      "openhands": "local",
      "google-ai": "google",
      "azure-openai": "azure",
      "ollama": "local"
    }
    return typeMap[providerId] || "openai"
  }

  const getProviderFields = (providerId: string) => {
    const fieldsMap: Record<string, any[]> = {
      "openai": [
        { name: "api_key", label: "API Key", type: "password", required: true, placeholder: "sk-..." },
        { name: "organization", label: "Organization ID", type: "text", required: false, placeholder: "org-..." }
      ],
      "anthropic": [
        { name: "api_key", label: "API Key", type: "password", required: true, placeholder: "sk-ant-..." }
      ],
      "openrouter": [
        { name: "api_key", label: "API Key", type: "password", required: true, placeholder: "sk-or-..." }
      ],
      "openhands": [
        { name: "endpoint", label: "Endpoint URL", type: "text", required: true, placeholder: "http://localhost:3000" },
        { name: "api_key", label: "API Key", type: "password", required: false }
      ],
      "google-ai": [
        { name: "api_key", label: "API Key", type: "password", required: true, placeholder: "AIza..." }
      ],
      "azure-openai": [
        { name: "endpoint", label: "Azure Endpoint", type: "text", required: true, placeholder: "https://your-resource.openai.azure.com" },
        { name: "api_key", label: "API Key", type: "password", required: true },
        { name: "api_version", label: "API Version", type: "select", required: true, options: ["2023-12-01-preview", "2023-07-01-preview"], value: "2023-12-01-preview" }
      ],
      "ollama": [
        { name: "endpoint", label: "Ollama Endpoint", type: "text", required: false, placeholder: "http://localhost:11434" }
      ]
    }
    return fieldsMap[providerId] || []
  }

  const handleFeatureToggle = (id: string) => {
    featureManager.toggleFeature(id)
  }

  const handleFeatureAction = (id: string, action: string) => {
    switch (action) {
      case "configure":
        openProviderConfig(id)
        break
      case "save":
        const feature = featureManager.store.features[id]
        if (feature.microSave) {
          feature.microSave()
        }
        break
      case "reset":
        resetFeature(id)
        break
    }
  }

  const openProviderConfig = (providerId: string) => {
    setActiveTab("providers")
    // Could add logic to pre-select the provider
  }

  const resetFeature = (featureId: string) => {
    featureManager.updateFeature(featureId, {
      enabled: false,
      working: false,
      hasApiKey: false,
      configRequired: true,
      error: undefined
    })
  }

  const handleProviderSave = (providerId: string, config: Record<string, string>) => {
    setSaving(providerId)
    
    // Save to localStorage
    Object.entries(config).forEach(([key, value]) => {
      localStorage.setItem(`${providerId}_${key}`, value)
    })

    // Update feature status
    featureManager.updateFeature(providerId, {
      hasApiKey: true,
      configRequired: false
    })

    setTimeout(() => setSaving(null), 1000)
  }

  const handleProviderTest = async (providerId: string) => {
    return await featureManager.testFeature(providerId)
  }

  const handleSaveAll = () => {
    featureManager.saveAll()
  }

  const overallStats = createMemo(() => {
    const features = detailedFeatures()
    const total = features.length
    const working = features.filter(f => f.working).length
    const broken = features.filter(f => f.enabled && !f.working).length
    const disabled = features.filter(f => !f.enabled).length
    const configured = features.filter(f => f.configured).length

    return { total, working, broken, disabled, configured }
  })

  return (
    <div class={`comprehensive-settings-page ${props.className || ""}`}>
      <div class="p-6 space-y-6">
        {/* Header */}
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Kilo Code Settings</h1>
            <p class="text-gray-600">Configure providers, monitor features, and manage integrations</p>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-lg font-semibold text-green-600">{overallStats().working}/{overallStats().total}</div>
              <div class="text-sm text-gray-600">Features Working</div>
            </div>
            <Button onClick={handleSaveAll} class="px-6 py-2 bg-blue-500 text-white rounded">
              <Icon name="save" class="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Icon name="check-circle" class="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div class="text-2xl font-bold">{overallStats().working}</div>
                <div class="text-sm text-gray-600">Working</div>
              </div>
            </div>
          </Card>
          
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Icon name="x-circle" class="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div class="text-2xl font-bold">{overallStats().broken}</div>
                <div class="text-sm text-gray-600">Broken</div>
              </div>
            </div>
          </Card>
          
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon name="circle-slash" class="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div class="text-2xl font-bold">{overallStats().disabled}</div>
                <div class="text-sm text-gray-600">Disabled</div>
              </div>
            </div>
          </Card>
          
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Icon name="settings" class="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div class="text-2xl font-bold">{overallStats().configured}</div>
                <div class="text-sm text-gray-600">Configured</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Alerts */}
        <Show when={overallStats().broken > 0}>
          <Alert class="border-red-200 bg-red-50">
            <Icon name="alert-triangle" class="h-4 w-4 text-red-600" />
            <AlertDescription>
              You have {overallStats().broken} enabled features that are not working. Check the Dashboard tab for details.
            </AlertDescription>
          </Alert>
        </Show>

        <Show when={overallStats().configured < overallStats().total}>
          <Alert class="border-yellow-200 bg-yellow-50">
            <Icon name="info" class="h-4 w-4 text-yellow-600" />
            <AlertDescription>
              {overallStats().total - overallStats().configured} features need configuration. Check the Providers tab.
            </AlertDescription>
          </Alert>
        </Show>

        {/* Main Tabs */}
        <Tabs value={activeTab()} onChange={setActiveTab}>
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" class="space-y-4">
            <SystemStatusDashboard 
              features={detailedFeatures()}
              onFeatureToggle={handleFeatureToggle}
              onFeatureAction={handleFeatureAction}
            />
          </TabsContent>

          <TabsContent value="providers" class="space-y-4">
            <ProviderConfigPanel 
              providers={providers()}
              onSave={handleProviderSave}
              onTest={handleProviderTest}
            />
          </TabsContent>

          <TabsContent value="features" class="space-y-4">
            <FeatureStatusPanel 
              features={simpleFeatures()}
              onFeatureToggle={handleFeatureToggle}
              onSaveAll={handleSaveAll}
            />
          </TabsContent>

          <TabsContent value="advanced" class="space-y-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Information */}
              <Card class="p-6">
                <h3 class="text-lg font-semibold mb-4">System Information</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Kilo Code Version</span>
                    <span class="font-medium">7.1.9</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Platform</span>
                    <span class="font-medium">Windows</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Node Version</span>
                    <span class="font-medium">20.x</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Bun Version</span>
                    <span class="font-medium">1.3.10</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Last Update</span>
                    <span class="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card class="p-6">
                <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
                <div class="space-y-3">
                  <Button variant="outline" class="w-full justify-start" onClick={() => handleSaveAll()}>
                    <Icon name="save" class="w-4 h-4 mr-2" />
                    Save All Settings
                  </Button>
                  <Button variant="outline" class="w-full justify-start" onClick={() => {
                    // Test all features
                    detailedFeatures().forEach(feature => {
                      if (feature.enabled && feature.actions?.test) {
                        feature.actions.test()
                      }
                    })
                  }}>
                    <Icon name="play" class="w-4 h-4 mr-2" />
                    Test All Features
                  </Button>
                  <Button variant="outline" class="w-full justify-start" onClick={() => {
                    // Reset all broken features
                    detailedFeatures().filter(f => f.enabled && !f.working).forEach(feature => {
                      resetFeature(feature.id)
                    })
                  }}>
                    <Icon name="refresh-cw" class="w-4 h-4 mr-2" />
                    Reset Broken Features
                  </Button>
                  <Button variant="outline" class="w-full justify-start" onClick={() => {
                    // Export settings
                    const settings = JSON.stringify(featureManager.store, null, 2)
                    const blob = new Blob([settings], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'kilo-code-settings.json'
                    a.click()
                  }}>
                    <Icon name="download" class="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
