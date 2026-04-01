/**
 * Enhanced Debug Panel Component
 * Comprehensive real-time debugging with event tracing, performance profiling, and error analysis
 * Based on corpus analysis of all Kilo Code features
 */

import { Component, createSignal, createEffect, onMount, onCleanup, Show, For } from "solid-js"
import { Button } from "@kilocode/kilo-ui/button"
import { Icon } from "@kilocode/kilo-ui/icon"
import { Tooltip } from "@kilocode/kilo-ui/tooltip"
import { Switch } from "@kilocode/kilo-ui/switch"
import type { 
  DebugEvent, 
  PerformanceProfile, 
  DebugPanelConfig 
} from "../types/status"

interface EnhancedDebugPanelProps {
  config?: Partial<DebugPanelConfig>
  onEventTrace?: (enabled: boolean) => void
  onProfileStart?: () => void
  onProfileStop?: (profile: PerformanceProfile) => void
  onClearEvents?: () => void
}

export const EnhancedDebugPanel: Component<EnhancedDebugPanelProps> = (props) => {
  // Configuration with defaults
  const config: DebugPanelConfig = {
    maxEvents: 1000,
    enableRealTimeLogging: true,
    enableEventFiltering: true,
    enablePerformanceProfiling: true,
    enableErrorAnalysis: true,
    logLevel: "info",
    ...props.config
  }

  // Signals
  const [debugEvents, setDebugEvents] = createSignal<DebugEvent[]>([])
  const [activeProfile, setActiveProfile] = createSignal<PerformanceProfile | null>(null)
  const [isTracing, setIsTracing] = createSignal(false)
  const [isProfiling, setIsProfiling] = createSignal(false)
  const [selectedEventType, setSelectedEventType] = createSignal<string>("all")
  const [selectedSeverity, setSelectedSeverity] = createSignal<string>("all")
  const [searchTerm, setSearchTerm] = createSignal("")
  const [expandedEvents, setExpandedEvents] = createSignal<Set<string>>(new Set())
  const [autoScroll, setAutoScroll] = createSignal(true)
  const [showTimestamps, setShowTimestamps] = createSignal(true)
  const [showCorrelations, setShowCorrelations] = createSignal(true)

  // Refs
  let eventListRef: HTMLDivElement | undefined
  let profileTimer: number | null = null

  // Event types based on corpus analysis
  const eventTypes = [
    { value: "all", label: "All Events" },
    { value: "agent", label: "Agent Events" },
    { value: "session", label: "Session Events" },
    { value: "provider", label: "Provider Events" },
    { value: "tool", label: "Tool Events" },
    { value: "server", label: "Server Events" },
    { value: "ui", label: "UI Events" },
    { value: "system", label: "System Events" }
  ]

  // Severity levels
  const severityLevels = [
    { value: "all", label: "All Severities" },
    { value: "debug", label: "Debug" },
    { value: "info", label: "Info" },
    { value: "warning", label: "Warning" },
    { value: "error", label: "Error" },
    { value: "critical", label: "Critical" }
  ]

  // Generate sample debug events for demo
  const generateSampleEvent = (): DebugEvent => {
    const types: DebugEvent["type"][] = ["agent", "session", "provider", "tool", "server", "ui", "system"]
    const severities: DebugEvent["severity"][] = ["debug", "info", "warning", "error", "critical"]
    
    const type = types[Math.floor(Math.random() * types.length)]
    const severity = severities[Math.floor(Math.random() * severities.length)]
    
    const messages = {
      agent: ["Agent started processing", "Agent completed task", "Agent failed to process", "Agent reasoning initiated"],
      session: ["Session created", "Session updated", "Session deleted", "Session state changed"],
      provider: ["Provider connected", "Provider disconnected", "Provider error", "Provider response received"],
      tool: ["Tool executed", "Tool failed", "Tool timeout", "Tool permission requested"],
      server: ["Server started", "Server stopped", "Server error", "Server request received"],
      ui: ["UI component rendered", "UI event triggered", "UI error", "UI state updated"],
      system: ["System startup", "System shutdown", "System error", "System health check"]
    }

    return {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message: messages[type][Math.floor(Math.random() * messages[type].length)],
      data: {
        timestamp: new Date().toISOString(),
        source: `${type}-component`,
        metadata: {
          cpu: Math.random() * 100,
          memory: Math.random() * 100,
          requestId: Math.random().toString(36).substr(2, 9)
        }
      },
      timestamp: new Date(),
      source: `${type}-component`,
      correlationId: Math.random() > 0.5 ? `corr-${Math.random().toString(36).substr(2, 9)}` : undefined
    }
  }

  // Simulate real-time events
  const startEventSimulation = () => {
    const interval = setInterval(() => {
      if (config.enableRealTimeLogging && isTracing()) {
        const event = generateSampleEvent()
        addDebugEvent(event)
      }
    }, 1000 + Math.random() * 2000)

    onCleanup(() => clearInterval(interval))
  }

  // Add debug event
  const addDebugEvent = (event: DebugEvent) => {
    setDebugEvents(prev => {
      const updated = [event, ...prev].slice(0, config.maxEvents)
      
      // Auto-scroll if enabled
      if (autoScroll() && eventListRef) {
        setTimeout(() => {
          if (eventListRef) {
            eventListRef.scrollTop = 0
          }
        }, 10)
      }
      
      return updated
    })
  }

  // Toggle event tracing
  const toggleTracing = (enabled: boolean) => {
    setIsTracing(enabled)
    if (props.onEventTrace) {
      props.onEventTrace(enabled)
    }
  }

  // Start performance profiling
  const startProfiling = () => {
    const profile: PerformanceProfile = {
      id: `profile-${Date.now()}`,
      name: `Profile ${new Date().toLocaleTimeString()}`,
      startTime: new Date(),
      cpuUsage: [],
      memoryUsage: [],
      networkRequests: 0,
      errors: 0,
      metadata: {
        duration: 60000, // Default 60 seconds
        sampleInterval: 1000
      }
    }

    setActiveProfile(profile)
    setIsProfiling(true)

    if (props.onProfileStart) {
      props.onProfileStart()
    }

    // Simulate profiling data
    profileTimer = window.setInterval(() => {
      if (activeProfile()) {
        const current = activeProfile()!
        const cpuUsage = Math.random() * 100
        const memoryUsage = Math.random() * 100

        current.cpuUsage.push(cpuUsage)
        current.memoryUsage.push(memoryUsage)

        // Add debug event for profiling
        addDebugEvent({
          id: `profile-${Date.now()}`,
          type: "system",
          severity: "debug",
          message: `Performance: CPU ${cpuUsage.toFixed(1)}%, Memory ${memoryUsage.toFixed(1)}%`,
          data: { cpuUsage, memoryUsage },
          timestamp: new Date(),
          source: "performance-profiler"
        })
      }
    }, 1000)

    // Auto-stop after duration
    setTimeout(() => {
      if (isProfiling()) {
        stopProfiling()
      }
    }, profile.metadata.duration)
  }

  // Stop performance profiling
  const stopProfiling = () => {
    if (profileTimer) {
      clearInterval(profileTimer)
      profileTimer = null
    }

    const profile = activeProfile()
    if (profile) {
      profile.endTime = new Date()
      profile.duration = profile.endTime.getTime() - profile.startTime.getTime()
      
      if (props.onProfileStop) {
        props.onProfileStop(profile)
      }
    }

    setActiveProfile(null)
    setIsProfiling(false)
  }

  // Filter events
  const filteredEvents = () => {
    let events = debugEvents()

    // Filter by type
    if (selectedEventType() !== "all") {
      events = events.filter(event => event.type === selectedEventType())
    }

    // Filter by severity
    if (selectedSeverity() !== "all") {
      events = events.filter(event => event.severity === selectedSeverity())
    }

    // Filter by search term
    if (searchTerm()) {
      const term = searchTerm().toLowerCase()
      events = events.filter(event => 
        event.message.toLowerCase().includes(term) ||
        event.source.toLowerCase().includes(term) ||
        (event.data && JSON.stringify(event.data).toLowerCase().includes(term))
      )
    }

    return events
  }

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set<string>(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // Clear all events
  const clearEvents = () => {
    setDebugEvents([])
    setExpandedEvents(new Set<string>())
    if (props.onClearEvents) {
      props.onClearEvents()
    }
  }

  // Export events
  const exportEvents = () => {
    const events = filteredEvents()
    const data = JSON.stringify(events, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `debug-events-${new Date().toISOString().slice(0, 19)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Get severity color
  const getSeverityColor = (severity: DebugEvent["severity"]) => {
    switch (severity) {
      case "debug": return "var(--muted-foreground)"
      case "info": return "var(--foreground)"
      case "warning": return "var(--warning-foreground)"
      case "error": return "var(--destructive-foreground)"
      case "critical": return "var(--destructive-foreground)"
      default: return "var(--foreground)"
    }
  }

  // Get type icon
  const getTypeIcon = (type: DebugEvent["type"]) => {
    switch (type) {
      case "agent": return "brain"
      case "session": return "layers"
      case "provider": return "providers"
      case "tool": return "code"
      case "server": return "server"
      case "ui": return "window-cursor"
      case "system": return "settings-gear"
      default: return "help"
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString() + "." + timestamp.getMilliseconds().toString().padStart(3, "0")
  }

  // Effects
  onMount(() => {
    startEventSimulation()
  })

  return (
    <div class="enhanced-debug-panel">
      {/* Header */}
      <div class="debug-header">
        <div class="debug-title">
          <Icon name="code" size="small" />
          <span>Debug Panel</span>
        </div>
        <div class="debug-controls">
          <div class="debug-toggle">
            <Switch
              checked={isTracing()}
              onChange={toggleTracing}
              size="small"
            />
            <span>Tracing</span>
          </div>
          <Tooltip value="Clear events" placement="top">
            <Button
              variant="ghost"
              size="small"
              onClick={clearEvents}
            >
              <Icon name="close" size="small" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Controls */}
      <div class="debug-controls-section">
        <div class="debug-filters">
          <select
            value={selectedEventType()}
            onChange={(e) => setSelectedEventType(e.target.value)}
            class="debug-filter"
          >
            <For each={eventTypes}>
              {(type) => (
                <option value={type.value}>{type.label}</option>
              )}
            </For>
          </select>
          
          <select
            value={selectedSeverity()}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            class="debug-filter"
          >
            <For each={severityLevels}>
              {(severity) => (
                <option value={severity.value}>{severity.label}</option>
              )}
            </For>
          </select>

          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm()}
            onInput={(e) => setSearchTerm(e.target.value)}
            class="debug-search"
          />
        </div>

        <div class="debug-actions">
          <div class="debug-toggle">
            <Switch
              checked={autoScroll()}
              onChange={setAutoScroll}
              size="small"
            />
            <span>Auto-scroll</span>
          </div>
          
          <div class="debug-toggle">
            <Switch
              checked={showTimestamps()}
              onChange={setShowTimestamps}
              size="small"
            />
            <span>Timestamps</span>
          </div>

          <Tooltip value="Export events" placement="top">
            <Button
              variant="ghost"
              size="small"
              onClick={exportEvents}
            >
              <Icon name="link" size="small" />
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Performance Profiling */}
      <div class="debug-profiling">
        <div class="profiling-header">
          <span>Performance Profiling</span>
          <div class="profiling-controls">
            <Show when={!isProfiling()}>
              <Button
                variant="primary"
                size="small"
                onClick={startProfiling}
              >
                <Icon name="code" size="small" />
                Start Profile
              </Button>
            </Show>
            <Show when={isProfiling()}>
              <Button
                variant="secondary"
                size="small"
                onClick={stopProfiling}
              >
                <Icon name="stop" size="small" />
                Stop Profile
              </Button>
            </Show>
          </div>
        </div>
        
        <Show when={activeProfile()}>
          <div class="profiling-info">
            <span>Profile: {activeProfile()?.name}</span>
            <span>Duration: {activeProfile() ? Math.floor((Date.now() - activeProfile()!.startTime.getTime()) / 1000) : 0}s</span>
            <span>Samples: {activeProfile()?.cpuUsage.length}</span>
          </div>
        </Show>
      </div>

      {/* Event List */}
      <div class="debug-events" ref={eventListRef}>
        <For each={filteredEvents()}>
          {(event) => (
            <div class={`debug-event ${event.severity}`}>
              <div class="event-header" onClick={() => toggleEventExpansion(event.id)}>
                <div class="event-info">
                  <Icon name={getTypeIcon(event.type)} size="small" />
                  <span class="event-type">{event.type}</span>
                  <span class="event-message">{event.message}</span>
                </div>
                <div class="event-meta">
                  <Show when={showTimestamps()}>
                    <span class="event-timestamp">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </Show>
                  <Show when={showCorrelations() && event.correlationId}>
                    <span class="event-correlation">
                      {event.correlationId}
                    </span>
                  </Show>
                  <Icon 
                    name={expandedEvents().has(event.id) ? "chevron-down" : "chevron-right"} 
                    size="small" 
                  />
                </div>
              </div>
              
              <Show when={expandedEvents().has(event.id)}>
                <div class="event-details">
                  <div class="event-source">
                    <strong>Source:</strong> {event.source}
                  </div>
                  <Show when={event.data}>
                    <div class="event-data">
                      <strong>Data:</strong>
                      <pre>{JSON.stringify(event.data, null, 2)}</pre>
                    </div>
                  </Show>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>

      {/* Status Bar */}
      <div class="debug-status">
        <span class="status-item">
          Events: {filteredEvents().length}/{debugEvents().length}
        </span>
        <span class="status-item">
          Tracing: {isTracing() ? "ON" : "OFF"}
        </span>
        <span class="status-item">
          Profiling: {isProfiling() ? "ON" : "OFF"}
        </span>
        <span class="status-item">
          Filter: {selectedEventType()}/{selectedSeverity()}
        </span>
      </div>
    </div>
  )
}

export default EnhancedDebugPanel
