/**
 * Real Debug Events API
 * Provides actual event streaming from real system components
 * NOT mocked - connects to actual event sources
 */

import type { 
  DebugEvent, 
  PerformanceProfile,
  DebugPanelConfig 
} from "@kilocode/kilo-ui/types/status"

// Import actual system components
import { getAgentManager } from "../agent"
import { getSessionManager } from "../session"
import { getProviderRegistry } from "../provider"
import { getToolRegistry } from "../tools"
import { getServerInstance } from "../server"
import { getProfiler } from "../profiler"

export class RealDebugTracer {
  private agentManager = getAgentManager()
  private sessionManager = getSessionManager()
  private providerRegistry = getProviderRegistry()
  private toolRegistry = getToolRegistry()
  private serverInstance = getServerInstance()
  private profiler = getProfiler()

  private eventListeners: Set<(event: DebugEvent) => void> = new Set()
  private activeProfiles: Map<string, PerformanceProfile> = new Map()
  private isTracing = false
  private maxEvents = 1000
  private eventBuffer: DebugEvent[] = []

  constructor() {
    this.setupRealEventSources()
  }

  // Setup real event sources from actual system components
  private setupRealEventSources() {
    // Agent events
    this.agentManager.onEvent((event) => {
      this.emitDebugEvent({
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "agent",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "agent-manager",
        correlationId: event.correlationId
      })
    })

    // Session events
    this.sessionManager.onEvent((event) => {
      this.emitDebugEvent({
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "session",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "session-manager",
        correlationId: event.correlationId
      })
    })

    // Provider events
    this.providerRegistry.onEvent((event) => {
      this.emitDebugEvent({
        id: `provider-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "provider",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "provider-registry",
        correlationId: event.correlationId
      })
    })

    // Tool events
    this.toolRegistry.onEvent((event) => {
      this.emitDebugEvent({
        id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "tool",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "tool-registry",
        correlationId: event.correlationId
      })
    })

    // Server events
    this.serverInstance.onEvent((event) => {
      this.emitDebugEvent({
        id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "server",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "http-server",
        correlationId: event.correlationId
      })
    })

    // System events
    this.serverInstance.onSystemEvent((event) => {
      this.emitDebugEvent({
        id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "system",
        severity: this.mapEventSeverity(event.level),
        message: event.message,
        data: event.data,
        timestamp: new Date(),
        source: event.source || "system-monitor",
        correlationId: event.correlationId
      })
    })
  }

  // Map event severity from system events to debug events
  private mapEventSeverity(level: string): DebugEvent["severity"] {
    switch (level.toLowerCase()) {
      case "debug":
        return "debug"
      case "info":
      case "information":
        return "info"
      case "warn":
      case "warning":
        return "warning"
      case "error":
        return "error"
      case "fatal":
      case "critical":
        return "critical"
      default:
        return "info"
    }
  }

  // Emit debug event to all listeners
  private emitDebugEvent(event: DebugEvent) {
    if (!this.isTracing) return

    // Add to buffer
    this.eventBuffer.unshift(event)
    if (this.eventBuffer.length > this.maxEvents) {
      this.eventBuffer = this.eventBuffer.slice(0, this.maxEvents)
    }

    // Notify listeners
    this.eventListeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error("Debug event listener error:", error)
      }
    })
  }

  // Get event stream (async iterator)
  async *getEventStream(config?: DebugPanelConfig): AsyncGenerator<DebugEvent> {
    const filter = config?.logLevel || "info"
    const maxEvents = config?.maxEvents || 1000

    // Emit buffered events first
    const bufferedEvents = this.eventBuffer
      .filter(event => this.shouldIncludeEvent(event, filter))
      .slice(0, maxEvents)

    for (const event of bufferedEvents) {
      yield event
    }

    // Then yield new events as they come
    const eventPromise = new Promise<DebugEvent>((resolve) => {
      const listener = (event: DebugEvent) => {
        if (this.shouldIncludeEvent(event, filter)) {
          this.eventListeners.delete(listener)
          resolve(event)
        }
      }
      this.eventListeners.add(listener)
    })

    try {
      while (true) {
        const event = await eventPromise
        yield event
      }
    } finally {
      // Cleanup
      this.eventListeners.delete(eventPromise)
    }
  }

  // Check if event should be included based on filter
  private shouldIncludeEvent(event: DebugEvent, minLevel: string): boolean {
    const levels = ["debug", "info", "warning", "error", "critical"]
    const eventLevelIndex = levels.indexOf(event.severity)
    const minLevelIndex = levels.indexOf(minLevel)
    return eventLevelIndex >= minLevelIndex
  }

  // Start performance profiling
  async startProfiling(duration: number = 60000): Promise<PerformanceProfile> {
    const profileId = `profile-${Date.now()}`
    
    const profile: PerformanceProfile = {
      id: profileId,
      name: `Profile ${new Date().toLocaleTimeString()}`,
      startTime: new Date(),
      cpuUsage: [],
      memoryUsage: [],
      networkRequests: 0,
      errors: 0,
      metadata: {
        duration,
        sampleInterval: 1000
      }
    }

    this.activeProfiles.set(profileId, profile)

    // Start real profiling
    const profilingSession = await this.profiler.startProfiling(duration)

    // Collect metrics
    const metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.serverInstance.getSystemMetrics()
        if (this.activeProfiles.has(profileId)) {
          profile.cpuUsage.push(metrics.cpu || 0)
          profile.memoryUsage.push(metrics.memory || 0)
          profile.networkRequests += metrics.networkRequests || 0
          profile.errors += metrics.errors || 0
        }
      } catch (error) {
        console.error("Error collecting profiling metrics:", error)
      }
    }, 1000)

    // End profiling after duration
    setTimeout(() => {
      clearInterval(metricsInterval)
      if (this.activeProfiles.has(profileId)) {
        profile.endTime = new Date()
        profile.duration = profile.endTime.getTime() - profile.startTime.getTime()
        this.activeProfiles.delete(profileId)
      }
    }, duration)

    return profile
  }

  // Stop performance profiling
  async stopProfiling(profileId: string): Promise<PerformanceProfile | null> {
    const profile = this.activeProfiles.get(profileId)
    if (!profile) {
      return null
    }

    profile.endTime = new Date()
    profile.duration = profile.endTime.getTime() - profile.startTime.getTime()
    
    await this.profiler.stopProfiling(profileId)
    this.activeProfiles.delete(profileId)

    return profile
  }

  // Get active profiles
  getActiveProfiles(): PerformanceProfile[] {
    return Array.from(this.activeProfiles.values())
  }

  // Enable/disable event tracing
  setTracing(enabled: boolean) {
    this.isTracing = enabled
    
    if (enabled) {
      // Notify system components to start sending events
      this.agentManager.enableEventTracing()
      this.sessionManager.enableEventTracing()
      this.providerRegistry.enableEventTracing()
      this.toolRegistry.enableEventTracing()
      this.serverInstance.enableEventTracing()
    } else {
      // Notify system components to stop sending events
      this.agentManager.disableEventTracing()
      this.sessionManager.disableEventTracing()
      this.providerRegistry.disableEventTracing()
      this.toolRegistry.disableEventTracing()
      this.serverInstance.disableEventTracing()
    }
  }

  // Get tracing status
  isTracingEnabled(): boolean {
    return this.isTracing
  }

  // Get recent events
  getRecentEvents(limit: number = 100, severity?: DebugEvent["severity"]): DebugEvent[] {
    let events = this.eventBuffer
    
    if (severity) {
      events = events.filter(event => event.severity === severity)
    }
    
    return events.slice(0, limit)
  }

  // Get events by type
  getEventsByType(type: DebugEvent["type"], limit: number = 100): DebugEvent[] {
    return this.eventBuffer
      .filter(event => event.type === type)
      .slice(0, limit)
  }

  // Get events by correlation ID
  getEventsByCorrelation(correlationId: string): DebugEvent[] {
    return this.eventBuffer.filter(event => event.correlationId === correlationId)
  }

  // Search events
  searchEvents(query: string, limit: number = 100): DebugEvent[] {
    const lowerQuery = query.toLowerCase()
    return this.eventBuffer
      .filter(event => 
        event.message.toLowerCase().includes(lowerQuery) ||
        event.source.toLowerCase().includes(lowerQuery) ||
        (event.data && JSON.stringify(event.data).toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit)
  }

  // Export events
  exportEvents(format: "json" | "csv" = "json"): string {
    const events = this.eventBuffer
    
    if (format === "json") {
      return JSON.stringify(events, null, 2)
    } else if (format === "csv") {
      const headers = ["id", "type", "severity", "message", "source", "timestamp", "correlationId"]
      const rows = events.map(event => [
        event.id,
        event.type,
        event.severity,
        event.message,
        event.source,
        event.timestamp.toISOString(),
        event.correlationId || ""
      ])
      
      return [headers.join(","), ...rows.map(row => row.join(","))].join("\n")
    }
    
    throw new Error(`Unsupported export format: ${format}`)
  }

  // Clear events
  clearEvents() {
    this.eventBuffer = []
  }

  // Get event statistics
  getEventStatistics() {
    const events = this.eventBuffer
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const recentEvents = events.filter(event => event.timestamp > oneHourAgo)

    return {
      total: events.length,
      recent: recentEvents.length,
      byType: {
        agent: events.filter(e => e.type === "agent").length,
        session: events.filter(e => e.type === "session").length,
        provider: events.filter(e => e.type === "provider").length,
        tool: events.filter(e => e.type === "tool").length,
        server: events.filter(e => e.type === "server").length,
        system: events.filter(e => e.type === "system").length,
        ui: events.filter(e => e.type === "ui").length
      },
      bySeverity: {
        debug: events.filter(e => e.severity === "debug").length,
        info: events.filter(e => e.severity === "info").length,
        warning: events.filter(e => e.severity === "warning").length,
        error: events.filter(e => e.severity === "error").length,
        critical: events.filter(e => e.severity === "critical").length
      },
      tracing: this.isTracing,
      activeProfiles: this.activeProfiles.size
    }
  }

  // Add custom event
  addCustomEvent(event: Omit<DebugEvent, "id" | "timestamp">) {
    this.emitDebugEvent({
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    })
  }

  // Subscribe to events
  onEvent(listener: (event: DebugEvent) => void): () => void {
    this.eventListeners.add(listener)
    
    // Return unsubscribe function
    return () => {
      this.eventListeners.delete(listener)
    }
  }

  // Get system health from events
  getSystemHealthFromEvents() {
    const events = this.eventBuffer
    const recentEvents = events.filter(event => 
      event.timestamp > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    )

    const errorCount = recentEvents.filter(e => e.severity === "error" || e.severity === "critical").length
    const warningCount = recentEvents.filter(e => e.severity === "warning").length
    
    let health = "good"
    if (errorCount > 10) {
      health = "critical"
    } else if (errorCount > 5 || warningCount > 20) {
      health = "poor"
    } else if (errorCount > 0 || warningCount > 10) {
      health = "fair"
    }

    return {
      health,
      errorCount,
      warningCount,
      totalEvents: recentEvents.length,
      lastEvent: recentEvents[0]?.timestamp || null
    }
  }

  // Cleanup
  destroy() {
    this.eventListeners.clear()
    this.activeProfiles.clear()
    this.eventBuffer = []
    this.isTracing = false
  }
}

// Create singleton instance
let realDebugTracerInstance: RealDebugTracer | null = null

export function getRealDebugTracer(): RealDebugTracer {
  if (!realDebugTracerInstance) {
    realDebugTracerInstance = new RealDebugTracer()
  }
  return realDebugTracerInstance
}
