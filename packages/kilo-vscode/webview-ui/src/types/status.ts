/**
 * Status System Type Definitions
 * Comprehensive type definitions for enhanced status monitoring
 * Based on corpus analysis of Kilo Code features
 */

// Provider status interface
export interface ProviderStatus {
  name: string
  type: "cloud" | "local" | "hybrid"
  status: "connected" | "disconnected" | "error" | "connecting" | "unknown"
  lastCheck: Date
  responseTime: number // milliseconds
  errorCount: number
  features: string[]
  config: Record<string, boolean>
}

// Feature status interface
export interface FeatureStatus {
  name: string
  displayName: string
  enabled: boolean
  working: boolean
  fileCount: number
  riskLevel: "low" | "medium" | "high" | "critical"
  lastTest: Date
  dependencies: string[]
}

// Performance metrics interface
export interface PerformanceMetrics {
  cpu: number // percentage
  memory: number // percentage
  responseTime: number // average response time in ms
  tokensUsed: number // total tokens used
  cost: number // total cost in USD
  requestsPerMinute: number // current request rate
}

// Error entry interface
export interface ErrorEntry {
  id: string
  type: "provider" | "feature" | "system" | "user" | "network"
  severity: "info" | "warning" | "error" | "critical"
  message: string
  details: string
  timestamp: Date
  resolved: boolean
}

// Health score interface
export interface HealthScore {
  overall: number // 0-100
  providers: number // 0-100
  features: number // 0-100
  performance: number // 0-100
}

// Complete system status interface
export interface SystemStatus {
  providers: ProviderStatus[]
  features: FeatureStatus[]
  performance: PerformanceMetrics
  errors: ErrorEntry[]
  healthScore: HealthScore
  lastUpdate: Date
}

// CLI command interface
export interface CLICommand {
  id: string
  command: string
  description: string
  category: "provider" | "session" | "tool" | "config" | "debug" | "system"
  parameters: CLIParameter[]
  dangerous: boolean
  examples: string[]
}

// CLI parameter interface
export interface CLIParameter {
  name: string
  type: "string" | "number" | "boolean" | "array" | "object"
  required: boolean
  description: string
  defaultValue?: any
}

// CLI execution result interface
export interface CLIExecutionResult {
  command: string
  success: boolean
  output: string
  error?: string
  duration: number // milliseconds
  timestamp: Date
}

// Debug event interface
export interface DebugEvent {
  id: string
  type: "agent" | "session" | "provider" | "tool" | "server" | "ui" | "system"
  severity: "debug" | "info" | "warning" | "error" | "critical"
  message: string
  data?: any
  timestamp: Date
  source: string
  correlationId?: string
}

// Performance profile interface
export interface PerformanceProfile {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  duration?: number
  cpuUsage: number[]
  memoryUsage: number[]
  networkRequests: number
  errors: number
  metadata: Record<string, any>
}

// Refresh operation interface
export interface RefreshOperation {
  id: string
  type: "provider" | "feature" | "session" | "config" | "all"
  status: "pending" | "running" | "completed" | "failed"
  startTime: Date
  endTime?: Date
  result?: any
  error?: string
}

// Reconnection attempt interface
export interface ReconnectionAttempt {
  id: string
  provider: string
  attempt: number
  maxAttempts: number
  status: "pending" | "running" | "completed" | "failed"
  startTime: Date
  endTime?: Date
  result?: "success" | "failed"
  error?: string
  backoffDelay: number // milliseconds
}

// System health check interface
export interface HealthCheck {
  id: string
  timestamp: Date
  overall: HealthScore
  checks: HealthCheckItem[]
  recommendations: string[]
}

// Individual health check item
export interface HealthCheckItem {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: string
  fix?: string
}

// Status monitor configuration interface
export interface StatusMonitorConfig {
  refreshInterval: number // milliseconds
  healthCheckInterval: number // milliseconds
  maxErrors: number
  enableAutoReconnect: boolean
  enablePerformanceProfiling: boolean
  enableEventTracing: boolean
  logLevel: "debug" | "info" | "warning" | "error"
}

// CLI console configuration interface
export interface CLIConsoleConfig {
  maxHistory: number
  enableAutoComplete: boolean
  enableSyntaxHighlighting: boolean
  enableRealTimeOutput: boolean
  commandTimeout: number // milliseconds
  enableCommandHistory: boolean
}

// Debug panel configuration interface
export interface DebugPanelConfig {
  maxEvents: number
  enableRealTimeLogging: boolean
  enableEventFiltering: boolean
  enablePerformanceProfiling: boolean
  enableErrorAnalysis: boolean
  logLevel: "debug" | "info" | "warning" | "error"
}

// Refresh manager configuration interface
export interface RefreshManagerConfig {
  enableSmartRefresh: boolean
  refreshInterval: number // milliseconds
  enableAutoReconnect: boolean
  maxReconnectAttempts: number
  reconnectBackoffMultiplier: number
  enableHealthMonitoring: boolean
  healthCheckInterval: number // milliseconds
}

// Export all types for easy importing
export type {
  ProviderStatus,
  FeatureStatus,
  PerformanceMetrics,
  ErrorEntry,
  HealthScore,
  SystemStatus,
  CLICommand,
  CLIParameter,
  CLIExecutionResult,
  DebugEvent,
  PerformanceProfile,
  RefreshOperation,
  ReconnectionAttempt,
  HealthCheck,
  HealthCheckItem,
  StatusMonitorConfig,
  CLIConsoleConfig,
  DebugPanelConfig,
  RefreshManagerConfig
}
