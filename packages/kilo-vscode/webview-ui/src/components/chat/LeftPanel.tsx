/**
 * LeftPanel component
 * Left sidebar containing voice controls, status indicators, and quick actions
 * Restores missing items that disappeared when Speech was added
 */

import { Component, Show, createSignal, createMemo } from "solid-js"
import { Button } from "@kilocode/kilo-ui/button"
import { Icon } from "@kilocode/kilo-ui/icon"
import { Tooltip } from "@kilocode/kilo-ui/tooltip"
import { Switch } from "@kilocode/kilo-ui/switch"
// import { Badge } from "@kilocode/kilo-ui/badge" // Using fallback div instead
import { useSession } from "../../context/session"
import { useVSCode } from "../../context/vscode"
import { useLanguage } from "../../context/language"
import { useServer } from "../../context/server"
import "./LeftPanel.css"

interface LeftPanelProps {
  onToggleSpeech?: (enabled: boolean) => void
  speechEnabled?: boolean
  isRecording?: boolean
  isSpeaking?: boolean
}

export const LeftPanel: Component<LeftPanelProps> = (props) => {
  const session = useSession()
  const vscode = useVSCode()
  const language = useLanguage()
  const server = useServer()

  // Local state for panel controls
  const [voiceEnabled, setVoiceEnabled] = createSignal(props.speechEnabled ?? false)
  const [expandedStatus, setExpandedStatus] = createSignal(false)

  // Memoized values
  const busy = createMemo(() => session.status() === "busy")
  const hasMessages = createMemo(() => session.messages().length > 0)
  const connectionState = createMemo(() => server.connectionState())
  const worktreeStats = createMemo(() => session.worktreeStats())

  // Speech toggle handler
  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled)
    props.onToggleSpeech?.(enabled)
  }

  // Quick action handlers
  const handleNewTask = () => {
    window.dispatchEvent(new CustomEvent("newTaskRequest"))
  }

  const handleShowChanges = () => {
    vscode.postMessage({ type: "openChanges" })
  }

  const handleSettings = (tab?: string) => {
    // Use window event for navigation instead of direct message
    window.dispatchEvent(new CustomEvent("navigateToSettings", { 
      detail: { tab: tab || "models" } 
    }))
  }

  const handleHistory = () => {
    window.dispatchEvent(new CustomEvent("historyButtonClicked"))
  }

  const handleMarketplace = () => {
    window.dispatchEvent(new CustomEvent("marketplaceButtonClicked"))
  }

  return (
    <div class="left-panel" data-component="left-panel">
      {/* Voice Controls Section */}
      <div class="left-panel-section">
        <div class="left-panel-header">
          <Icon name="speech-bubble" size="small" />
          <span>Voice</span>
          <Tooltip value="Toggle voice controls" placement="right">
            <Switch
              checked={voiceEnabled()}
              onChange={handleVoiceToggle}
              size="small"
            />
          </Tooltip>
        </div>
        
        <Show when={voiceEnabled()}>
          <div class="voice-controls">
            <div class="voice-status">
              <Show when={props.isRecording}>
                <div class="badge badge-destructive text-xs">
                  🔴 Recording
                </div>
              </Show>
              <Show when={props.isSpeaking}>
                <div class="badge badge-secondary text-xs">
                  🔊 Speaking
                </div>
              </Show>
              <Show when={!props.isRecording && !props.isSpeaking}>
                <div class="badge badge-outline text-xs">
                  Ready
                </div>
              </Show>
            </div>
            
            <div class="voice-actions">
              <Tooltip value="Speech Settings" placement="right">
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => handleSettings("speech")}
                  class="voice-action-btn"
                >
                  <Icon name="settings-gear" size="small" />
                </Button>
              </Tooltip>
            </div>
          </div>
        </Show>
      </div>

      {/* Status Section */}
      <div class="left-panel-section">
        <div class="left-panel-header" onClick={() => setExpandedStatus(!expandedStatus())}>
          <Icon name="circle-check" size="small" />
          <span>Status</span>
          <Icon 
            name={expandedStatus() ? "chevron-down" : "chevron-right"} 
            size="small" 
            class="expand-icon"
          />
        </div>
        
        <Show when={expandedStatus()}>
          <div class="status-items">
            <div class="status-item">
              <Tooltip value="Connection status" placement="right">
                <div class="status-indicator">
                  <div class={`status-dot status-${connectionState()}`} />
                  <span class="status-text">
                    {connectionState() === "connected" ? "Connected" : 
                     connectionState() === "connecting" ? "Connecting" : 
                     connectionState() === "error" ? "Error" : "Disconnected"}
                  </span>
                </div>
              </Tooltip>
            </div>
            
            <div class="status-item">
              <Tooltip value="Session status" placement="right">
                <div class="status-indicator">
                  <div class={`status-dot ${busy() ? "busy" : "idle"}`} />
                  <span class="status-text">{busy() ? "Busy" : "Idle"}</span>
                </div>
              </Tooltip>
            </div>
            
            <Show when={hasMessages()}>
              <div class="status-item">
                <Tooltip value="File changes" placement="right">
                  <div class="status-indicator">
                    <div class={`status-dot ${worktreeStats()?.files ? "has-changes" : "no-changes"}`} />
                    <span class="status-text">
                      {worktreeStats()?.files ? 
                        `${worktreeStats()!.files} files changed` : 
                        "No changes"}
                    </span>
                  </div>
                </Tooltip>
              </div>
            </Show>
          </div>
        </Show>
      </div>

      {/* Quick Actions Section */}
      <div class="left-panel-section">
        <div class="left-panel-header">
          <Icon name="code" size="small" />
          <span>Quick Actions</span>
        </div>
        
        <div class="quick-actions">
          <Tooltip value="New conversation" placement="right">
            <Button
              variant="ghost"
              size="small"
              onClick={handleNewTask}
              class="quick-action-btn"
            >
              <Icon name="plus" size="small" />
              <span>New Task</span>
            </Button>
          </Tooltip>
          
          <Tooltip value="View history" placement="right">
            <Button
              variant="ghost"
              size="small"
              onClick={handleHistory}
              class="quick-action-btn"
            >
              <Icon name="history" size="small" />
              <span>History</span>
            </Button>
          </Tooltip>
          
          <Tooltip value="Browse marketplace" placement="right">
            <Button
              variant="ghost"
              size="small"
              onClick={handleMarketplace}
              class="quick-action-btn"
            >
              <Icon name="models" size="small" />
              <span>Market</span>
            </Button>
          </Tooltip>
          
          <Show when={worktreeStats()?.files}>
            <Tooltip value="Show changes" placement="right">
              <Button
                variant="ghost"
                size="small"
                onClick={handleShowChanges}
                class="quick-action-btn"
              >
                <Icon name="layers" size="small" />
                <span>Changes</span>
                <div class="badge badge-secondary text-xs">
                  {worktreeStats()!.files}
                </div>
              </Button>
            </Tooltip>
          </Show>
          
          <Tooltip value="Settings" placement="right">
            <Button
              variant="ghost"
              size="small"
              onClick={() => handleSettings()}
              class="quick-action-btn"
            >
              <Icon name="settings-gear" size="small" />
              <span>Settings</span>
            </Button>
          </Tooltip>
        </div>
      </div>

      {/* Provider Status (if connected) */}
      <Show when={connectionState() === "connected"}>
        <div class="left-panel-section">
          <div class="left-panel-header">
            <Icon name="providers" size="small" />
            <span>Providers</span>
          </div>
          
          <div class="provider-status">
            <div class="provider-item">
              <div class="provider-dot provider-online" />
              <span class="provider-text">Main Provider</span>
            </div>
            <Show when={voiceEnabled()}>
              <div class="provider-item">
                <div class="provider-dot provider-online" />
                <span class="provider-text">Speech</span>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default LeftPanel
