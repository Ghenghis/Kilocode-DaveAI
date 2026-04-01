import { Component, For, Show, createMemo } from "solid-js"
import { Card } from "@kilocode/kilo-ui/card"
import { Badge } from "@kilocode/kilo-ui/badge"
import { Button } from "@kilocode/kilo-ui/button"
import { useStatusMonitor } from "../services/StatusMonitor"
import type { SystemStatus } from "../services/StatusMonitor"

const StatusPanel: Component = () => {
  const statusMonitor = useStatusMonitor()
  
  // Reactive computed values
  const connectionStatus = createMemo(() => statusMonitor.getConnectionStatus())
  const healthScore = createMemo(() => statusMonitor.getHealthScore())
  const isHealthy = createMemo(() => statusMonitor.isSystemHealthy())
  const performanceMetrics = createMemo(() => statusMonitor.getPerformanceMetrics())
  const recentErrors = createMemo(() => statusMonitor.getRecentErrors(5))
  
  // Get status color based on connection
  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'disconnected': return 'text-gray-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }
  
  // Get health color based on score
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    if (score >= 40) return 'text-orange-500'
    return 'text-red-500'
  }
  
  // Get provider status color
  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'offline': return 'bg-gray-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }
  
  // Get feature status color
  const getFeatureStatusColor = (enabled: boolean, working: boolean) => {
    if (!enabled) return 'bg-gray-500'
    if (working) return 'bg-green-500'
    return 'bg-red-500'
  }

  return (
    <div class="p-4 space-y-4">
      {/* Connection Status */}
      <Card class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class={`w-3 h-3 rounded-full ${getConnectionColor(connectionStatus())} bg-current`} />
            <span class="font-semibold">Connection: {connectionStatus()}</span>
          </div>
          <div class="flex items-center space-x-2">
            <span class={`text-sm font-medium ${getHealthColor(healthScore())}`}>
              Health: {healthScore()}%
            </span>
            <Show when={isHealthy()}>
              <Badge variant="secondary" class="text-green-600">
                Healthy
              </Badge>
            </Show>
            <Show when={!isHealthy()}>
              <Badge variant="destructive" class="text-red-600">
                Issues Detected
              </Badge>
            </Show>
          </div>
        </div>
      </Card>

      {/* Performance Metrics */}
      <Card class="p-4">
        <h3 class="font-semibold mb-3">Performance</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {performanceMetrics().cpu}%
            </div>
            <div class="text-sm text-gray-600">CPU</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {performanceMetrics().memory}MB
            </div>
            <div class="text-sm text-gray-600">Memory</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">
              {performanceMetrics().responseTime}ms
            </div>
            <div class="text-sm text-gray-600">Response</div>
          </div>
        </div>
      </Card>

      {/* Provider Status */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Providers</h3>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.checkProviderStatus('all')}
          >
            Refresh All
          </Button>
        </div>
        <div class="space-y-2">
          <For 
            each={Object.entries(statusMonitor.getProviderStatus()())}
            fallback={
              <div class="text-gray-500 text-sm">No providers configured</div>
            }
          >
            {([provider, status]) => (
              <div class="flex items-center justify-between p-2 rounded border">
                <div class="flex items-center space-x-2">
                  <div class={`w-2 h-2 rounded-full ${getProviderStatusColor(status.status)}`} />
                  <span class="font-medium">{provider}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">{status.status}</span>
                  <Show when={status.error}>
                    <Badge variant="destructive" class="text-xs">
                      Error
                    </Badge>
                  </Show>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => statusMonitor.checkProviderStatus(provider)}
                  >
                    Check
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Feature Status */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Features</h3>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.checkFeatureStatus('all')}
          >
            Refresh All
          </Button>
        </div>
        <div class="space-y-2">
          <For 
            each={Object.entries(statusMonitor.getFeatureStatus()())}
            fallback={
              <div class="text-gray-500 text-sm">No features detected</div>
            }
          >
            {([feature, status]) => (
              <div class="flex items-center justify-between p-2 rounded border">
                <div class="flex items-center space-x-2">
                  <div class={`w-2 h-2 rounded-full ${getFeatureStatusColor(status.enabled, status.working)}`} />
                  <span class="font-medium capitalize">{feature.replace('_', ' ')}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <Show when={status.enabled}>
                    <Badge variant={status.working ? "secondary" : "destructive"} class="text-xs">
                      {status.working ? 'Working' : 'Broken'}
                    </Badge>
                  </Show>
                  <Show when={!status.enabled}>
                    <Badge variant="ghost" class="text-xs">
                      Disabled
                    </Badge>
                  </Show>
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={() => statusMonitor.toggleFeature(feature, !status.enabled)}
                  >
                    {status.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Recent Errors */}
      <Card class="p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold">Recent Errors</h3>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.clearErrors()}
          >
            Clear All
          </Button>
        </div>
        <div class="space-y-2">
          <For 
            each={recentErrors()}
            fallback={
              <div class="text-gray-500 text-sm">No recent errors</div>
            }
          >
            {(error) => (
              <div class="p-2 rounded border border-red-200 bg-red-50">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <Badge variant={error.severity === 'high' ? 'destructive' : 'secondary'} class="text-xs">
                      {error.severity}
                    </Badge>
                    <span class="font-medium">{error.type}</span>
                  </div>
                  <span class="text-xs text-gray-500">
                    {new Date(error.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div class="text-sm text-gray-700 mt-1">{error.message}</div>
              </div>
            )}
          </For>
        </div>
      </Card>

      {/* Debug Actions */}
      <Card class="p-4">
        <h3 class="font-semibold mb-3">Debug Actions</h3>
        <div class="grid grid-cols-2 gap-2">
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.checkFeatureStatus('all')}
          >
            Check All Features
          </Button>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.checkProviderStatus('all')}
          >
            Check All Providers
          </Button>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => statusMonitor.requestStatusUpdate()}
          >
            Refresh Status
          </Button>
          <Button 
            variant="ghost" 
            size="small"
            onClick={() => {
              console.log('Current Status:', statusMonitor.status())
              console.log('Health Score:', healthScore())
              console.log('Is Healthy:', isHealthy())
            }}
          >
            Log to Console
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default StatusPanel
