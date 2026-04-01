import { createSignal, createEffect } from "solid-js"
import { useVSCode } from "../context/vscode"

export interface SystemStatus {
  connection: 'connected' | 'disconnected' | 'connecting' | 'error'
  providers: {
    [key: string]: {
      status: 'online' | 'offline' | 'error'
      lastCheck: Date
      error?: string
    }
  }
  features: {
    [key: string]: {
      enabled: boolean
      working: boolean
      lastUsed?: Date
      error?: string
    }
  }
  performance: {
    cpu: number
    memory: number
    responseTime: number
  }
  errors: Array<{
    timestamp: Date
    type: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
}

const DEFAULT_STATUS: SystemStatus = {
  connection: 'disconnected',
  providers: {},
  features: {
    speech: { enabled: false, working: false },
    openhands: { enabled: false, working: false },
    autocomplete: { enabled: false, working: false },
    browser_automation: { enabled: false, working: false },
    agent_manager: { enabled: true, working: true },
    commit_generation: { enabled: false, working: false },
    code_actions: { enabled: false, working: false },
    telemetry: { enabled: false, working: false }
  },
  performance: {
    cpu: 0,
    memory: 0,
    responseTime: 0
  },
  errors: []
}

export class StatusMonitor {
  private vscode = useVSCode()
  private statusSignal = createSignal<SystemStatus>(DEFAULT_STATUS)
  private monitoringSignal = createSignal(false)
  private monitoringInterval?: NodeJS.Timeout

  constructor() {
    this.startMonitoring()
    this.setupMessageHandlers()
  }

  // Getters for reactive access
  get status() {
    return this.statusSignal()
  }

  get isMonitoring() {
    return this.monitoringSignal()
  }

  // Setters for reactive updates
  set status(v: SystemStatus | ((prev: SystemStatus) => SystemStatus)) {
    this.statusSignal(v)
  }

  set isMonitoring(v: boolean | ((prev: boolean) => boolean)) {
    this.monitoringSignal(v)
  }

  // Start monitoring system status
  startMonitoring() {
    if (this.isMonitoring()) return

    this.isMonitoring = true
    
    // Request initial status
    this.requestStatusUpdate()
    
    // Set up periodic status checks
    this.monitoringInterval = setInterval(() => {
      this.requestStatusUpdate()
    }, 5000) // Check every 5 seconds
  }

  // Stop monitoring
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
  }

  // Request status update from backend
  private requestStatusUpdate() {
    this.vscode.postMessage({
      type: "status",
      action: "getSystemStatus"
    })
  }

  // Setup message handlers for status updates
  private setupMessageHandlers() {
    this.vscode.onMessage((message) => {
      switch (message.type) {
        case "statusUpdate":
          this.handleStatusUpdate(message.data)
          break
        case "providerStatus":
          this.handleProviderStatus(message.data)
          break
        case "featureStatus":
          this.handleFeatureStatus(message.data)
          break
        case "performanceMetrics":
          this.handlePerformanceMetrics(message.data)
          break
        case "error":
          this.handleError(message.data)
          break
      }
    })
  }

  // Handle full status update
  private handleStatusUpdate(data: Partial<SystemStatus>) {
    this.status = prev => ({ ...prev, ...data })
  }

  // Handle provider status update
  private handleProviderStatus(data: { provider: string; status: SystemStatus['providers'][string] }) {
    this.status = prev => ({
      ...prev,
      providers: {
        ...prev.providers,
        [data.provider]: data.status
      }
    })
  }

  // Handle feature status update
  private handleFeatureStatus(data: { feature: string; status: SystemStatus['features'][string] }) {
    this.status = prev => ({
      ...prev,
      features: {
        ...prev.features,
        [data.feature]: data.status
      }
    })
  }

  // Handle performance metrics update
  private handlePerformanceMetrics(data: Partial<SystemStatus['performance']>) {
    this.status = prev => ({
      ...prev,
      performance: {
        ...prev.performance,
        ...data
      }
    })
  }

  // Handle error reporting
  private handleError(data: SystemStatus['errors'][0]) {
    this.status = prev => ({
      ...prev,
      errors: [data, ...prev.errors.slice(0, 99)] // Keep last 100 errors
    })
  }

  // Manual feature status check
  checkFeatureStatus(feature: string) {
    this.vscode.postMessage({
      type: "status",
      action: "checkFeature",
      feature
    })
  }

  // Manual provider status check
  checkProviderStatus(provider: string) {
    this.vscode.postMessage({
      type: "status",
      action: "checkProvider",
      provider
    })
  }

  // Enable/disable feature
  toggleFeature(feature: string, enabled: boolean) {
    this.vscode.postMessage({
      type: "settings",
      action: "toggleFeature",
      feature,
      enabled
    })
  }

  // Clear errors
  clearErrors() {
    this.status = prev => ({ ...prev, errors: [] })
  }

  // Get specific provider status
  getProviderStatus(provider: string) {
    return () => this.status().providers[provider]
  }

  // Get specific feature status
  getFeatureStatus(feature: string) {
    return () => this.status().features[feature]
  }

  // Get connection status
  getConnectionStatus() {
    return () => this.status().connection
  }

  // Get performance metrics
  getPerformanceMetrics() {
    return () => this.status().performance
  }

  // Get recent errors
  getRecentErrors(count: number = 10) {
    return () => this.status().errors.slice(0, count)
  }

  // Check if system is healthy
  isSystemHealthy() {
    return () => {
      const status = this.status()
      return (
        status.connection === 'connected' &&
        Object.values(status.providers).every(p => p.status !== 'error') &&
        Object.values(status.features).filter(f => f.enabled).every(f => f.working)
      )
    }
  }

  // Get system health score (0-100)
  getHealthScore() {
    return () => {
      const status = this.status()
      let score = 0
      
      // Connection weight: 30%
      if (status.connection === 'connected') score += 30
      else if (status.connection === 'connecting') score += 15
      
      // Provider status weight: 40%
      const providerCount = Object.keys(status.providers).length
      if (providerCount > 0) {
        const healthyProviders = Object.values(status.providers).filter(p => p.status === 'online').length
        score += (healthyProviders / providerCount) * 40
      }
      
      // Feature status weight: 30%
      const enabledFeatures = Object.values(status.features).filter(f => f.enabled)
      if (enabledFeatures.length > 0) {
        const workingFeatures = enabledFeatures.filter(f => f.working).length
        score += (workingFeatures / enabledFeatures.length) * 30
      }
      
      return Math.round(score)
    }
  }
}

// Singleton instance
let statusMonitorInstance: StatusMonitor | null = null

export function useStatusMonitor(): StatusMonitor {
  if (!statusMonitorInstance) {
    statusMonitorInstance = new StatusMonitor()
  }
  return statusMonitorInstance
}
