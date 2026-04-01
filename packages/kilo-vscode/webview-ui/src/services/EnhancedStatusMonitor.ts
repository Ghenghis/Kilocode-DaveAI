/**
 * Enhanced Status Monitor
 * Comprehensive status tracking for all Kilo Code features
 * Based on corpus analysis of 12 feature categories and 7 providers
 */

import { createSignal, createEffect, onCleanup } from "solid-js"
import type { 
  ProviderStatus, 
  FeatureStatus, 
  PerformanceMetrics, 
  ErrorEntry,
  HealthScore,
  SystemStatus
} from "../types/status"

interface EnhancedStatusMonitorProps {
  onStatusUpdate?: (status: SystemStatus) => void
  onError?: (error: ErrorEntry) => void
}

export class EnhancedStatusMonitor {
  private statusUpdateCallbacks: ((status: SystemStatus) => void)[] = []
  private errorCallbacks: ((error: ErrorEntry) => void)[] = []
  private refreshInterval: number | null = null
  private healthCheckInterval: number | null = null

  // Signals for reactive state
  private providersSignal = createSignal<ProviderStatus[]>([])
  private featuresSignal = createSignal<FeatureStatus[]>([])
  private performanceSignal = createSignal<PerformanceMetrics>({
    cpu: 0,
    memory: 0,
    responseTime: 0,
    tokensUsed: 0,
    cost: 0,
    requestsPerMinute: 0
  })
  private errorsSignal = createSignal<ErrorEntry[]>([])
  private healthScoreSignal = createSignal<HealthScore>({
    overall: 100,
    providers: 100,
    features: 100,
    performance: 100
  })

  constructor(props?: EnhancedStatusMonitorProps) {
    if (props?.onStatusUpdate) {
      this.statusUpdateCallbacks.push(props.onStatusUpdate)
    }
    if (props?.onError) {
      this.errorCallbacks.push(props.onError)
    }

    this.initializeProviders()
    this.initializeFeatures()
    this.startMonitoring()
  }

  // Getters for reactive access
  get providers() { return this.providersSignal[0] }
  get features() { return this.featuresSignal[0] }
  get performance() { return this.performanceSignal[0] }
  get errors() { return this.errorsSignal[0] }
  get healthScore() { return this.healthScoreSignal[0] }

  // Initialize all 7 providers from corpus analysis
  private initializeProviders() {
    const providers: ProviderStatus[] = [
      {
        name: "OpenAI",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          apiKey: false,
          organization: false,
          baseUrl: false
        }
      },
      {
        name: "Anthropic",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          apiKey: false
        }
      },
      {
        name: "Google AI",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          apiKey: false
        }
      },
      {
        name: "Azure OpenAI",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          apiKey: false,
          endpoint: false,
          apiVersion: false
        }
      },
      {
        name: "Local/ollama",
        type: "local",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "limited-function-calling"],
        config: {
          baseUrl: false,
          models: false
        }
      },
      {
        name: "OpenRouter",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          apiKey: false
        }
      },
      {
        name: "AWS Bedrock",
        type: "cloud",
        status: "unknown",
        lastCheck: new Date(),
        responseTime: 0,
        errorCount: 0,
        features: ["chat", "streaming", "function-calling"],
        config: {
          accessKeyId: false,
          secretAccessKey: false,
          region: false
        }
      }
    ]

    this.providersSignal[1](providers)
  }

  // Initialize all 12 feature categories from corpus analysis
  private initializeFeatures() {
    const features: FeatureStatus[] = [
      {
        name: "agent_reasoning",
        displayName: "Agent Reasoning",
        enabled: true,
        working: false,
        fileCount: 45,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["provider_routing", "session_management"]
      },
      {
        name: "session_management",
        displayName: "Session Management",
        enabled: true,
        working: false,
        fileCount: 67,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["config_management"]
      },
      {
        name: "tool_execution",
        displayName: "Tool Execution",
        enabled: true,
        working: false,
        fileCount: 89,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["agent_reasoning", "provider_routing"]
      },
      {
        name: "provider_routing",
        displayName: "Provider Routing",
        enabled: true,
        working: false,
        fileCount: 34,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["config_management"]
      },
      {
        name: "server_http",
        displayName: "HTTP Server",
        enabled: true,
        working: false,
        fileCount: 56,
        riskLevel: "medium",
        lastTest: new Date(),
        dependencies: []
      },
      {
        name: "ui_frontend",
        displayName: "UI Frontend",
        enabled: true,
        working: true,
        fileCount: 234,
        riskLevel: "medium",
        lastTest: new Date(),
        dependencies: []
      },
      {
        name: "extension_integration",
        displayName: "Extension Integration",
        enabled: true,
        working: false,
        fileCount: 78,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["server_http"]
      },
      {
        name: "auth_security",
        displayName: "Auth & Security",
        enabled: true,
        working: false,
        fileCount: 45,
        riskLevel: "high",
        lastTest: new Date(),
        dependencies: ["config_management"]
      },
      {
        name: "config_management",
        displayName: "Config Management",
        enabled: true,
        working: false,
        fileCount: 23,
        riskLevel: "medium",
        lastTest: new Date(),
        dependencies: []
      },
      {
        name: "telemetry_logging",
        displayName: "Telemetry & Logging",
        enabled: true,
        working: false,
        fileCount: 19,
        riskLevel: "low",
        lastTest: new Date(),
        dependencies: []
      },
      {
        name: "i18n_support",
        displayName: "Internationalization",
        enabled: true,
        working: false,
        fileCount: 34,
        riskLevel: "low",
        lastTest: new Date(),
        dependencies: []
      },
      {
        name: "desktop_apps",
        displayName: "Desktop Apps",
        enabled: false,
        working: false,
        fileCount: 89,
        riskLevel: "medium",
        lastTest: new Date(),
        dependencies: ["ui_frontend"]
      }
    ]

    this.featuresSignal[1](features)
  }

  // Start comprehensive monitoring
  private startMonitoring() {
    // Check providers every 30 seconds
    this.refreshInterval = window.setInterval(() => {
      this.checkAllProviders()
      this.checkAllFeatures()
      this.updatePerformanceMetrics()
      this.calculateHealthScore()
    }, 30000)

    // Health check every 10 seconds
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck()
    }, 10000)

    // Initial checks
    this.checkAllProviders()
    this.checkAllFeatures()
    this.updatePerformanceMetrics()
    this.calculateHealthScore()
  }

  // Check all providers
  async checkAllProviders() {
    const providers = this.providers()
    const updatedProviders = await Promise.all(
      providers.map(async (provider) => await this.checkProvider(provider))
    )
    this.providersSignal[1](updatedProviders)
    this.notifyStatusUpdate()
  }

  // Check individual provider
  private async checkProvider(provider: ProviderStatus): Promise<ProviderStatus> {
    const startTime = Date.now()
    
    try {
      // Simulate provider health check
      // In real implementation, this would make actual API calls
      const isHealthy = await this.testProviderConnection(provider.name)
      const responseTime = Date.now() - startTime

      return {
        ...provider,
        status: isHealthy ? "connected" : "error",
        lastCheck: new Date(),
        responseTime,
        errorCount: isHealthy ? 0 : provider.errorCount + 1
      }
    } catch (error) {
      this.addError({
        id: `provider-${provider.name}-${Date.now()}`,
        type: "provider",
        severity: "error",
        message: `Provider ${provider.name} check failed`,
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        resolved: false
      })

      return {
        ...provider,
        status: "error",
        lastCheck: new Date(),
        responseTime: Date.now() - startTime,
        errorCount: provider.errorCount + 1
      }
    }
  }

  // Test provider connection
  private async testProviderConnection(providerName: string): Promise<boolean> {
    // Simulate connection test
    // In real implementation, this would test actual provider connectivity
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 70% success rate for demo
        resolve(Math.random() > 0.3)
      }, 100 + Math.random() * 200)
    })
  }

  // Check all features
  async checkAllFeatures() {
    const features = this.features()
    const updatedFeatures = await Promise.all(
      features.map(async (feature) => await this.checkFeature(feature))
    )
    this.featuresSignal[1](updatedFeatures)
    this.notifyStatusUpdate()
  }

  // Check individual feature
  private async checkFeature(feature: FeatureStatus): Promise<FeatureStatus> {
    try {
      // Simulate feature health check
      // In real implementation, this would test feature functionality
      const isWorking = await this.testFeatureFunctionality(feature.name)

      return {
        ...feature,
        working: isWorking,
        lastTest: new Date()
      }
    } catch (error) {
      this.addError({
        id: `feature-${feature.name}-${Date.now()}`,
        type: "feature",
        severity: "warning",
        message: `Feature ${feature.displayName} check failed`,
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        resolved: false
      })

      return {
        ...feature,
        working: false,
        lastTest: new Date()
      }
    }
  }

  // Test feature functionality
  private async testFeatureFunctionality(featureName: string): Promise<boolean> {
    // Simulate feature test
    // In real implementation, this would test actual feature functionality
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 80% success rate for demo
        resolve(Math.random() > 0.2)
      }, 50 + Math.random() * 100)
    })
  }

  // Update performance metrics
  private updatePerformanceMetrics() {
    const current = this.performance()
    
    // Simulate performance metrics
    // In real implementation, this would collect actual metrics
    const updated: PerformanceMetrics = {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      responseTime: 100 + Math.random() * 500,
      tokensUsed: current.tokensUsed + Math.floor(Math.random() * 1000),
      cost: current.cost + (Math.random() * 0.01),
      requestsPerMinute: 10 + Math.floor(Math.random() * 50)
    }

    this.performanceSignal[1](updated)
    this.notifyStatusUpdate()
  }

  // Calculate health score
  private calculateHealthScore() {
    const providers = this.providers()
    const features = this.features()
    const performance = this.performance()

    const providerHealth = providers.filter(p => p.status === "connected").length / providers.length * 100
    const featureHealth = features.filter(f => f.working).length / features.length * 100
    const performanceHealth = Math.max(0, 100 - (performance.cpu + performance.memory) / 2)

    const overall = (providerHealth + featureHealth + performanceHealth) / 3

    const healthScore: HealthScore = {
      overall: Math.round(overall),
      providers: Math.round(providerHealth),
      features: Math.round(featureHealth),
      performance: Math.round(performanceHealth)
    }

    this.healthScoreSignal[1](healthScore)
    this.notifyStatusUpdate()
  }

  // Perform comprehensive health check
  private async performHealthCheck() {
    const healthScore = this.healthScore()
    
    if (healthScore.overall < 70) {
      this.addError({
        id: `health-${Date.now()}`,
        type: "system",
        severity: "warning",
        message: "System health degraded",
        details: `Overall health score: ${healthScore.overall}%`,
        timestamp: new Date(),
        resolved: false
      })
    }

    // Check for critical errors
    const providers = this.providers()
    const criticalProviders = providers.filter(p => p.status === "error" && p.errorCount > 3)
    
    if (criticalProviders.length > 0) {
      this.addError({
        id: `critical-${Date.now()}`,
        type: "system",
        severity: "critical",
        message: "Critical provider failures detected",
        details: criticalProviders.map(p => p.name).join(", "),
        timestamp: new Date(),
        resolved: false
      })
    }
  }

  // Add error to tracking
  private addError(error: ErrorEntry) {
    const errors = this.errors()
    const updatedErrors = [error, ...errors].slice(0, 100) // Keep last 100 errors
    this.errorsSignal[1](updatedErrors)
    
    this.errorCallbacks.forEach(callback => callback(error))
    this.notifyStatusUpdate()
  }

  // Clear errors
  clearErrors() {
    this.errorsSignal[1]([])
    this.notifyStatusUpdate()
  }

  // Resolve error
  resolveError(errorId: string) {
    const errors = this.errors()
    const updatedErrors = errors.map(error => 
      error.id === errorId ? { ...error, resolved: true } : error
    )
    this.errorsSignal[1](updatedErrors)
    this.notifyStatusUpdate()
  }

  // Toggle feature
  toggleFeature(featureName: string, enabled: boolean) {
    const features = this.features()
    const updatedFeatures = features.map(feature =>
      feature.name === featureName ? { ...feature, enabled } : feature
    )
    this.featuresSignal[1](updatedFeatures)
    this.notifyStatusUpdate()
  }

  // Get complete system status
  getSystemStatus(): SystemStatus {
    return {
      providers: this.providers(),
      features: this.features(),
      performance: this.performance(),
      errors: this.errors(),
      healthScore: this.healthScore(),
      lastUpdate: new Date()
    }
  }

  // Notify status update
  private notifyStatusUpdate() {
    const status = this.getSystemStatus()
    this.statusUpdateCallbacks.forEach(callback => callback(status))
  }

  // Add status update callback
  onStatusUpdate(callback: (status: SystemStatus) => void) {
    this.statusUpdateCallbacks.push(callback)
  }

  // Add error callback
  onError(callback: (error: ErrorEntry) => void) {
    this.errorCallbacks.push(callback)
  }

  // Force refresh all status
  async forceRefresh() {
    await this.checkAllProviders()
    await this.checkAllFeatures()
    this.updatePerformanceMetrics()
    this.calculateHealthScore()
  }

  // Cleanup
  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    this.statusUpdateCallbacks = []
    this.errorCallbacks = []
  }
}

// Create singleton instance
let enhancedStatusMonitorInstance: EnhancedStatusMonitor | null = null

export function getEnhancedStatusMonitor(props?: EnhancedStatusMonitorProps): EnhancedStatusMonitor {
  if (!enhancedStatusMonitorInstance) {
    enhancedStatusMonitorInstance = new EnhancedStatusMonitor(props)
  }
  return enhancedStatusMonitorInstance
}
