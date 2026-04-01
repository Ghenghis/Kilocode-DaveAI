import { createSignal, For, Show, Component } from "solid-js"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Input } from "@opencode-ai/ui/input"
import { Label } from "@opencode-ai/ui/label"
import { Textarea } from "@opencode-ai/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@opencode-ai/ui/select"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Tooltip } from "@opencode-ai/ui/tooltip"

export interface ProviderConfig {
  id: string
  name: string
  type: "openai" | "anthropic" | "google" | "azure" | "openrouter" | "local" | "aws"
  status: "connected" | "disconnected" | "error"
  fields: ProviderField[]
  description: string
  documentation?: string
}

export interface ProviderField {
  name: string
  label: string
  type: "text" | "password" | "textarea" | "select"
  required: boolean
  placeholder?: string
  options?: string[]
  value?: string
  validation?: (value: string) => string | null
}

interface ProviderConfigPanelProps {
  providers: ProviderConfig[]
  onSave: (providerId: string, config: Record<string, string>) => void
  onTest: (providerId: string) => Promise<boolean>
}

export const ProviderConfigPanel: Component<ProviderConfigPanelProps> = (props) => {
  const [selectedProvider, setSelectedProvider] = createSignal<string | null>(null)
  const [configs, setConfigs] = createSignal<Record<string, Record<string, string>>>({})
  const [testing, setTesting] = createSignal<string | null>(null)
  const [errors, setErrors] = createSignal<Record<string, Record<string, string>>>({})

  const selectedProviderData = createMemo(() => {
    const id = selectedProvider()
    return props.providers.find(p => p.id === id)
  })

  const handleFieldChange = (providerId: string, fieldName: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldName]: value
      }
    }))

    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [fieldName]: undefined
      }
    }))
  }

  const handleSave = (providerId: string) => {
    const config = configs()[providerId] || {}
    const provider = props.providers.find(p => p.id === providerId)
    
    if (!provider) return

    // Validate required fields
    const newErrors: Record<string, string> = {}
    let hasErrors = false

    for (const field of provider.fields) {
      if (field.required && !config[field.name]) {
        newErrors[field.name] = `${field.label} is required`
        hasErrors = true
      }

      if (field.validation && config[field.name]) {
        const error = field.validation(config[field.name])
        if (error) {
          newErrors[field.name] = error
          hasErrors = true
        }
      }
    }

    if (hasErrors) {
      setErrors(prev => ({
        ...prev,
        [providerId]: newErrors
      }))
      return
    }

    // Clear errors and save
    setErrors(prev => ({
      ...prev,
      [providerId]: {}
    }))
    props.onSave(providerId, config)
  }

  const handleTest = async (providerId: string) => {
    setTesting(providerId)
    try {
      const success = await props.onTest(providerId)
      if (!success) {
        setErrors(prev => ({
          ...prev,
          [providerId]: {
            ...prev[providerId],
            test: "Connection test failed"
          }
        }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          test: `Test error: ${error}`
        }
      }))
    } finally {
      setTesting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500"
      case "disconnected": return "bg-gray-500"
      case "error": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const renderField = (providerId: string, field: ProviderField) => {
    const config = configs()[providerId] || {}
    const error = errors()[providerId]?.[field.name]

    return (
      <div class="space-y-2">
        <Label for={`${providerId}-${field.name}`}>
          {field.label}
          {field.required && <span class="text-red-500 ml-1">*</span>}
        </Label>
        
        {field.type === "select" ? (
          <Select
            value={config[field.name] || ""}
            onChange={(value) => handleFieldChange(providerId, field.name, value)}
          >
            <SelectTrigger id={`${providerId}-${field.name}`}>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <For each={field.options || []}>
                {(option) => (
                  <SelectItem value={option}>{option}</SelectItem>
                )}
              </For>
            </SelectContent>
          </Select>
        ) : field.type === "textarea" ? (
          <Textarea
            id={`${providerId}-${field.name}`}
            value={config[field.name] || ""}
            onInput={(e) => handleFieldChange(providerId, field.name, e.target.value)}
            placeholder={field.placeholder}
            class={error ? "border-red-500" : ""}
          />
        ) : (
          <Input
            id={`${providerId}-${field.name}`}
            type={field.type}
            value={config[field.name] || ""}
            onInput={(e) => handleFieldChange(providerId, field.name, e.target.value)}
            placeholder={field.placeholder}
            class={error ? "border-red-500" : ""}
          />
        )}
        
        <Show when={error}>
          <div class="text-sm text-red-600">{error}</div>
        </Show>
      </div>
    )
  }

  return (
    <div class="p-4 space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Provider Configuration</h2>
        <div class="text-sm text-gray-600">
          Configure API keys and settings for AI providers
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider List */}
        <div class="space-y-2">
          <h3 class="font-medium">Providers</h3>
          <For each={props.providers}>
            {(provider) => (
              <Card 
                class={`p-3 cursor-pointer transition-colors ${
                  selectedProvider() === provider.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedProvider(provider.id)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <div class={`w-2 h-2 rounded-full ${getStatusColor(provider.status)}`} />
                    <span class="font-medium">{provider.name}</span>
                  </div>
                  <Badge variant="outline">{provider.type}</Badge>
                </div>
                <div class="text-sm text-gray-600 mt-1">{provider.description}</div>
              </Card>
            )}
          </For>
        </div>

        {/* Configuration Panel */}
        <div class="lg:col-span-2">
          <Show when={selectedProviderData()}>
            {(provider) => (
              <Card class="p-6 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="font-medium text-lg">{provider.name}</h3>
                    <p class="text-sm text-gray-600">{provider.description}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class={`w-3 h-3 rounded-full ${getStatusColor(provider.status)}`} />
                    <span class="text-sm capitalize">{provider.status}</span>
                  </div>
                </div>

                <Show when={provider.documentation}>
                  <div class="text-sm">
                    <a 
                      href={provider.documentation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      class="text-blue-600 hover:underline"
                    >
                      📚 Documentation
                    </a>
                  </div>
                </Show>

                <div class="space-y-4">
                  <For each={provider.fields}>
                    {(field) => renderField(provider.id, field)}
                  </For>
                </div>

                <Show when={errors()[provider.id]?.test}>
                  <div class="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {errors()[provider.id].test}
                  </div>
                </Show>

                <div class="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleSave(provider.id)}
                    class="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Save Configuration
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleTest(provider.id)}
                    disabled={testing() === provider.id}
                    class="px-4 py-2"
                  >
                    <Show when={testing() === provider.id}>
                      Testing...
                    </Show>
                    <Show when={testing() !== provider.id}>
                      Test Connection
                    </Show>
                  </Button>
                </div>
              </Card>
            )}
          </Show>

          <Show when={!selectedProvider()}>
            <Card class="p-6 text-center text-gray-500">
              Select a provider to configure its settings
            </Card>
          </Show>
        </div>
      </div>
    </div>
  )
}
