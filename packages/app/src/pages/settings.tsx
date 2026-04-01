import { createSignal, createMemo, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@opencode-ai/ui/tabs"
import { Alert, AlertDescription } from "@opencode-ai/ui/alert"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = createSignal("overview")
  const [saving, setSaving] = createSignal<string | null>(null)

  // Feature status based on reverse engineering corpus
  const features = createMemo(() => [
    // Core Features (from FEATURE_VERIFICATION_MATRIX.md)
    {
      id: "file_operations",
      name: "File Operations",
      description: "Read, write, edit, glob, grep, and file system operations",
      category: "core",
      enabled: true,
      working: true,
      files: 1291,
      risk: "HIGH",
      status: "WORKING",
      icon: "file-text"
    },
    {
      id: "provider_routing",
      name: "Provider Routing",
      description: "18 AI providers with intelligent routing and fallback",
      category: "core",
      enabled: true,
      working: false,
      files: 353,
      risk: "CRITICAL",
      status: "NOT_CONFIGURED",
      icon: "git-branch",
      configRequired: true
    },
    {
      id: "session_management",
      name: "Session Management",
      description: "SQLite-based session store with timeout and persistence",
      category: "core",
      enabled: true,
      working: true,
      files: 409,
      risk: "CRITICAL",
      status: "WORKING",
      icon: "database"
    },
    {
      id: "agent_execution",
      name: "Agent Execution",
      description: "AI agent task execution and tool integration",
      category: "core",
      enabled: true,
      working: true,
      files: 309,
      risk: "HIGH",
      status: "WORKING",
      icon: "cpu"
    },

    // UI Features
    {
      id: "ui_sidebar",
      name: "UI Sidebar",
      description: "Enhanced sidebar with project navigation and agent manager",
      category: "ui",
      enabled: true,
      working: false,
      files: 296,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "sidebar"
    },
    {
      id: "ui_chat",
      name: "UI Chat Interface",
      description: "SolidJS-based chat interface with message history",
      category: "ui",
      enabled: true,
      working: false,
      files: 219,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "message-square"
    },
    {
      id: "webview",
      name: "Webview Integration",
      description: "VS Code webview with SolidJS components",
      category: "ui",
      enabled: true,
      working: false,
      files: 208,
      risk: "HIGH",
      status: "MISSING_FEATURES",
      icon: "globe"
    },
    {
      id: "settings",
      name: "Settings Management",
      description: "67 configuration files across all packages",
      category: "ui",
      enabled: true,
      working: false,
      files: 158,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "settings"
    },

    // Advanced Features
    {
      id: "git_operations",
      name: "Git Operations",
      description: "Git integration with commit generation and diff viewing",
      category: "advanced",
      enabled: true,
      working: true,
      files: 154,
      risk: "HIGH",
      status: "WORKING",
      icon: "git-branch"
    },
    {
      id: "terminal",
      name: "Terminal Integration",
      description: "PTY-based terminal with shell integration",
      category: "advanced",
      enabled: true,
      working: false,
      files: 106,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "terminal"
    },
    {
      id: "authentication",
      name: "Authentication",
      description: "Kilo Gateway auth with device authentication",
      category: "advanced",
      enabled: true,
      working: false,
      files: 32,
      risk: "CRITICAL",
      status: "PARTIAL",
      icon: "lock",
      configRequired: true
    },
    {
      id: "telemetry",
      name: "Telemetry",
      description: "PostHog analytics and OpenTelemetry integration",
      category: "advanced",
      enabled: false,
      working: false,
      files: 26,
      risk: "LOW",
      status: "DISABLED",
      icon: "bar-chart"
    },

    // Agent Manager Features
    {
      id: "agent_manager",
      name: "Agent Manager",
      description: "Multi-session orchestration with git worktree isolation",
      category: "agent",
      enabled: true,
      working: false,
      files: 89,
      risk: "HIGH",
      status: "MISSING_FEATURES",
      icon: "users"
    },
    {
      id: "autocomplete_services",
      name: "Autocomplete Services",
      description: "Multiple autocomplete providers and strategies",
      category: "agent",
      enabled: true,
      working: false,
      files: 67,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "code"
    },
    {
      id: "browser_automation",
      name: "Browser Automation",
      description: "Playwright-based browser control and automation",
      category: "agent",
      enabled: true,
      working: false,
      files: 45,
      risk: "HIGH",
      status: "MISSING_FEATURES",
      icon: "globe"
    },

    // Missing Features from Images
    {
      id: "openhands",
      name: "OpenHands Integration",
      description: "OpenHands AI agent for coding and automation",
      category: "provider",
      enabled: false,
      working: false,
      files: 0,
      risk: "MEDIUM",
      status: "NOT_IMPLEMENTED",
      icon: "bot"
    },
    {
      id: "prompt_composer",
      name: "Prompt Composer",
      description: "Advanced prompt editing with templates and variables",
      category: "ui",
      enabled: true,
      working: false,
      files: 0,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "edit"
    },
    {
      id: "context_manager",
      name: "Context Manager",
      description: "Session context and memory management",
      category: "core",
      enabled: true,
      working: false,
      files: 0,
      risk: "MEDIUM",
      status: "MISSING_FEATURES",
      icon: "layers"
    }
  ])

  const providers = createMemo(() => [
    { id: "openai", name: "OpenAI", status: "disconnected", configured: false },
    { id: "anthropic", name: "Anthropic Claude", status: "disconnected", configured: false },
    { id: "openrouter", name: "OpenRouter", status: "disconnected", configured: false },
    { id: "google-ai", name: "Google AI", status: "disconnected", configured: false },
    { id: "azure-openai", name: "Azure OpenAI", status: "disconnected", configured: false },
    { id: "ollama", name: "Ollama", status: "disconnected", configured: false },
    { id: "openhands", name: "OpenHands", status: "disconnected", configured: false },
    { id: "github", name: "GitHub Models", status: "disconnected", configured: false }
  ])

  const stats = createMemo(() => {
    const allFeatures = features()
    return {
      total: allFeatures.length,
      working: allFeatures.filter(f => f.working).length,
      broken: allFeatures.filter(f => f.enabled && !f.working).length,
      disabled: allFeatures.filter(f => !f.enabled).length,
      configured: allFeatures.filter(f => f.configRequired && f.configured).length,
      critical: allFeatures.filter(f => f.risk === "CRITICAL" && !f.working).length
    }
  })

  const handleFeatureToggle = (featureId: string) => {
    // Implementation would toggle feature
    console.log("Toggle feature:", featureId)
  }

  const handleMicroSave = (featureId: string) => {
    setSaving(featureId)
    setTimeout(() => setSaving(null), 1000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WORKING": return "text-green-500"
      case "PARTIAL": return "text-yellow-500"
      case "MISSING_FEATURES": return "text-orange-500"
      case "NOT_CONFIGURED": return "text-blue-500"
      case "DISABLED": return "text-gray-500"
      default: return "text-red-500"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "CRITICAL": return "bg-red-100 text-red-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "LOW": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div class="p-6 space-y-6">
      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">Kilo Code Settings</h1>
          <p class="text-gray-600">Complete system configuration and feature management</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-2xl font-bold text-green-600">{stats().working}/{stats().total}</div>
            <div class="text-sm text-gray-600">Features Working</div>
          </div>
          <Button class="px-6 py-2 bg-blue-500 text-white rounded">
            <Icon name="save" class="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <Show when={stats().critical > 0}>
        <Alert class="border-red-200 bg-red-50">
          <Icon name="alert-triangle" class="h-4 w-4 text-red-600" />
          <AlertDescription>
            {stats().critical} critical features are not working. This may impact core functionality.
          </AlertDescription>
        </Alert>
      </Show>

      <Show when={stats().broken > 0}>
        <Alert class="border-orange-200 bg-orange-50">
          <Icon name="info" class="h-4 w-4 text-orange-600" />
          <AlertDescription>
            {stats().broken} enabled features have issues. Check the detailed status below.
          </AlertDescription>
        </Alert>
      </Show>

      {/* Stats Overview */}
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Icon name="check-circle" class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{stats().working}</div>
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
              <div class="text-2xl font-bold">{stats().broken}</div>
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
              <div class="text-2xl font-bold">{stats().disabled}</div>
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
              <div class="text-2xl font-bold">{stats().configured}</div>
              <div class="text-sm text-gray-600">Configured</div>
            </div>
          </div>
        </Card>
        
        <Card class="p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="alert-triangle" class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div class="text-2xl font-bold">{stats().critical}</div>
              <div class="text-sm text-gray-600">Critical Issues</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab()} onChange={setActiveTab}>
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="corpus">Corpus Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" class="space-y-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Status */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">System Status</h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span>Kilo Code Version</span>
                  <Badge>7.1.9</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span>Total Files</span>
                  <Badge>5,046</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span>Packages</span>
                  <Badge>12</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span>Code Zones</span>
                  <Badge>5</Badge>
                </div>
                <div class="flex justify-between items-center">
                  <span>Reverse Engineering</span>
                  <Badge variant="default">Complete</Badge>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
              <div class="space-y-2">
                <Button variant="outline" class="w-full justify-start">
                  <Icon name="play" class="w-4 h-4 mr-2" />
                  Test All Features
                </Button>
                <Button variant="outline" class="w-full justify-start">
                  <Icon name="refresh-cw" class="w-4 h-4 mr-2" />
                  Reset Broken Features
                </Button>
                <Button variant="outline" class="w-full justify-start">
                  <Icon name="download" class="w-4 h-4 mr-2" />
                  Export Configuration
                </Button>
                <Button variant="outline" class="w-full justify-start">
                  <Icon name="upload" class="w-4 h-4 mr-2" />
                  Import Configuration
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" class="space-y-4">
          <div class="space-y-4">
            <For each={features()}>
              {(feature) => (
                <Card class="p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                      <Icon name={feature.icon} class={`w-5 h-5 ${getStatusColor(feature.status)}`} />
                      <div>
                        <h3 class="font-medium">{feature.name}</h3>
                        <p class="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Badge variant="outline" class={getRiskColor(feature.risk)}>
                        {feature.risk}
                      </Badge>
                      <Switch
                        checked={feature.enabled}
                        onChange={() => handleFeatureToggle(feature.id)}
                      />
                    </div>
                  </div>

                  <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-4">
                      <span class={`font-medium ${getStatusColor(feature.status)}`}>
                        {feature.status}
                      </span>
                      <span class="text-gray-500">{feature.files} files</span>
                      <Show when={feature.configRequired}>
                        <Badge variant="outline" class="text-xs">Config Required</Badge>
                      </Show>
                    </div>
                    <div class="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={saving() === feature.id}
                        onClick={() => handleMicroSave(feature.id)}
                      >
                        <Icon name="save" class="w-4 h-4 mr-1" />
                        <Show when={saving() === feature.id}>
                          Saving...
                        </Show>
                        <Show when={saving() !== feature.id}>
                          Micro Save
                        </Show>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </TabsContent>

        <TabsContent value="providers" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <For each={providers()}>
              {(provider) => (
                <Card class="p-4">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-medium">{provider.name}</h3>
                    <div class={`w-3 h-3 rounded-full ${
                      provider.status === "connected" ? "bg-green-500" : 
                      provider.status === "error" ? "bg-red-500" : "bg-gray-500"
                    }`} />
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span>Status</span>
                      <span class="capitalize">{provider.status}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span>Configured</span>
                      <span>{provider.configured ? "Yes" : "No"}</span>
                    </div>
                    <Button variant="outline" size="sm" class="w-full mt-2">
                      Configure
                    </Button>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </TabsContent>

        <TabsContent value="advanced" class="space-y-4">
          <Alert>
            <Icon name="info" class="h-4 w-4" />
            <AlertDescription>
              Advanced settings allow you to configure system-level behavior and debugging options.
            </AlertDescription>
          </Alert>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Debug Options</h3>
              <div class="space-y-3">
                <label class="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Enable verbose logging</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Enable debug mode</span>
                </label>
                <label class="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Enable feature tracing</span>
                </label>
              </div>
            </Card>

            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Performance</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Cache Size</span>
                  <input type="number" class="w-20 px-2 py-1 border rounded" value="100" />
                </div>
                <div class="flex justify-between">
                  <span>Timeout (ms)</span>
                  <input type="number" class="w-20 px-2 py-1 border rounded" value="30000" />
                </div>
                <div class="flex justify-between">
                  <span>Max Concurrent</span>
                  <input type="number" class="w-20 px-2 py-1 border rounded" value="5" />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="corpus" class="space-y-4">
          <Alert>
            <Icon name="database" class="h-4 w-4" />
            <AlertDescription>
              This data is sourced from the Kilo Code Reverse Engineering Corpus containing 5,046 files across 632 directories.
            </AlertDescription>
          </Alert>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Corpus Statistics</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Total Files</span>
                  <span class="font-mono">5,046</span>
                </div>
                <div class="flex justify-between">
                  <span>Total Directories</span>
                  <span class="font-mono">632</span>
                </div>
                <div class="flex justify-between">
                  <span>Lines of Code</span>
                  <span class="font-mono">~892,000</span>
                </div>
                <div class="flex justify-between">
                  <span>Packages</span>
                  <span class="font-mono">12</span>
                </div>
                <div class="flex justify-between">
                  <span>Code Zones</span>
                  <span class="font-mono">5</span>
                </div>
              </div>
            </Card>

            <Card class="p-6">
              <h3 class="text-lg font-semibold mb-4">Feature Categories</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span>Core Features</span>
                  <Badge>4</Badge>
                </div>
                <div class="flex justify-between">
                  <span>UI Features</span>
                  <Badge>4</Badge>
                </div>
                <div class="flex justify-between">
                  <span>Advanced Features</span>
                  <Badge>4</Badge>
                </div>
                <div class="flex justify-between">
                  <span>Agent Features</span>
                  <Badge>3</Badge>
                </div>
                <div class="flex justify-between">
                  <span>Missing Features</span>
                  <Badge variant="destructive">3</Badge>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
