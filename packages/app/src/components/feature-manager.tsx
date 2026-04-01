import { createSignal, createEffect, createMemo, For, Show, Component } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import { Card } from "@opencode-ai/ui/card"
import { Button } from "@opencode-ai/ui/button"
import { Badge } from "@opencode-ai/ui/badge"
import { Icon } from "@opencode-ai/ui/icon"
import { Switch } from "@opencode-ai/ui/switch"
import { Tooltip } from "@opencode-ai/ui/tooltip"
import { useGlobalSync } from "@/context/global-sync"
import { useGlobalSDK } from "@/context/global-sdk"

export interface FeatureStatus {
  id: string
  name: string
  description: string
  category: "provider" | "tool" | "ui" | "integration" | "terminal" | "prompt" | "context"
  enabled: boolean
  working: boolean
  lastChecked: Date
  error?: string
  configRequired?: boolean
  hasApiKey?: boolean
  connected?: boolean
  version?: string
  documentation?: string
  microSave?: () => void
  test?: () => Promise<boolean>
}

type FeatureStore = {
  features: Record<string, FeatureStatus>
  lastUpdate: Date
}

export const createFeatureManager = () => {
  const [store, setStore] = createStore<FeatureStore>({
    features: {},
    lastUpdate: new Date()
  })

  const globalSync = useGlobalSync()
  const globalSDK = useGlobalSDK()

  // Initialize default features
  createEffect(() => {
    const defaultFeatures: Record<string, FeatureStatus> = {
      // AI Providers
      "openai": {
        id: "openai",
        name: "OpenAI",
        description: "GPT-4, GPT-3.5, and other OpenAI models",
        category: "provider",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://platform.openai.com/docs",
        test: async () => {
          try {
            // Test OpenAI connection
            const response = await fetch("https://api.openai.com/v1/models", {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("openai_api_key")}`
              }
            })
            return response.ok
          } catch {
            return false
          }
        }
      },
      "anthropic": {
        id: "anthropic",
        name: "Anthropic Claude",
        description: "Claude 3.5, Claude 3, and other Anthropic models",
        category: "provider",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://docs.anthropic.com",
        test: async () => {
          try {
            // Test Anthropic connection
            const response = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": localStorage.getItem("anthropic_api_key") || "",
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
              },
              body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: 10,
                messages: [{ role: "user", content: "test" }]
              })
            })
            return response.ok
          } catch {
            return false
          }
        }
      },
      "openrouter": {
        id: "openrouter",
        name: "OpenRouter",
        description: "Access to 100+ AI models via OpenRouter",
        category: "provider",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://openrouter.ai/docs",
        test: async () => {
          try {
            // Test OpenRouter connection
            const response = await fetch("https://openrouter.ai/api/v1/models", {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("openrouter_api_key")}`
              }
            })
            return response.ok
          } catch {
            return false
          }
        }
      },
      "openhands": {
        id: "openhands",
        name: "OpenHands",
        description: "AI agent for coding and automation tasks",
        category: "provider",
        enabled: false,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://github.com/OpenHands/openhands",
        test: async () => {
          try {
            // Test OpenHands connection
            const response = await fetch(`${localStorage.getItem("openhands_endpoint") || "http://localhost:3000"}/health`)
            return response.ok
          } catch {
            return false
          }
        }
      },
      "google-ai": {
        id: "google-ai",
        name: "Google AI",
        description: "Gemini, PaLM, and other Google AI models",
        category: "provider",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://ai.google.dev/docs",
        test: async () => {
          try {
            // Test Google AI connection
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${localStorage.getItem("google_ai_api_key")}`)
            return response.ok
          } catch {
            return false
          }
        }
      },
      "azure-openai": {
        id: "azure-openai",
        name: "Azure OpenAI",
        description: "OpenAI models hosted on Azure",
        category: "provider",
        enabled: false,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://learn.microsoft.com/en-us/azure/cognitive-services/openai/",
        test: async () => {
          try {
            // Test Azure OpenAI connection
            const endpoint = localStorage.getItem("azure_openai_endpoint")
            const apiKey = localStorage.getItem("azure_openai_api_key")
            if (!endpoint || !apiKey) return false
            
            const response = await fetch(`${endpoint}/openai/deployments?api-version=2023-12-01-preview`, {
              headers: {
                "api-key": apiKey
              }
            })
            return response.ok
          } catch {
            return false
          }
        }
      },
      "ollama": {
        id: "ollama",
        name: "Ollama",
        description: "Local LLM hosting with Ollama",
        category: "provider",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        hasApiKey: false,
        connected: false,
        documentation: "https://ollama.ai/docs",
        test: async () => {
          try {
            // Test Ollama connection
            const response = await fetch("http://localhost:11434/api/tags")
            return response.ok
          } catch {
            return false
          }
        }
      },
      
      // Tools
      "terminal": {
        id: "terminal",
        name: "Terminal Integration",
        description: "Execute terminal commands and scripts",
        category: "terminal",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        microSave: () => {
          // Save terminal settings
          const settings = globalSync.child("terminal", { bootstrap: false })
          settings.set("enabled", store.features.terminal.enabled)
        },
        test: async () => {
          try {
            // Test terminal functionality
            return !!globalSDK().server
          } catch {
            return false
          }
        }
      },
      "browser-automation": {
        id: "browser-automation",
        name: "Browser Automation",
        description: "Automate web browser interactions",
        category: "tool",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        documentation: "https://playwright.dev",
        test: async () => {
          try {
            // Test browser automation
            const response = await fetch("/api/browser/status")
            return response.ok
          } catch {
            return false
          }
        }
      },
      "git-integration": {
        id: "git-integration",
        name: "Git Integration",
        description: "Git operations and version control",
        category: "tool",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        test: async () => {
          try {
            // Test git integration
            const response = await fetch("/api/git/status")
            return response.ok
          } catch {
            return false
          }
        }
      },
      
      // UI Features
      "prompt-composer": {
        id: "prompt-composer",
        name: "Prompt Composer",
        description: "Advanced prompt editing and templates",
        category: "prompt",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        microSave: () => {
          // Save prompt settings
          const settings = globalSync.child("prompts", { bootstrap: false })
          settings.set("enabled", store.features["prompt-composer"].enabled)
        }
      },
      "context-manager": {
        id: "context-manager",
        name: "Context Manager",
        description: "Manage conversation context and memory",
        category: "context",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        microSave: () => {
          // Save context settings
          const settings = globalSync.child("context", { bootstrap: false })
          settings.set("enabled", store.features["context-manager"].enabled)
        }
      },
      "code-analysis": {
        id: "code-analysis",
        name: "Code Analysis",
        description: "Analyze and understand code structure",
        category: "tool",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        test: async () => {
          try {
            // Test code analysis
            const response = await fetch("/api/analysis/status")
            return response.ok
          } catch {
            return false
          }
        }
      },
      
      // Integrations
      "github-integration": {
        id: "github-integration",
        name: "GitHub Integration",
        description: "Connect to GitHub repositories",
        category: "integration",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: true,
        hasApiKey: false,
        connected: false,
        documentation: "https://docs.github.com",
        test: async () => {
          try {
            // Test GitHub integration
            const token = localStorage.getItem("github_token")
            if (!token) return false
            
            const response = await fetch("https://api.github.com/user", {
              headers: {
                "Authorization": `token ${token}`
              }
            })
            return response.ok
          } catch {
            return false
          }
        }
      },
      "vscode-integration": {
        id: "vscode-integration",
        name: "VS Code Integration",
        description: "Connect to VS Code editor",
        category: "integration",
        enabled: true,
        working: false,
        lastChecked: new Date(),
        configRequired: false,
        test: async () => {
          try {
            // Test VS Code integration
            const response = await fetch("/api/vscode/status")
            return response.ok
          } catch {
            return false
          }
        }
      }
    }

    setStore("features", defaultFeatures)
  })

  // Auto-test features periodically
  createEffect(() => {
    const interval = setInterval(async () => {
      const features = store.features
      const updatedFeatures: Record<string, FeatureStatus> = {}

      for (const [id, feature] of Object.entries(features)) {
        if (feature.enabled && feature.test) {
          try {
            const working = await feature.test()
            updatedFeatures[id] = {
              ...feature,
              working,
              lastChecked: new Date(),
              error: working ? undefined : "Connection test failed"
            }
          } catch (error) {
            updatedFeatures[id] = {
              ...feature,
              working: false,
              lastChecked: new Date(),
              error: `Test error: ${error}`
            }
          }
        }
      }

      if (Object.keys(updatedFeatures).length > 0) {
        setStore("features", updatedFeatures)
      }
    }, 30000) // Test every 30 seconds

    return () => clearInterval(interval)
  })

  return {
    store,
    setStore,
    toggleFeature: (id: string) => {
      setStore("features", id, "enabled", !store.features[id].enabled)
    },
    updateFeature: (id: string, updates: Partial<FeatureStatus>) => {
      setStore("features", id, updates)
    },
    testFeature: async (id: string) => {
      const feature = store.features[id]
      if (feature.test) {
        try {
          const working = await feature.test()
          setStore("features", id, {
            working,
            lastChecked: new Date(),
            error: working ? undefined : "Connection test failed"
          })
          return working
        } catch (error) {
          setStore("features", id, {
            working: false,
            lastChecked: new Date(),
            error: `Test error: ${error}`
          })
          return false
        }
      }
      return false
    },
    saveAll: () => {
      // Save all feature states
      const settings = globalSync.child("features", { bootstrap: false })
      settings.set("features", store.features)
      setStore("lastUpdate", new Date())
    }
  }
}
